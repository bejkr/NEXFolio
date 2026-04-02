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

// Global browser instance to reuse across requests
let globalBrowser: Browser | null = null;

export const cardmarketService = {
    async getBrowser(): Promise<Browser> {
        if (!globalBrowser) {
            logger.debug('Launching Puppeteer Stealth Browser...');
            globalBrowser = await puppeteer.launch({
                headless: false, // Visible for debugging if needed, usually true for prod
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080'
                ]
            });
        }
        return globalBrowser;
    },

    async closeBrowser() {
        if (globalBrowser) {
            await globalBrowser.close();
            globalBrowser = null;
            logger.debug('Puppeteer Browser closed.');
        }
    },

    async fetchHtml(url: string, useCache: boolean = true): Promise<string> {
        const cacheKey = Buffer.from(url).toString('base64');
        const cacheFile = path.join(CACHE_DIR, `${cacheKey}.html`);

        if (useCache && process.env.ENABLE_SCRAPER_CACHE === 'true' && fs.existsSync(cacheFile)) {
            const cachedContent = fs.readFileSync(cacheFile, 'utf-8');
            // Check if what we cached was a Cloudflare "Just a moment" page
            if (!cachedContent.includes('Just a moment...')) {
                logger.debug(`Using valid cached HTML for ${url}`);
                return cachedContent;
            } else {
                logger.debug(`Cached HTML for ${url} was a Cloudflare challenge. Refetching...`);
                fs.unlinkSync(cacheFile); // Delete broken cache
            }
        }

        try {
            logger.info(`Fetching HTML via Puppeteer from ${url}`);
            const browser = await this.getBrowser();
            const page = await browser.newPage();

            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1920, height: 1080 });

            logger.debug(`Navigating...`);
            // We do not await domcontentloaded immediately if CF intercepts, we just wait for network idle
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

            const pageTitle = await page.title();
            if (pageTitle.includes('Just a moment') || pageTitle.includes('Cloudflare')) {
                logger.warn(`Cloudflare Challenge detected on ${url}. Waiting for auto-pass...`);
                try {
                    // Cardmarket usually renders .table-body when products load, or h1 for expansions
                    await page.waitForSelector('h1', { timeout: 30000 });
                    logger.info(`Successfully passed Cloudflare challenge for ${url}`);
                } catch (e) {
                    logger.warn(`Timeout waiting for CF bypass on ${url}`);
                }
            }

            // Scroll down slightly to trigger lazy loaded images
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await new Promise(r => setTimeout(r, 2000)); // Wait for lazy load

            const html = await page.content();

            if (html.includes('Just a moment...')) {
                await page.close();
                throw new Error("Unable to bypass Cloudflare Block - HTML still shows challenge");
            }

            if (process.env.ENABLE_SCRAPER_CACHE === 'true') {
                if (!fs.existsSync(CACHE_DIR)) {
                    fs.mkdirSync(CACHE_DIR, { recursive: true });
                }
                fs.writeFileSync(cacheFile, html);
            }

            await page.close();
            return html;
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
                // Return search URL that queries all products within expansion and returns them in a list
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

            // Actual DOM structure on Search Results list view
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
                    // Fallback just in case
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

                // Extract expansion name from the tooltip aria-label
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

            // Check if there's a next page button that is NOT disabled
            const nextButton = $('a[data-direction="next"]');
            const hasNextPage = nextButton.length > 0 && !nextButton.hasClass('disabled');

            return { products, hasNextPage };
        } catch (error) {
            logger.warn(`Could not fetch category page at ${pageUrl}`);
            return { products: [], hasNextPage: false };
        }
    },

    async fetchProductDetails(productUrl: string): Promise<{ trendPrice?: number, fromPrice?: number, thirtyDayAvg?: number }> {
        // Enforce English language filter
        const urlToFetch = productUrl.includes('?') 
            ? `${productUrl}&language=1` 
            : `${productUrl}?language=1`;
            
        try {
            const html = await this.fetchHtml(urlToFetch, false); // Do not cache prices permanently
            const $ = cheerio.load(html);
            
            let trendPrice: number | undefined;
            let fromPrice: number | undefined;
            let thirtyDayAvg: number | undefined;

            const parsePriceString = (str: string) => {
                // Remove currency symbol and decode special spaces, then replace comma with dot
                const clean = str.replace(/[€$£]/g, '').trim().replace(/\s/g, '').replace(',', '.');
                const parsed = parseFloat(clean);
                return isNaN(parsed) ? undefined : parsed;
            };

            $('.info-list-container dl').each((_, dl) => {
                $(dl).find('dt').each((i, dt) => {
                    const label = $(dt).text().trim();
                    const dd = $(dt).next('dd');
                    const value = $(dd).text().trim();
                    
                    if (label.includes('Trend Price')) trendPrice = parsePriceString(value);
                    if (label.includes('From')) fromPrice = parsePriceString(value);
                    if (label.includes('30-days average price')) thirtyDayAvg = parsePriceString(value);
                });
            });

            return { trendPrice, fromPrice, thirtyDayAvg };
        } catch (error) {
            logger.warn(`Could not fetch product details for ${urlToFetch}`);
            return {};
        }
    }
};
