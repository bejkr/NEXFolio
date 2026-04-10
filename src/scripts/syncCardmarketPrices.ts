import prisma from '../../lib/prisma';
import { cardmarketService } from '../services/cardmarketService';
import { PriceEngine } from '../services/priceEngine';
import { logger } from '../utils/logger';
import pLimit from 'p-limit';

const limit = pLimit(1); // 1 request naraz – šetrné k Cardmarketu

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(
    operation: () => Promise<any>,
    retries = 3
): Promise<any> {
    try {
        await delay(10000); // 10s medzi requestmi
        return await operation();
    } catch (error: any) {
        if (retries > 0) {
            logger.warn(`Retrying fetch. Attempts left: ${retries - 1}. Waiting 15s...`);
            await delay(15000);
            return fetchWithRetry(operation, retries - 1);
        }
        throw error;
    }
}

async function main() {
    logger.info('=== Cardmarket Pricing Sync (v2 - PriceEngine) ===');

    try {
        const products = await prisma.product.findMany();

        if (products.length === 0) {
            logger.warn('No products found in DB. Sync finished.');
            return;
        }

        logger.info(`Found ${products.length} products to sync.`);

        const force = process.argv.includes('--force');
        if (force) logger.info('Force sync enabled. Bypassing 12-hour check.');

        let successCount = 0;
        let skippedCount = 0;
        let circuitBreakerCount = 0;  // Produkty kde sme zachovali starú cenu
        let failCount = 0;

        for (const product of products) {
            // Preskočiť nedávno syncnuté (ak nie je force)
            const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
            if (!force && product.lastPriceSync && product.lastPriceSync > twelveHoursAgo) {
                logger.debug(`Skipping ${product.name} (synced ${product.lastPriceSync.toISOString()})`);
                skippedCount++;
                continue;
            }

            // Zostaviť URL
            let productUrl = (product as any).cardmarketUrl;
            if (!productUrl) {
                const ext = product.externalId.toLowerCase();
                let cat = 'Booster-Boxes';
                if (ext.includes('elite-trainer-box') || ext.includes('etb')) cat = 'Elite-Trainer-Boxes';
                else if (ext.includes('tin')) cat = 'Tins';
                else if (ext.includes('blister')) cat = 'Blister-Packs';
                else if (ext.includes('collection') || ext.includes('box')) cat = 'Box-Sets';
                productUrl = `https://www.cardmarket.com/en/Pokemon/Products/${cat}/${product.externalId}`;
                logger.debug(`No stored URL for ${product.name}, guessing: ${productUrl}`);
            }

            logger.info(`Syncing: ${product.name}`);

            try {
                const rawDetails = await limit(() =>
                    fetchWithRetry(() => cardmarketService.fetchProductDetails(productUrl))
                );

                // Spustiť PriceEngine s circuit breakerom
                const computed = PriceEngine.compute(rawDetails, product.price);

                // Výstup pre debug
                logger.info(PriceEngine.formatDebugLog(product.name, computed));

                if (computed.fromPriceIsOutlier) {
                    logger.warn(
                        `  ⚠ fromPrice (${rawDetails.fromPrice?.toFixed(2)} €) je outlier oproti trend (${rawDetails.trendPrice?.toFixed(2)} €) – ignorujem.`
                    );
                }

                if (computed.reason.startsWith('circuit_breaker')) {
                    circuitBreakerCount++;
                    logger.warn(`  🔴 Circuit breaker: žiadna nová cena, zachovávam starú: ${product.price} €`);
                }

                if (computed.reason === 'no_valid_price_found') {
                    failCount++;
                    logger.error(`  ❌ Žiadna platná cena pre ${product.name}. Preskačujem.`);
                    continue;
                }

                // Persists do DB
                const currentHistoryCount = await prisma.priceHistory.count({
                    where: { productId: product.id }
                });

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
                        priceSource: 'cardmarket_scraper',
                        priceReason: computed.reason,
                        lastPriceSync: new Date(),
                    } as any
                });

                // Price History logika
                if (currentHistoryCount === 0) {
                    // Backfill histórie z averageov
                    logger.info(`  Backfilling initial history for ${product.name}...`);
                    const historyData = [];
                    const now = new Date();

                    if (rawDetails.thirtyDayAvg) {
                        historyData.push({
                            productId: product.id,
                            price: rawDetails.thirtyDayAvg,
                            date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                            availabilityCount: rawDetails.availableItems
                        });
                    }
                    if (rawDetails.sevenDayAvg) {
                        historyData.push({
                            productId: product.id,
                            price: rawDetails.sevenDayAvg,
                            date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                            availabilityCount: rawDetails.availableItems
                        });
                    }
                    if (rawDetails.oneDayAvg) {
                        historyData.push({
                            productId: product.id,
                            price: rawDetails.oneDayAvg,
                            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                            availabilityCount: rawDetails.availableItems
                        });
                    }
                    historyData.push({
                        productId: product.id,
                        price: computed.bestPrice!,
                        date: now,
                        availabilityCount: rawDetails.availableItems
                    });

                    await prisma.priceHistory.createMany({ data: historyData });
                } else {
                    // Denný update
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const existingToday = await prisma.priceHistory.findFirst({
                        where: { productId: product.id, date: { gte: today } }
                    });

                    if (existingToday) {
                        await prisma.priceHistory.update({
                            where: { id: existingToday.id },
                            data: {
                                price: computed.bestPrice!,
                                availabilityCount: rawDetails.availableItems,
                                date: new Date()
                            }
                        });
                    } else {
                        await prisma.priceHistory.create({
                            data: {
                                productId: product.id,
                                price: computed.bestPrice!,
                                availabilityCount: rawDetails.availableItems,
                                date: new Date()
                            }
                        });
                    }
                }

                // Update UserAssets (len ak cena NIE JE z circuit breakera – t.j. je skutočne nová)
                if (!computed.reason.startsWith('circuit_breaker')) {
                    await prisma.userAsset.updateMany({
                        where: { productId: product.id },
                        data: { currentValue: computed.bestPrice! }
                    });
                }

                logger.info(`  ✅ ${product.name} → ${computed.bestPrice?.toFixed(2)} € [${computed.reason}]`);
                successCount++;

            } catch (error: any) {
                failCount++;
                logger.error(`  ❌ Error syncing ${product.name}: ${error.message}`);
            }
        }

        logger.info(`\n=== Sync Summary ===`);
        logger.info(`  ✅ Success:         ${successCount}`);
        logger.info(`  ⏭  Skipped (fresh): ${skippedCount}`);
        logger.info(`  🔴 Circuit Breaker: ${circuitBreakerCount}`);
        logger.info(`  ❌ Failed:          ${failCount}`);
        logger.info(`  📦 Total:           ${products.length}`);

    } catch (error) {
        logger.error('Fatal error during pricing sync', error);
    } finally {
        await prisma.$disconnect();
        await cardmarketService.closeBrowser();
    }
}

main();
