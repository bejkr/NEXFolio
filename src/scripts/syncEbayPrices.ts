import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { EbayClient } from '../../lib/ebay';
import { logger } from '../utils/logger';
import { delay } from '../utils/delay';
import pLimit from 'p-limit';
import * as fs from 'fs';
import * as path from 'path';

// ─── Config ───────────────────────────────────────────────────────────────────
const CONCURRENCY = 3; // eBay API má vyššie rate limity
const PRICE_CHANGE_THRESHOLD = 0.005; // 0.5%
const CHECKPOINT_FILE = path.join(process.cwd(), '.cache', 'ebay-checkpoint.json');
const REPORT_DIR = path.join(process.cwd(), '.cache', 'reports');

// eBay marketplace pre EUR ceny (DE = najväčší EU trh pre Pokémon)
const EBAY_MARKETPLACE = process.env.EBAY_MARKETPLACE || 'EBAY_DE';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductReport {
    name: string;
    priceBefore: number | null;
    priceAfter: number | null;
    listingsUsed: number;
    status: 'success' | 'unchanged' | 'failed' | 'no_results';
    durationMs: number;
}

interface SyncCheckpoint {
    startedAt: string;
    processedIds: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(ms: number): string {
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    const m = Math.floor(ms / 60_000);
    const s = Math.round((ms % 60_000) / 1000);
    return `${m}m ${s}s`;
}

function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
}

function loadCheckpoint(): SyncCheckpoint | null {
    if (!fs.existsSync(CHECKPOINT_FILE)) return null;
    try { return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8')); } catch { return null; }
}

function saveCheckpoint(cp: SyncCheckpoint) {
    const dir = path.dirname(CHECKPOINT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(cp, null, 2));
}

function clearCheckpoint() {
    if (fs.existsSync(CHECKPOINT_FILE)) fs.unlinkSync(CHECKPOINT_FILE);
}

// ─── Price fetch ──────────────────────────────────────────────────────────────
async function fetchEbayPrice(
    ebay: EbayClient,
    productName: string
): Promise<{ price: number; listingsUsed: number } | null> {
    // Try with "sealed" qualifier first, fallback to plain name
    const queries = [
        `${productName} Pokemon sealed new`,
        `${productName} Pokemon TCG`,
    ];

    for (const query of queries) {
        const results = await ebay.searchItems(query, {
            limit: 10,
            marketplace: EBAY_MARKETPLACE,
            conditionFilter: 'NEW', // Only sealed/new items
        });

        if (!results.itemSummaries || results.itemSummaries.length === 0) continue;

        const prices = results.itemSummaries
            .map(item => parseFloat(item.price.value))
            .filter(p => !isNaN(p) && p > 0);

        if (prices.length === 0) continue;

        // Use median to avoid outliers (single extremely cheap/expensive listing)
        const price = Math.round(median(prices) * 100) / 100;
        return { price, listingsUsed: prices.length };
    }

    return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    logger.info('=== eBay Price Sync (v2) ===');

    const force = process.argv.includes('--force');
    const resume = process.argv.includes('--resume');

    if (force) logger.info('Force sync enabled.');
    if (resume) logger.info('Resume mode enabled.');

    const checkpoint = resume ? loadCheckpoint() : null;
    const alreadyProcessed = new Set(checkpoint?.processedIds ?? []);
    if (checkpoint) {
        logger.info(`Resuming from checkpoint (${alreadyProcessed.size} already done)`);
    }

    const prisma = new PrismaClient();
    const ebay = new EbayClient();

    try {
        const allProducts = await prisma.product.findMany();

        if (allProducts.length === 0) {
            logger.warn('No products found in DB.');
            return;
        }

        // Prioritize portfolio products
        const portfolioIds = new Set(
            (await prisma.userAsset.findMany({ select: { productId: true }, distinct: ['productId'] }))
                .map(a => a.productId)
        );

        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const toProcess = allProducts
            .filter(p => force || !p.lastPriceSync || p.lastPriceSync <= twelveHoursAgo)
            .filter(p => !alreadyProcessed.has(p.id))
            .sort((a, b) => (portfolioIds.has(a.id) ? 0 : 1) - (portfolioIds.has(b.id) ? 0 : 1));

        const skippedFresh = allProducts.length - toProcess.length - alreadyProcessed.size;
        const total = toProcess.length;

        logger.info(`Found ${allProducts.length} products total.`);
        if (skippedFresh > 0) logger.info(`  ⏭  Skipping ${skippedFresh} recently synced.`);
        if (alreadyProcessed.size > 0) logger.info(`  ⏭  Skipping ${alreadyProcessed.size} from checkpoint.`);
        logger.info(`  📋 Processing ${total} products (${portfolioIds.size} portfolio-priority)`);

        const currentCheckpoint: SyncCheckpoint = {
            startedAt: checkpoint?.startedAt ?? new Date().toISOString(),
            processedIds: [...alreadyProcessed]
        };
        saveCheckpoint(currentCheckpoint);

        let successCount = 0;
        let unchangedCount = 0;
        let noResultsCount = 0;
        let failCount = 0;
        let processedCount = 0;
        const reports: ProductReport[] = [];
        const syncStart = Date.now();
        const timings: number[] = [];

        const limit = pLimit(CONCURRENCY);

        const tasks = toProcess.map(product =>
            limit(async () => {
                const taskStart = Date.now();
                const current = ++processedCount;

                const avgMs = timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0;
                const eta = timings.length >= 3
                    ? ` (~${formatDuration(avgMs * (total - current + 1))} zostatok)`
                    : '';
                const prefix = `[${current}/${total}]${eta}`;
                const portfolioTag = portfolioIds.has(product.id) ? ' ★' : '';

                logger.info(`${prefix} Syncing: ${product.name}${portfolioTag}`);

                const report: ProductReport = {
                    name: product.name,
                    priceBefore: product.price,
                    priceAfter: null,
                    listingsUsed: 0,
                    status: 'failed',
                    durationMs: 0,
                };

                try {
                    const result = await fetchEbayPrice(ebay, product.name);

                    if (!result) {
                        noResultsCount++;
                        report.status = 'no_results';
                        logger.warn(`  ⚠ ${prefix} Žiadne eBay výsledky pre: ${product.name}`);
                        return;
                    }

                    const { price, listingsUsed } = result;
                    report.priceAfter = price;
                    report.listingsUsed = listingsUsed;

                    // Skip DB write if price unchanged
                    const priceBefore = product.price ?? 0;
                    const priceDiff = priceBefore > 0 ? Math.abs((price - priceBefore) / priceBefore) : 1;

                    if (priceDiff < PRICE_CHANGE_THRESHOLD) {
                        unchangedCount++;
                        report.status = 'unchanged';
                        logger.info(`  ~ ${prefix} ${product.name}: cena nezmenená (${price.toFixed(2)} €)`);
                        return;
                    }

                    await prisma.product.update({
                        where: { id: product.id },
                        data: {
                            price,
                            priceSource: 'ebay_api',
                            lastPriceSync: new Date(),
                        } as any
                    });

                    // Price history
                    const today = new Date(); today.setHours(0, 0, 0, 0);
                    const existingToday = await prisma.priceHistory.findFirst({ where: { productId: product.id, date: { gte: today } } });
                    if (existingToday) {
                        await prisma.priceHistory.update({ where: { id: existingToday.id }, data: { price, date: new Date() } });
                    } else {
                        await prisma.priceHistory.create({ data: { productId: product.id, price, date: new Date() } });
                    }

                    await prisma.userAsset.updateMany({ where: { productId: product.id }, data: { currentValue: price } });

                    const changeStr = priceBefore > 0
                        ? ` (${price > priceBefore ? '+' : ''}${((price - priceBefore) / priceBefore * 100).toFixed(1)}%)`
                        : '';
                    logger.info(`  ✅ ${prefix} ${product.name} → ${price.toFixed(2)} € [${listingsUsed} listings]${changeStr}`);

                    successCount++;
                    report.status = 'success';

                } catch (error: any) {
                    failCount++;
                    logger.error(`  ❌ ${prefix} Error: ${error.message}`);
                } finally {
                    const durationMs = Date.now() - taskStart;
                    report.durationMs = durationMs;
                    reports.push(report);
                    timings.push(durationMs);
                    currentCheckpoint.processedIds.push(product.id);
                    saveCheckpoint(currentCheckpoint);
                }
            })
        );

        await Promise.all(tasks);

        // Write report
        if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
        const reportDate = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const reportFile = path.join(REPORT_DIR, `ebay-report-${reportDate}.json`);
        fs.writeFileSync(reportFile, JSON.stringify({
            syncedAt: new Date().toISOString(),
            marketplace: EBAY_MARKETPLACE,
            durationMs: Date.now() - syncStart,
            summary: { success: successCount, unchanged: unchangedCount, noResults: noResultsCount, failed: failCount, total: allProducts.length },
            products: reports
        }, null, 2));

        clearCheckpoint();

        logger.info(`\n=== eBay Sync Summary (${formatDuration(Date.now() - syncStart)}) ===`);
        logger.info(`  ✅ Success:    ${successCount}`);
        logger.info(`  ~ Unchanged:  ${unchangedCount}`);
        logger.info(`  ⚠ No results: ${noResultsCount}`);
        logger.info(`  ❌ Failed:     ${failCount}`);
        logger.info(`  📦 Total:      ${allProducts.length}`);
        logger.info(`  📄 Report:     ${reportFile}`);

    } catch (error) {
        logger.error('Fatal error during eBay sync', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
