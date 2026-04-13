import prisma from '../../lib/prisma';
import { cardmarketService } from '../services/cardmarketService';
import { PriceEngine } from '../services/priceEngine';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Cardmarket Price Sync — axios + cookies (no Puppeteer)
 *
 * Requires cookies from Brave browser in .cardmarket-cookies.txt or CM_COOKIES env var.
 * Uses fetchProductDetails which internally calls fetchHtmlWithCookies.
 */

// ─── Config ───────────────────────────────────────────────────────────────────
const DELAY_MS = 3000; // 3s between requests — safe for CF
const PRICE_CHANGE_THRESHOLD = 0.005; // 0.5%
const CHECKPOINT_FILE = path.join(process.cwd(), '.cache', 'sync-checkpoint.json');
const REPORT_DIR = path.join(process.cwd(), '.cache', 'reports');

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductReport {
    name: string;
    priceBefore: number | null;
    priceAfter: number | null;
    reason: string;
    status: 'success' | 'unchanged' | 'circuit_breaker' | 'failed';
    durationMs: number;
}

interface SyncCheckpoint {
    startedAt: string;
    processedIds: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function formatDuration(ms: number): string {
    if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
    const m = Math.floor(ms / 60_000);
    const s = Math.round((ms % 60_000) / 1000);
    return `${m}m ${s}s`;
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

function buildProductUrl(product: any): string | null {
    const override = (product as any).cardmarketUrl as string | null;
    if (override === 'skip') return null; // explicitly excluded from Cardmarket sync
    if (override) return override;

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

    return `https://www.cardmarket.com/en/Pokemon/Products/${cat}/${product.externalId}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    logger.info('╔══════════════════════════════════════════════════╗');
    logger.info('║   Cardmarket Price Sync (axios + cookies)       ║');
    logger.info('╚══════════════════════════════════════════════════╝');

    const force = process.argv.includes('--force');
    const resume = process.argv.includes('--resume');

    if (force) logger.info('Force sync enabled.');
    if (resume) logger.info('Resume mode enabled.');

    const checkpoint = resume ? loadCheckpoint() : null;
    const alreadyProcessed = new Set(checkpoint?.processedIds ?? []);
    if (checkpoint) logger.info(`Resuming (${alreadyProcessed.size} already done)`);

    try {
        const allProducts = await prisma.product.findMany();
        if (allProducts.length === 0) {
            logger.warn('No products in DB.');
            return;
        }

        // Prioritize portfolio products
        const portfolioIds = new Set(
            (await prisma.userAsset.findMany({ select: { productId: true }, distinct: ['productId'] }))
                .map(a => a.productId)
                .filter((id): id is string => id !== null)
        );

        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
        const toProcess = allProducts
            .filter(p => force || !p.lastPriceSync || p.lastPriceSync <= twelveHoursAgo)
            .filter(p => !alreadyProcessed.has(p.id))
            .sort((a, b) => (portfolioIds.has(a.id) ? 0 : 1) - (portfolioIds.has(b.id) ? 0 : 1));

        const skippedFresh = allProducts.length - toProcess.length - alreadyProcessed.size;
        const total = toProcess.length;

        logger.info(`${allProducts.length} products | ${portfolioIds.size} in portfolio | ${total} to sync`);
        if (skippedFresh > 0) logger.info(`  ⏭  ${skippedFresh} recently synced`);
        if (alreadyProcessed.size > 0) logger.info(`  ⏭  ${alreadyProcessed.size} from checkpoint`);

        const currentCheckpoint: SyncCheckpoint = {
            startedAt: checkpoint?.startedAt ?? new Date().toISOString(),
            processedIds: [...alreadyProcessed]
        };
        saveCheckpoint(currentCheckpoint);

        let successCount = 0;
        let unchangedCount = 0;
        let circuitBreakerCount = 0;
        let failCount = 0;
        const reports: ProductReport[] = [];
        const syncStart = Date.now();
        const timings: number[] = [];

        for (let i = 0; i < toProcess.length; i++) {
            const product = toProcess[i];
            const taskStart = Date.now();
            const current = i + 1;

            // ETA
            const avgMs = timings.length > 0 ? timings.reduce((a, b) => a + b, 0) / timings.length : 0;
            const eta = timings.length >= 3 ? ` (~${formatDuration(avgMs * (total - current + 1))} zostatok)` : '';
            const prefix = `[${current}/${total}]${eta}`;
            const star = portfolioIds.has(product.id) ? ' ★' : '';

            logger.info(`${prefix} Syncing: ${product.name}${star}`);

            const report: ProductReport = {
                name: product.name,
                priceBefore: product.price,
                priceAfter: null,
                reason: '',
                status: 'failed',
                durationMs: 0,
            };

            try {
                const productUrl = buildProductUrl(product);

                // Skip products marked as 'skip' or with invalid URLs
                if (productUrl === null) {
                    logger.info(`  ⏭ Skipping ${product.name} — excluded from Cardmarket sync`);
                    report.status = 'unchanged';
                    report.reason = 'skipped_cardmarket';
                    unchangedCount++;
                    return;
                }

                if (/[|<>{}[\]\\^`]/.test(productUrl) || productUrl.includes('test123')) {
                    logger.warn(`  ⚠ Skipping ${product.name} — invalid externalId: ${product.externalId}`);
                    report.status = 'failed';
                    report.reason = 'invalid_external_id';
                    failCount++;
                    return;
                }

                const rawDetails = await cardmarketService.fetchProductDetails(productUrl);
                const computed = PriceEngine.compute(rawDetails, product.price);

                logger.info(PriceEngine.formatDebugLog(product.name, computed));

                if (computed.reason === 'no_valid_price_found') {
                    failCount++;
                    report.status = 'failed';
                    report.reason = computed.reason;
                    logger.error(`  ❌ Žiadna platná cena pre ${product.name}`);
                } else if (computed.reason.startsWith('circuit_breaker')) {
                    circuitBreakerCount++;
                    report.status = 'circuit_breaker';
                    report.reason = computed.reason;
                    logger.warn(`  🔴 Circuit breaker: zachovávam ${product.price} €`);
                } else {
                    // Check if price changed enough
                    const priceBefore = product.price ?? 0;
                    const priceAfter = computed.bestPrice ?? 0;
                    const priceDiff = priceBefore > 0 ? Math.abs((priceAfter - priceBefore) / priceBefore) : 1;

                    if (priceDiff < PRICE_CHANGE_THRESHOLD) {
                        unchangedCount++;
                        report.status = 'unchanged';
                        report.priceAfter = priceAfter;
                        report.reason = 'price_unchanged';
                        logger.info(`  ~ Cena nezmenená (${priceAfter.toFixed(2)} €)`);

                        // Still write priceHistory even if price unchanged — needed for daily graph points
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const existing = await prisma.priceHistory.findFirst({ where: { productId: product.id, date: { gte: today } } });
                        if (!existing && priceAfter > 0) {
                            await prisma.priceHistory.create({ data: { productId: product.id, price: priceAfter, availabilityCount: rawDetails.availableItems, date: new Date() } });
                        }
                    } else {
                        // Update product
                        await prisma.product.update({
                            where: { id: product.id },
                            data: {
                                price: computed.bestPrice,
                                trendPrice: rawDetails.trendPrice ?? null,
                                fromPrice: rawDetails.fromPrice ?? null,
                                oneDayAvg: rawDetails.oneDayAvg ?? null,
                                sevenDayAvg: rawDetails.sevenDayAvg ?? null,
                                thirtyDayAvg: rawDetails.thirtyDayAvg ?? null,
                                availabilityCount: rawDetails.availableItems ?? null,
                                priceSource: 'cardmarket_axios',
                                priceReason: computed.reason,
                                lastPriceSync: new Date(),
                            } as any
                        });

                        // Price history
                        const today = new Date(); today.setHours(0, 0, 0, 0);
                        const existing = await prisma.priceHistory.findFirst({ where: { productId: product.id, date: { gte: today } } });
                        if (existing) {
                            await prisma.priceHistory.update({ where: { id: existing.id }, data: { price: computed.bestPrice!, availabilityCount: rawDetails.availableItems, date: new Date() } });
                        } else {
                            await prisma.priceHistory.create({ data: { productId: product.id, price: computed.bestPrice!, availabilityCount: rawDetails.availableItems, date: new Date() } });
                        }

                        // Update user assets
                        if (!computed.reason.startsWith('circuit_breaker')) {
                            await prisma.userAsset.updateMany({ where: { productId: product.id }, data: { currentValue: computed.bestPrice! } });
                        }

                        const changeStr = priceBefore > 0 ? ` (${priceAfter > priceBefore ? '+' : ''}${((priceAfter - priceBefore) / priceBefore * 100).toFixed(1)}%)` : '';
                        logger.info(`  ✅ ${product.name} → ${computed.bestPrice?.toFixed(2)} €${changeStr}`);

                        successCount++;
                        report.status = 'success';
                        report.priceAfter = computed.bestPrice;
                        report.reason = computed.reason;
                    }
                }
            } catch (error: any) {
                failCount++;
                report.status = 'failed';
                report.reason = error.message;
                logger.error(`  ❌ ${error.message}`);
            } finally {
                const durationMs = Date.now() - taskStart;
                report.durationMs = durationMs;
                reports.push(report);
                timings.push(durationMs);

                currentCheckpoint.processedIds.push(product.id);
                saveCheckpoint(currentCheckpoint);

                // Delay between requests
                if (i < toProcess.length - 1) {
                    await delay(DELAY_MS);
                }
            }
        }

        // Write report
        if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });
        const reportDate = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const reportFile = path.join(REPORT_DIR, `sync-report-${reportDate}.json`);
        fs.writeFileSync(reportFile, JSON.stringify({
            syncedAt: new Date().toISOString(),
            durationMs: Date.now() - syncStart,
            summary: { success: successCount, unchanged: unchangedCount, circuitBreaker: circuitBreakerCount, failed: failCount, total: allProducts.length },
            products: reports
        }, null, 2));

        clearCheckpoint();

        logger.info(`\n════ Sync completed (${formatDuration(Date.now() - syncStart)}) ════`);
        logger.info(`  ✅ Success:         ${successCount}`);
        logger.info(`  ~ Unchanged:        ${unchangedCount}`);
        logger.info(`  🔴 Circuit Breaker: ${circuitBreakerCount}`);
        logger.info(`  ❌ Failed:          ${failCount}`);
        logger.info(`  📦 Total:           ${allProducts.length}`);
        logger.info(`  📄 Report:          ${reportFile}`);

    } catch (error) {
        logger.error('Fatal error during sync', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
