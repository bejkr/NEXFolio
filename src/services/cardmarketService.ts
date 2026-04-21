import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Puppeteer imports
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser } from 'puppeteer';

puppeteer.use(StealthPlugin());

const BASE_URL = 'https://www.cardmarket.com/en/Pokemon';
const CACHE_DIR = path.join(process.cwd(), '.cache', 'scraper');
const PAGE_POOL_SIZE = 3;
const COOKIES_FILE = path.join(process.cwd(), '.cardmarket-cookies.txt');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

export interface Expansion {
    name: string;
    url: string;
}

export interface ParsedProduct {
    externalId: string;
    name: string;
    url: string;
    imageUrl?: string;
    expansionName?: string;
}

export interface CategoryPageResult {
    products: ParsedProduct[];
    hasNextPage: boolean;
}

// Page pool state
let globalBrowser: Browser | null = null;
let pagePool: any[] = [];
let pageIdle: boolean[] = [];
const pageWaiters: Array<() => void> = [];

async function ensurePagePool(browser: Browser): Promise<void> {
    while (pagePool.length < PAGE_POOL_SIZE) {
        const page = await browser.newPage();
        const ua = USER_AGENTS[pagePool.length % USER_AGENTS.length];
        await page.setUserAgent(ua);
        await page.setViewport({ width: 1920, height: 1080 });

        // Inject CF clearance cookie if provided
        const cfClearance = process.env.CF_CLEARANCE;
        if (cfClearance) {
            await page.setCookie({
                name: 'cf_clearance',
                value: cfClearance,
                domain: '.cardmarket.com',
                path: '/',
                httpOnly: true,
                secure: true,
            });
            logger.info('CF clearance cookie injected.');
        }

        pagePool.push(page);
        pageIdle.push(true);
    }
}

async function acquirePage(): Promise<{ page: any; index: number }> {
    const idx = pageIdle.findIndex(idle => idle);
    if (idx !== -1) {
        pageIdle[idx] = false;
        return { page: pagePool[idx], index: idx };
    }
    await new Promise<void>(resolve => pageWaiters.push(resolve));
    return acquirePage();
}

function releasePage(index: number): void {
    pageIdle[index] = true;
    const next = pageWaiters.shift();
    if (next) next();
}

// Flaresolverr persistent session — solve CF once, reuse cookies for all requests
let _flaresSession: string | null = null;
let _flaresSessionAt: number = 0;
const FLARES_SESSION_TTL_MS = 25 * 60 * 1000; // 25 min (cf_clearance ~30 min)

async function getFlaresSession(flaresURL: string): Promise<string | null> {
    const age = Date.now() - _flaresSessionAt;
    if (_flaresSession && age < FLARES_SESSION_TTL_MS) return _flaresSession;

    // Destroy stale session
    if (_flaresSession) {
        try { await axios.post(`${flaresURL}/v1`, { cmd: 'sessions.destroy', session: _flaresSession }, { timeout: 5000 }); } catch {}
        _flaresSession = null;
    }

    try {
        const res = await axios.post(`${flaresURL}/v1`, { cmd: 'sessions.create' }, { timeout: 10000 });
        _flaresSession = res.data?.session ?? null;
        _flaresSessionAt = Date.now();
        if (_flaresSession) logger.info(`[Flaresolverr] Session created: ${_flaresSession}`);
    } catch (e: any) {
        logger.warn(`[Flaresolverr] Session create failed: ${e.message}`);
    }
    return _flaresSession;
}

/**
 * Fetch HTML with 2-tier fallback:
 *   Tier 1 — Flaresolverr session (solve CF once, reuse cookies for all 500+ requests)
 *   Tier 2 — ScrapingBee render_js + premium_proxy (fallback if Flaresolverr unavailable)
 */
async function fetchHtmlWithCookies(url: string, cacheTTLMs: number = 0): Promise<string> {
    // Check cache first
    const cacheKey = Buffer.from(url).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
    const cacheFile = path.join(CACHE_DIR, `${cacheKey}.html`);

    if (fs.existsSync(cacheFile)) {
        const stat = fs.statSync(cacheFile);
        const age = Date.now() - stat.mtimeMs;
        const expired = cacheTTLMs > 0 && age > cacheTTLMs;
        if (!expired) {
            const cached = fs.readFileSync(cacheFile, 'utf-8');
            if (!cached.includes('Just a moment...')) return cached;
        }
        fs.unlinkSync(cacheFile);
    }

    const scrapingBeeKey = process.env.SCRAPINGBEE_KEY;
    const flaresURL = process.env.FLARESOLVERR_URL || 'http://localhost:8191';
    let html: string | null = null;

    // Tier 1: Flaresolverr with persistent session
    // First request solves CF challenge (~11s), subsequent requests reuse cf_clearance cookie (fast)
    try {
        const session = await getFlaresSession(flaresURL);
        logger.info(`[Tier 1] Flaresolverr${session ? ` (session ${session})` : ''}: ${url}`);
        const response = await axios.post(`${flaresURL}/v1`, {
            cmd: 'request.get',
            url,
            maxTimeout: 60000,
            ...(session ? { session } : {}),
        }, { timeout: 75000 });

        const result: string = response.data?.solution?.response ?? '';
        if (response.data?.solution?.status === 200 && result && !result.includes('Just a moment...')) {
            html = result;
        } else {
            logger.warn(`[Tier 1] Flaresolverr status ${response.data?.solution?.status} — escalating`);
            // Invalidate session so next call creates a fresh one
            _flaresSession = null;
        }
    } catch (e: any) {
        logger.warn(`[Tier 1] Flaresolverr failed: ${e.message} — escalating`);
        _flaresSession = null;
    }

    // Tier 2: ScrapingBee — fallback if Flaresolverr is down or blocked
    if (!html && scrapingBeeKey) {
        logger.info(`[Tier 2] ScrapingBee (render_js + premium_proxy): ${url}`);
        const response = await axios.get('https://app.scrapingbee.com/api/v1', {
            params: {
                api_key: scrapingBeeKey,
                url,
                render_js: 'true',
                premium_proxy: 'true',
                country_code: 'de',
            },
            timeout: 60000,
        });
        html = response.data as string;
    }

    if (!html) {
        throw new Error('All fetch tiers failed — start Flaresolverr: docker start flaresolverr');
    }

    if (html.includes('Just a moment...')) {
        throw new Error('Cloudflare challenge not solved — check Flaresolverr logs.');
    }

    // Cache result
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, html);

    return html;
}

export const cardmarketService = {
    async getBrowser(): Promise<Browser> {
        if (!globalBrowser) {
            logger.debug('Launching Puppeteer Stealth Browser...');

            // Use Brave if available – CF trusts it more than headless Chromium
            const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
            const executablePath = fs.existsSync(bravePath) ? bravePath : undefined;
            if (executablePath) {
                logger.info('Using Brave browser for scraping.');
            }

            const braveUserDataDir = `C:\\Users\\${require('os').userInfo().username}\\AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data`;
            const useUserData = executablePath && fs.existsSync(braveUserDataDir) && process.env.BRAVE_PROFILE !== 'false';
            if (useUserData) {
                logger.info(`Using Brave profile from: ${braveUserDataDir}`);
            }

            globalBrowser = await puppeteer.launch({
                headless: false, // visible window – CF trusts non-headless more
                executablePath,
                userDataDir: useUserData ? braveUserDataDir : undefined,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080',
                    '--profile-directory=Default',
                ]
            });
            await ensurePagePool(globalBrowser);
        }
        return globalBrowser;
    },

    async closeBrowser() {
        if (globalBrowser) {
            for (const page of pagePool) {
                try { await page.close(); } catch {}
            }
            pagePool = [];
            pageIdle = [];
            await globalBrowser.close();
            globalBrowser = null;
            logger.debug('Puppeteer Browser closed.');
        }
    },

    async fetchHtml(url: string, useCache: boolean = true, cacheTTLMs: number = 0): Promise<string> {
        const cacheKey = Buffer.from(url).toString('base64').replace(/\//g, '-').replace(/\+/g, '_');
        const cacheFile = path.join(CACHE_DIR, `${cacheKey}.html`);

        if (useCache && process.env.ENABLE_SCRAPER_CACHE === 'true' && fs.existsSync(cacheFile)) {
            const stat = fs.statSync(cacheFile);
            const age = Date.now() - stat.mtimeMs;
            const expired = cacheTTLMs > 0 && age > cacheTTLMs;
            if (!expired) {
                const cachedContent = fs.readFileSync(cacheFile, 'utf-8');
                if (!cachedContent.includes('Just a moment...')) {
                    return cachedContent;
                }
            }
            fs.unlinkSync(cacheFile);
        }

        try {
            logger.info(`Fetching HTML via Puppeteer from ${url}`);
            await this.getBrowser();
            const { page, index } = await acquirePage();

            try {
                // Human-like delay: 6–18s with occasional longer pauses
                const baseDelay = 6000 + Math.random() * 12000;
                const longPause = Math.random() < 0.15 ? 10000 + Math.random() * 20000 : 0; // 15% chance of 10–30s extra pause
                await new Promise(r => setTimeout(r, baseDelay + longPause));

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });

                let html = await page.content();
                const pageTitle = await page.title();

                if (html.includes('Just a moment...') || pageTitle.includes('Just a moment')) {
                    logger.warn(`Cloudflare Challenge detected on ${url}. Waiting up to 60s for auto-pass...`);
                    try {
                        await page.waitForFunction(() => {
                            const text = document.body.innerText;
                            return !text.includes('Just a moment...') && !document.title.includes('Just a moment');
                        }, { timeout: 60000 });
                        logger.info(`Successfully passed Cloudflare challenge for ${url}`);
                        await new Promise(r => setTimeout(r, 2000));
                    } catch (e) {
                        logger.warn(`Timeout or error during CF bypass on ${url}`);
                    }
                }

                // Simulate human scrolling behaviour
                await page.evaluate(() => {
                    window.scrollBy(0, 200 + Math.random() * 600);
                });
                await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
                await page.evaluate(() => {
                    window.scrollBy(0, 100 + Math.random() * 300);
                });

                html = await page.content();

                if (html.includes('Just a moment...')) {
                    throw new Error('Unable to bypass Cloudflare Block - HTML still shows challenge after waiting');
                }

                if (useCache && process.env.ENABLE_SCRAPER_CACHE === 'true') {
                    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
                    fs.writeFileSync(cacheFile, html);
                }

                return html;
            } finally {
                releasePage(index);
            }
        } catch (error: any) {
            logger.error(`Error fetching ${url} via Puppeteer: ${error.message}`);
            throw error;
        }
    },

    async fetchExpansions(): Promise<Expansion[]> {
        const url = `${BASE_URL}/Products/Singles`;
        const html = await this.fetchHtml(url);
        const $ = cheerio.load(html);
        const expansions: Expansion[] = [];

        $('select[name="idExpansion"] option').each((_, el) => {
            const id = $(el).attr('value');
            const name = $(el).text().trim();
            if (id && id !== '0' && name) {
                expansions.push({
                    name,
                    url: `${BASE_URL}/Products/Search?idCategory=0&idExpansion=${id}&mode=list`
                });
            }
        });

        return expansions;
    },

    async fetchProductsByExpansion(expansionUrl: string): Promise<ParsedProduct[]> {
        try {
            const html = await this.fetchHtml(expansionUrl);
            const $ = cheerio.load(html);
            const products: ParsedProduct[] = [];

            $('.table-body > .row[id^="productRow"]').each((_, el) => {
                const nameNode = $(el).find('[data-testid="name"] a');
                const name = nameNode.text().trim();
                const productUrl = nameNode.attr('href') || '';

                let imageUrl = '';
                const previewSpan = $(el).find('[data-testid="preview"] span');
                const dataBsTitle = previewSpan.attr('data-bs-title');
                if (dataBsTitle) {
                    const imgMatch = dataBsTitle.match(/src="([^"]+)"/);
                    if (imgMatch && imgMatch[1]) {
                        imageUrl = imgMatch[1];
                    }
                }

                if (!imageUrl) {
                    const imgNode = $(el).find('.col-icon img');
                    if (imgNode.length > 0) {
                        imageUrl = imgNode.attr('src') || '';
                    } else {
                        const iconSpan = $(el).find('.col-icon span');
                        const onmouseover = iconSpan.attr('onmouseover');
                        if (onmouseover) {
                            const match = onmouseover.match(/src="([^"]+)"/);
                            if (match && match[1]) {
                                imageUrl = match[1].startsWith('//') ? `https:${match[1]}` : match[1];
                            }
                        }
                    }
                }

                const urlParts = productUrl.split('/');
                const externalId = urlParts[urlParts.length - 1] || Buffer.from(productUrl).toString('base64');

                if (name && productUrl) {
                    products.push({
                        externalId,
                        name,
                        url: `${BASE_URL.replace('/en/Pokemon', '')}${productUrl}`,
                        imageUrl: imageUrl.startsWith('/') ? `https://www.cardmarket.com${imageUrl}` : imageUrl
                    });
                }
            });

            return products;
        } catch (error) {
            logger.warn(`Could not fetch products for expansion at ${expansionUrl}`);
            return [];
        }
    },

    filterSealedProducts(products: ParsedProduct[]): ParsedProduct[] {
        const sealedKeywords = [
            'booster box', 'elite trainer box', 'premium collection',
            'collection', 'tin', 'blister', 'special collection',
            'build & battle', 'stadium', 'upc', 'ultra premium',
            'display', 'box'
        ];

        return products.filter(p => {
            const lowercaseName = p.name.toLowerCase();
            return sealedKeywords.some(keyword => lowercaseName.includes(keyword));
        });
    },

    async fetchCategoryGridPage(pageUrl: string): Promise<CategoryPageResult> {
        try {
            const html = await this.fetchHtml(pageUrl, false);
            const $ = cheerio.load(html);
            const products: ParsedProduct[] = [];

            $('.galleryBox').each((_, el) => {
                const link = $(el).attr('href') || '';
                const imgEl = $(el).find('img');
                const name = imgEl.attr('alt') || '';
                let imageUrl = imgEl.attr('data-echo') || imgEl.attr('src') || '';

                if (imageUrl.includes('transparent.gif') && imgEl.attr('data-echo')) {
                    imageUrl = imgEl.attr('data-echo')!;
                }

                const expansionName = $(el).find('.expansion-symbol').attr('aria-label') || '';
                const urlParts = link.split('/');
                const externalId = urlParts[urlParts.length - 1] || Buffer.from(link).toString('base64');

                if (name && link) {
                    products.push({
                        externalId,
                        name,
                        url: `${BASE_URL.replace('/en/Pokemon', '')}${link}`,
                        imageUrl: imageUrl.startsWith('/') ? `https://www.cardmarket.com${imageUrl}` : imageUrl,
                        expansionName
                    });
                }
            });

            const nextButton = $('a[data-direction="next"]');
            const hasNextPage = nextButton.length > 0 && !nextButton.hasClass('disabled');

            return { products, hasNextPage };
        } catch (error) {
            logger.warn(`Could not fetch category page at ${pageUrl}`);
            return { products: [], hasNextPage: false };
        }
    },

    /**
     * Scrape category listing page (list view) – returns From price + availability for all products on the page.
     * Much more efficient than visiting individual product pages.
     */
    async fetchCategoryListPage(pageUrl: string): Promise<{
        products: Array<{ externalId: string; name: string; url: string; fromPrice: number; available: number }>;
        hasNextPage: boolean;
    }> {
        try {
            const ONE_HOUR = 60 * 60 * 1000;
            const html = await fetchHtmlWithCookies(pageUrl, ONE_HOUR);
            const $ = cheerio.load(html);
            const products: Array<{ externalId: string; name: string; url: string; fromPrice: number; available: number }> = [];

            const parsePriceString = (str: string) => {
                let clean = str.replace(/[€$£]/g, '').trim().replace(/\s/g, '');
                const lastComma = clean.lastIndexOf(',');
                const lastDot = clean.lastIndexOf('.');
                if (lastComma > lastDot) clean = clean.replace(/\./g, '').replace(',', '.');
                else if (lastDot > lastComma) clean = clean.replace(/,/g, '');
                else if (lastComma !== -1 && lastDot === -1) clean = clean.replace(',', '.');
                return parseFloat(clean) || 0;
            };

            // List view: table rows
            $('table tbody tr, .table-body .row').each((_, row) => {
                const $row = $(row);

                // Find the product link
                const link = $row.find('a[href*="/Products/"]');
                if (link.length === 0) return;

                const name = link.text().trim();
                const href = link.attr('href') || '';
                if (!name || !href) return;

                const urlParts = href.split('/');
                const externalId = urlParts[urlParts.length - 1] || '';

                // Find available count and from price from table cells or spans
                const cells = $row.find('td');
                let available = 0;
                let fromPrice = 0;

                if (cells.length >= 2) {
                    // Table layout: last cell = price, second to last = available
                    const priceText = cells.last().text().trim();
                    const availText = cells.eq(cells.length - 2).text().trim();
                    fromPrice = parsePriceString(priceText);
                    available = parseInt(availText.replace(/\D/g, '')) || 0;
                }

                // Fallback: try to find price from any text containing €
                if (fromPrice === 0) {
                    const priceMatch = $row.text().match(/(\d[\d.,]*)\s*€/);
                    if (priceMatch) fromPrice = parsePriceString(priceMatch[1] + ' €');
                }

                if (name && externalId && fromPrice > 0) {
                    products.push({
                        externalId,
                        name,
                        url: href.startsWith('http') ? href : `https://www.cardmarket.com${href}`,
                        fromPrice,
                        available,
                    });
                }
            });

            // Grid view fallback: also parse .galleryBox items for From price
            if (products.length === 0) {
                $('.galleryBox, [class*="product-card"]').each((_, el) => {
                    const $el = $(el);
                    const link = $el.is('a') ? $el : $el.find('a').first();
                    const href = link.attr('href') || '';
                    const name = $el.find('img').attr('alt') || link.text().trim();
                    const urlParts = href.split('/');
                    const externalId = urlParts[urlParts.length - 1] || '';

                    const priceMatch = $el.text().match(/(?:From\s+)?(\d[\d.,]*)\s*€/i);
                    const fromPrice = priceMatch ? parsePriceString(priceMatch[1] + ' €') : 0;

                    if (name && externalId && fromPrice > 0) {
                        products.push({
                            externalId,
                            name,
                            url: href.startsWith('http') ? href : `https://www.cardmarket.com${href}`,
                            fromPrice,
                            available: 0,
                        });
                    }
                });
            }

            const nextButton = $('a[data-direction="next"]');
            const hasNextPage = nextButton.length > 0 && !nextButton.hasClass('disabled');

            return { products, hasNextPage };
        } catch (error) {
            logger.warn(`Could not fetch category list page at ${pageUrl}`);
            return { products: [], hasNextPage: false };
        }
    },

    async fetchProductDetails(productUrl: string): Promise<{ trendPrice?: number, fromPrice?: number, oneDayAvg?: number, sevenDayAvg?: number, thirtyDayAvg?: number, availableItems?: number }> {
        const urlToFetch = productUrl.includes('?')
            ? `${productUrl}&language=1`
            : `${productUrl}?language=1`;

        try {
            // Cache price pages for 1 hour to avoid redundant scraping
            const ONE_HOUR = 60 * 60 * 1000;
            const html = await fetchHtmlWithCookies(urlToFetch, ONE_HOUR);
            const $ = cheerio.load(html);

            let trendPrice: number | undefined;
            let fromPrice: number | undefined;
            let oneDayAvg: number | undefined;
            let sevenDayAvg: number | undefined;
            let thirtyDayAvg: number | undefined;
            let availableItems: number | undefined;

            const parsePriceString = (str: string) => {
                let clean = str.replace(/[€$£]/g, '').trim().replace(/\s/g, '');
                const lastComma = clean.lastIndexOf(',');
                const lastDot = clean.lastIndexOf('.');

                if (lastComma > lastDot) {
                    clean = clean.replace(/\./g, '').replace(',', '.');
                } else if (lastDot > lastComma) {
                    clean = clean.replace(/,/g, '');
                } else if (lastComma !== -1 && lastDot === -1) {
                    clean = clean.replace(',', '.');
                }

                const parsed = parseFloat(clean);
                if (isNaN(parsed)) {
                    logger.warn(`Failed to parse price string: "${str}"`);
                    return undefined;
                }
                return parsed;
            };

            $('.info-list-container dl').each((_, dl) => {
                $(dl).find('dt').each((i, dt) => {
                    const label = $(dt).text().trim();
                    const dd = $(dt).next('dd');
                    const value = $(dd).text().trim();

                    if (label.includes('Trend Price') || label.includes('Price Trend')) trendPrice = parsePriceString(value);
                    if (label.toLowerCase().includes('from')) fromPrice = parsePriceString(value);
                    if (label.includes('1-day average price') || label.includes('1-days average price')) oneDayAvg = parsePriceString(value);
                    if (label.includes('7-day average price') || label.includes('7-days average price')) sevenDayAvg = parsePriceString(value);
                    if (label.includes('30-day average price') || label.includes('30-days average price')) thirtyDayAvg = parsePriceString(value);
                    if (label.toLowerCase().includes('available items') ||
                        label.toLowerCase().includes('available product') ||
                        label.toLowerCase().includes('number of items') ||
                        label.toLowerCase().includes('items available')) {
                        availableItems = parseInt(value.replace(/\D/g, ''));
                    }
                });
            });

            return { trendPrice, fromPrice, oneDayAvg, sevenDayAvg, thirtyDayAvg, availableItems };
        } catch (error: any) {
            const status = error.response?.statusCode || error.response?.status || 'N/A';
            logger.warn(`Could not fetch product details for ${urlToFetch} — HTTP ${status}: ${error.message}`);
            return {};
        }
    }
};
