import prisma from '../../lib/prisma';
import { cardmarketService } from '../services/cardmarketService';
import { PriceEngine } from '../services/priceEngine';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Bulk Cardmarket sync — optimized approach:
 *
 * Phase 1: Scrape category listing pages (~20 requests) → From price + availability for ALL products
 * Phase 2: Scrape detail pages ONLY for portfolio products (~14 requests) → trend/averages
 *
 * Total: ~35 requests instead of 524 individual product page loads.
 */

const BASE_URL = 'https://www.cardmarket.com/en/Pokemon';
const REPORT_DIR = path.join(process.cwd(), '.cache', 'reports');

const SEALED_CATEGORIES = [
    'Booster-Boxes', // includes Booster Bundles on Cardmarket
    'Elite-Trainer-Boxes',
    'Tins',
    'Box-Sets',
    'Blister-Packs',
];

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function formatDuration(ms: number): string {
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    const m = Math.floor(ms / 60_000);
    const s = Math.round((ms % 60_000) / 1000);
    return `${m}m ${s}s`;
}

async function fetchWithRetry(operation: () => Promise<any>, retries = 2): Promise<any> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries > 0) {
            logger.warn(`Retrying... attempts left: ${retries - 1}. Waiting 15s.`);
            await delay(15000);
            return fetchWithRetry(operation, retries - 1);
        }
        throw error;
    }
}

// ─── Phase 1: Bulk category scraping ──────────────────────────────────────────
async function phase1_scrapeCategories(): Promise<Map<string, { name: string; url: string; fromPrice: number; available: number }>> {
    logger.info('═══ Phase 1: Scraping category listing pages ═══');

    const allProducts = new Map<string, { name: string; url: string; fromPrice: number; available: number }>();
    let totalPages = 0;

    for (const category of SEALED_CATEGORIES) {
        let page = 1;
        let hasMore = true;

        logger.info(`  📂 Category: ${category}`);

        while (hasMore) {
            const url = page === 1
                ? `${BASE_URL}/Products/${category}`
                : `${BASE_URL}/Products/${category}?site=${page}`;

            logger.info(`    Page ${page}: ${url}`);

            try {
                const result = await fetchWithRetry(() =>
                    cardmarketService.fetchCategoryListPage(url)
                );

                for (const p of result.products) {
                    allProducts.set(p.externalId, p);
                }

                logger.info(`    → ${result.products.length} products found (total: ${allProducts.size})`);

                hasMore = result.hasNextPage;
                totalPages++;
                page++;
            } catch (error: any) {
                logger.error(`    ❌ Failed: ${error.message}`);
                hasMore = false;
            }
        }
    }

    logger.info(`  ✅ Phase 1 done: ${allProducts.size} products from ${totalPages} pages\n`);
    return allProducts;
}

// ─── Phase 2: Detail pages for portfolio products ─────────────────────────────
async function phase2_fetchPortfolioDetails(
    portfolioProductIds: Set<string>,
    dbProducts: any[]
): Promise<Map<string, { trendPrice?: number; fromPrice?: number; sevenDayAvg?: number; thirtyDayAvg?: number; oneDayAvg?: number; availableItems?: number }>> {
    const details = new Map<string, any>();

    const portfolioProducts = dbProducts.filter(p => portfolioProductIds.has(p.id));

    if (portfolioProducts.length === 0) {
        logger.info('═══ Phase 2: No portfolio products — skipping detail fetch ═══\n');
        return details;
    }

    logger.info(`═══ Phase 2: Fetching details for ${portfolioProducts.length} portfolio products ═══`);

    let i = 0;
    for (const product of portfolioProducts) {
        i++;
        let productUrl = (product as any).cardmarketUrl;
        if (!productUrl) {
            const ext = product.externalId.toLowerCase();
            let cat = 'Booster-Boxes';
            if (ext.includes('elite-trainer-box') || ext.includes('etb')) cat = 'Elite-Trainer-Boxes';
            else if (ext.includes('ultra-premium') || ext.includes('upc')) cat = 'Box-Sets';
            else if (ext.includes('premium-collection')) cat = 'Box-Sets';
            else if (ext.includes('special-collection')) cat = 'Box-Sets';
            else if (ext.includes('collection-box')) cat = 'Box-Sets';
            else if (ext.split('-').some((w: string) => w === 'tin' || w === 'tins')) cat = 'Tins';
            else if (ext.includes('blister')) cat = 'Blister-Packs';
            // Note: Booster Bundles are listed under Booster-Boxes on Cardmarket
            else if (ext.includes('box') && !ext.includes('booster')) cat = 'Box-Sets';
            productUrl = `https://www.cardmarket.com/en/Pokemon/Products/${cat}/${product.externalId}`;
        }

        logger.info(`  [${i}/${portfolioProducts.length}] ★ ${product.name}`);

        try {
            const rawDetails = await fetchWithRetry(() =>
                cardmarketService.fetchProductDetails(productUrl)
            );

            details.set(product.id, rawDetails);
            logger.info(`    trend=${rawDetails.trendPrice?.toFixed(2) ?? 'N/A'} | 7d=${rawDetails.sevenDayAvg?.toFixed(2) ?? 'N/A'} | 30d=${rawDetails.thirtyDayAvg?.toFixed(2) ?? 'N/A'}`);
        } catch (error: any) {
            logger.error(`    ❌ Failed: ${error.message}`);
        }
    }

    logger.info(`  ✅ Phase 2 done: ${details.size}/${portfolioProducts.length} fetched\n`);
    return details;
}

// ─── Phase 3: Update database ─────────────────────────────────────────────────
async function phase3_updateDatabase(
    bulkData: Map<string, { name: string; url: string; fromPrice: number; available: number }>,
    detailData: Map<string, any>,
    portfolioProductIds: Set<string>,
    dbProducts: any[]
) {
    logger.info('═══ Phase 3: Updating database ═══');

    let updatedFromPrice = 0;
    let updatedDetailed = 0;
    let skipped = 0;

    for (const product of dbProducts) {
        const bulk = bulkData.get(product.externalId);
        const detail = detailData.get(product.id);

        if (detail) {
            // Portfolio product: use PriceEngine with full metrics
            const computed = PriceEngine.compute(detail, product.price);

            if (computed.bestPrice && computed.reason !== 'no_valid_price_found') {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        price: computed.bestPrice,
                        trendPrice: detail.trendPrice ?? null,
                        fromPrice: detail.fromPrice ?? bulk?.fromPrice ?? null,
                        oneDayAvg: detail.oneDayAvg ?? null,
                        sevenDayAvg: detail.sevenDayAvg ?? null,
                        thirtyDayAvg: detail.thirtyDayAvg ?? null,
                        availabilityCount: detail.availableItems ?? bulk?.available ?? null,
                        priceSource: 'cardmarket_bulk_detail',
                        priceReason: computed.reason,
                        lastPriceSync: new Date(),
                    } as any
                });

                await updatePriceHistory(product.id, computed.bestPrice!, detail.availableItems);
                await prisma.userAsset.updateMany({
                    where: { productId: product.id },
                    data: { currentValue: computed.bestPrice! }
                });

                updatedDetailed++;
                logger.info(`  ★ ${product.name} → ${computed.bestPrice?.toFixed(2)} € [detailed]`);
            }
        } else if (bulk) {
            // Non-portfolio product: use From price from category listing
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    fromPrice: bulk.fromPrice,
                    availabilityCount: bulk.available,
                    priceSource: 'cardmarket_bulk_listing',
                    lastPriceSync: new Date(),
                    // Only update main price if we don't have a better one
                    ...(product.price === null || product.price === 0
                        ? { price: bulk.fromPrice, priceReason: 'from_price_bulk' as any }
                        : {}
                    ),
                } as any
            });

            await updatePriceHistory(product.id, bulk.fromPrice, bulk.available);

            updatedFromPrice++;
        } else {
            skipped++;
        }
    }

    logger.info(`  ✅ Phase 3 done:`);
    logger.info(`    ★ Detailed (portfolio): ${updatedDetailed}`);
    logger.info(`    📋 From price (bulk):    ${updatedFromPrice}`);
    logger.info(`    ⏭  Skipped:              ${skipped}`);
}

async function updatePriceHistory(productId: string, price: number, available?: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.priceHistory.findFirst({
        where: { productId, date: { gte: today } }
    });

    if (existing) {
        await prisma.priceHistory.update({
            where: { id: existing.id },
            data: { price, availabilityCount: available, date: new Date() }
        });
    } else {
        await prisma.priceHistory.create({
            data: { productId, price, availabilityCount: available, date: new Date() }
        });
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    const syncStart = Date.now();
    logger.info('╔══════════════════════════════════════════════════╗');
    logger.info('║   Cardmarket Bulk Sync (optimized ~35 requests) ║');
    logger.info('╚══════════════════════════════════════════════════╝\n');

    try {
        // Load DB products and portfolio
        const dbProducts = await prisma.product.findMany();
        const portfolioAssets = await prisma.userAsset.findMany({
            select: { productId: true },
            distinct: ['productId']
        });
        const portfolioProductIds = new Set(portfolioAssets.map(a => a.productId).filter((id): id is string => id !== null));

        logger.info(`DB: ${dbProducts.length} products | Portfolio: ${portfolioProductIds.size} products\n`);

        // Phase 1: Bulk scrape category listing pages
        const bulkData = await phase1_scrapeCategories();

        // Phase 2: Detail pages only for portfolio products
        const detailData = await phase2_fetchPortfolioDetails(portfolioProductIds, dbProducts);

        // Phase 3: Update database
        await phase3_updateDatabase(bulkData, detailData, portfolioProductIds, dbProducts);

        // Write report
        if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
        const reportDate = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const reportFile = path.join(REPORT_DIR, `bulk-sync-${reportDate}.json`);
        fs.writeFileSync(reportFile, JSON.stringify({
            syncedAt: new Date().toISOString(),
            durationMs: Date.now() - syncStart,
            phase1_products: bulkData.size,
            phase2_detailed: detailData.size,
            totalDbProducts: dbProducts.length,
            portfolioProducts: portfolioProductIds.size,
        }, null, 2));

        logger.info(`\n════ Sync completed in ${formatDuration(Date.now() - syncStart)} ════`);
        logger.info(`📄 Report: ${reportFile}`);

    } catch (error) {
        logger.error('Fatal error during bulk sync', error);
    } finally {
        await prisma.$disconnect();
        await cardmarketService.closeBrowser();
    }
}

main();
