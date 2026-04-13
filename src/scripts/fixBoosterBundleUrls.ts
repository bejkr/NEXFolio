/**
 * Fix Booster Bundle URLs
 *
 * Problem: /Products/Booster-Bundles/[slug] redirects to main Products page → no price data.
 *
 * Strategy:
 *   1. For each DB Booster Bundle, try candidate URLs across multiple categories
 *   2. First hit that returns a real product page (has info-list-container) = correct URL
 *   3. Save to cardmarketUrl in DB
 */

import prisma from '../../lib/prisma';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const COOKIES_FILE = path.join(process.cwd(), '.cardmarket-cookies.txt');
const UA_FILE = path.join(process.cwd(), '.cardmarket-ua.txt');
const CACHE_DIR = path.join(process.cwd(), '.cache', 'url-fix');
const BASE = 'https://www.cardmarket.com/en/Pokemon/Products';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Fetch ────────────────────────────────────────────────────────────────────

function getHeaders(): Record<string, string> {
    const cookieString = fs.existsSync(COOKIES_FILE)
        ? fs.readFileSync(COOKIES_FILE, 'utf-8').trim()
        : process.env.CM_COOKIES || '';

    if (!cookieString) throw new Error('No cookies. Run: npm run sync:cardmarket:cookies');

    const userAgent = fs.existsSync(UA_FILE)
        ? fs.readFileSync(UA_FILE, 'utf-8').trim()
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';

    return {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': cookieString,
        'Referer': 'https://www.cardmarket.com/en/Pokemon',
    };
}

async function fetchHtml(url: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
        const res = await fetch(url, { signal: controller.signal, headers: getHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.text();
    } finally {
        clearTimeout(timeout);
    }
}

function isRealProductPage(html: string): boolean {
    return html.includes('info-list-container') && (
        html.includes('Trend Price') || html.includes('Price Trend') || html.includes('Available')
    );
}

function isRedirectPage(html: string): boolean {
    // Detects landing on the main Products page or Booster-Bundles category listing
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    return (
        title === 'Products (Pokémon) | Cardmarket' ||
        title === 'Booster Bundles (Pokémon) | Cardmarket' ||
        title === 'Sealed Products (Pokémon) | Cardmarket' ||
        (html.includes('Just a moment') || html.includes('cf-browser-verification'))
    );
}

// ─── URL candidates ───────────────────────────────────────────────────────────

const CANDIDATE_CATEGORIES = [
    'Booster-Bundles',
    'Sealed-Products',
    'Booster-Boxes',
    'Box-Sets',
];

function buildCandidates(externalId: string): string[] {
    const candidates: string[] = [];
    for (const cat of CANDIDATE_CATEGORIES) {
        candidates.push(`${BASE}/${cat}/${externalId}?language=1`);
    }
    // Also try search
    const searchName = externalId.replace(/-/g, '+');
    candidates.push(`https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${searchName}&idCategory=3&mode=list`);
    return candidates;
}

async function findCorrectUrl(product: { name: string; externalId: string }): Promise<string | null> {
    const cacheFile = path.join(CACHE_DIR, `${product.externalId}.found.txt`);
    if (fs.existsSync(cacheFile)) {
        const cached = fs.readFileSync(cacheFile, 'utf-8').trim();
        if (cached) {
            console.log(`    [cache] ${cached}`);
            return cached;
        }
    }

    const candidates = buildCandidates(product.externalId);

    for (const url of candidates) {
        try {
            await delay(1500);
            const html = await fetchHtml(url);

            if (isRealProductPage(html)) {
                // Strip ?language=1 for storage, we'll add it on fetch
                const cleanUrl = url.replace('?language=1', '');
                console.log(`    ✅ Found: ${cleanUrl}`);
                if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
                fs.writeFileSync(cacheFile, cleanUrl);
                return cleanUrl;
            }

            if (url.includes('Search')) {
                // Parse search results for a matching product link
                const found = parseSearchResult(html, product.name);
                if (found) {
                    console.log(`    ✅ Found via search: ${found}`);
                    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
                    fs.writeFileSync(cacheFile, found);
                    return found;
                }
            }

            const $ = cheerio.load(html);
            const title = $('title').text().trim();
            console.log(`    ✗ ${url.substring(url.indexOf('/Products/'), url.indexOf('?') > 0 ? url.indexOf('?') : undefined)} → "${title}"`);
        } catch (err: any) {
            console.log(`    ✗ ${url.substring(0, 80)} → ${err.message}`);
        }
    }

    return null;
}

function parseSearchResult(html: string, productName: string): string | null {
    const $ = cheerio.load(html);

    // Cardmarket search results use table rows with product links
    let bestHref: string | null = null;
    let bestScore = 0;

    $('a[href*="/Products/"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const text = $(el).text().trim();
        if (!href.includes('/Products/') || href.includes('?site=')) return;
        // Must be a product URL (not category)
        const parts = href.split('/').filter(Boolean);
        if (parts.length < 5) return; // /en/Pokemon/Products/Category/Product

        const score = nameSimilarity(productName, text || href.split('/').pop()!.replace(/-/g, ' '));
        if (score > bestScore) {
            bestScore = score;
            bestHref = href;
        }
    });

    if (bestHref && bestScore >= 0.6) {
        const href = bestHref as string;
        return href.startsWith('http') ? href : `https://www.cardmarket.com${href}`;
    }
    return null;
}

function nameSimilarity(a: string, b: string): number {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const na = norm(a), nb = norm(b);
    if (na === nb) return 1.0;
    const wa = new Set(na.split(' '));
    const wb = new Set(nb.split(' '));
    const intersection = [...wa].filter(w => wb.has(w)).length;
    return intersection / Math.max(wa.size, wb.size);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   Fix Booster Bundle cardmarketUrls        ║');
    console.log('╚═══════════════════════════════════════════╝\n');

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: 'Booster Bundle' } },
                { externalId: { contains: 'Booster-Bundle' } },
                // Also include other circuit-breaker candidates
                { name: { contains: 'Sleeved Booster' } },
            ]
        },
        select: { id: true, name: true, externalId: true, cardmarketUrl: true }
    });

    const toFix = products.filter(p => !(p as any).cardmarketUrl);
    console.log(`Total Booster Bundle products: ${products.length}`);
    console.log(`Need URL fix: ${toFix.length}\n`);

    if (toFix.length === 0) {
        console.log('Nothing to fix!');
        await prisma.$disconnect();
        return;
    }

    console.log(`Trying ${CANDIDATE_CATEGORIES.length} category URLs + search for each product...\n`);

    let fixed = 0, failed = 0;
    const failures: string[] = [];

    for (let i = 0; i < toFix.length; i++) {
        const p = toFix[i];
        console.log(`[${i + 1}/${toFix.length}] ${p.name}`);

        const url = await findCorrectUrl(p);

        if (url) {
            await prisma.product.update({
                where: { id: p.id },
                data: { cardmarketUrl: url } as any
            });
            fixed++;
        } else {
            failures.push(p.name);
            failed++;
        }

        // Rate limit
        if (i < toFix.length - 1) await delay(1000);
    }

    console.log('\n════ Summary ════');
    console.log(`  ✅ Fixed:   ${fixed}/${toFix.length}`);
    console.log(`  ❌ Failed:  ${failed}`);
    if (failures.length) {
        console.log('\n  Still unresolved:');
        failures.forEach(n => console.log(`    - ${n}`));
        console.log('\n  For these, set cardmarketUrl manually in the DB.');
    }

    if (fixed > 0) {
        console.log('\n  Run next: npm run sync:cardmarket:prices');
    }

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
