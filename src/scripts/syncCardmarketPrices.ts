import prisma from '../../lib/prisma';
import { cardmarketService } from '../services/cardmarketService';
import { logger } from '../utils/logger';
import pLimit from 'p-limit';
const limit = pLimit(1); // 1 request at a time to be polite to Cardmarket

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(operation: () => Promise<any>, retries = 3): Promise<any> {
    try {
        await delay(10000); // 10 seconds between requests to avoid bans
        return await operation();
    } catch (error: any) {
        if (retries > 0) {
            logger.warn(`Retrying fetch. Attempts left: ${retries - 1}. Waiting 5s...`);
            await delay(5000);
            return fetchWithRetry(operation, retries - 1);
        }
        throw error;
    }
}

function guessCategory(externalId: string): string {
    const ext = externalId.toLowerCase();
    if (ext.includes('elite-trainer-box') || ext.includes('etb')) return 'Elite-Trainer-Boxes';
    if (ext.includes('booster-box') || ext.includes('display')) return 'Booster-Boxes';
    if (ext.includes('tin')) return 'Tins';
    if (ext.includes('blister')) return 'Blister-Packs';
    if (ext.includes('deck')) return 'Theme-Decks';
    if (ext.includes('collection') || ext.includes('box')) return 'Box-Sets';
    return 'Booster-Boxes'; // Fallback
}

async function main() {
    logger.info('Starting Cardmarket Pricing Sync...');

    try {
        const products = await prisma.product.findMany();

        if (products.length === 0) {
            logger.warn('No Cardmarket products found in the database. Sync finished.');
            return;
        }

        logger.info(`Found ${products.length} products to sync.`);

        const force = process.argv.includes('--force');
        if (force) {
            logger.info('Force sync enabled. Bypassing 12-hour check.');
        }

        for (const product of products) {
            // Skip products that were recently updated (e.g. in the last 12 hours), unless forced
            const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
            if (!force && product.lastPriceSync && product.lastPriceSync > twelveHoursAgo) {
                logger.debug(`Skipping ${product.name}, already synced at ${product.lastPriceSync.toISOString()}. Use --force to sync anyway.`);
                continue;
            }

            let productUrl = product.cardmarketUrl;
            
            if (!productUrl) {
                const cmCategory = guessCategory(product.externalId);
                productUrl = `https://www.cardmarket.com/en/Pokemon/Products/${cmCategory}/${product.externalId}`;
                logger.debug(`No stored URL for ${product.name}, guessing: ${productUrl}`);
            }
            
            logger.info(`Syncing: ${product.name} at ${productUrl}`);
            
            // Random jitter between 5-15 seconds
            const jitter = 5000 + Math.random() * 10000;
            const details = await limit(() => fetchWithRetry(() => cardmarketService.fetchProductDetails(productUrl), 3));
            
            // Sanitization logic: Check if "From" price is an outlier (often empty boxes/accessories)
            let bestPrice = details.fromPrice;
            const referencePrice = details.trendPrice || details.oneDayAvg || details.sevenDayAvg || details.thirtyDayAvg;

            if (bestPrice && referencePrice && bestPrice < referencePrice * 0.5) {
                logger.warn(`Outlier detected for ${product.name}: From price (${bestPrice} €) is suspiciously low compared to Trend price (${referencePrice} €). Using Trend price instead.`);
                bestPrice = referencePrice;
            } else {
                // If no fromPrice or it's not an outlier, use standard fallback
                bestPrice = bestPrice || referencePrice;
            }

            const availability = details.availableItems;

            if (bestPrice) {
                // Check if product already has history
                const currentHistoryCount = await prisma.priceHistory.count({
                    where: { productId: product.id }
                });

                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        price: bestPrice,
                        availabilityCount: availability,
                        lastPriceSync: new Date()
                    }
                });

                // If no history exists, backfill with averages
                if (currentHistoryCount === 0) {
                    logger.info(`Backfilling initial history for ${product.name}...`);
                    
                    const historyData = [];
                    const now = new Date();

                    if (details.thirtyDayAvg) {
                        historyData.push({
                            productId: product.id,
                            price: details.thirtyDayAvg,
                            date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                            availabilityCount: availability
                        });
                    }
                    if (details.sevenDayAvg) {
                        historyData.push({
                            productId: product.id,
                            price: details.sevenDayAvg,
                            date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                            availabilityCount: availability
                        });
                    }
                    if (details.oneDayAvg) {
                        historyData.push({
                            productId: product.id,
                            price: details.oneDayAvg,
                            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
                            availabilityCount: availability
                        });
                    }

                    // Always add current price as latest history point
                    historyData.push({
                        productId: product.id,
                        price: bestPrice,
                        date: now,
                        availabilityCount: availability
                    });

                    // Create all historical records at once
                    await prisma.priceHistory.createMany({
                        data: historyData
                    });
                } else {
                    // Regular update: Check if there's already an entry for TODAY
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const existingToday = await prisma.priceHistory.findFirst({
                        where: {
                            productId: product.id,
                            date: {
                                gte: today
                            }
                        }
                    });

                    if (existingToday) {
                        logger.debug(`Updating existing price entry for today for ${product.name}`);
                        await prisma.priceHistory.update({
                            where: { id: existingToday.id },
                            data: {
                                price: bestPrice,
                                availabilityCount: availability,
                                date: new Date() // Update timestamp to latest sync
                            }
                        });
                    } else {
                        await prisma.priceHistory.create({
                            data: {
                                productId: product.id,
                                price: bestPrice,
                                availabilityCount: availability,
                                date: new Date()
                            }
                        });
                    }
                }

                // Update User Portfolios (UserAssets) with new market price
                await prisma.userAsset.updateMany({
                    where: { productId: product.id },
                    data: {
                        currentValue: bestPrice
                    }
                });

                logger.info(`Updated ${product.name} to price ${bestPrice} € (History points: ${currentHistoryCount === 0 ? 'Backfilled' : '1 added'})`);
            } else {
                logger.warn(`Could not find a valid price for ${product.name}. Check Cardmarket URL category guess.`);
            }
        }
        
        logger.info('Pricing Sync completed successfully!');
    } catch (error) {
        logger.error('Fatal error during pricing sync', error);
    } finally {
        await prisma.$disconnect();
        await cardmarketService.closeBrowser();
    }
}

main();
