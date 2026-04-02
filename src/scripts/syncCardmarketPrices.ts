import { PrismaClient } from '@prisma/client';
import { cardmarketService } from '../services/cardmarketService';
import { logger } from '../utils/logger';
import pLimit from 'p-limit';

const prisma = new PrismaClient();
const limit = pLimit(1); // 1 request at a time to be polite to Cardmarket

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(operation: () => Promise<any>, retries = 3): Promise<any> {
    try {
        await delay(3000); // 3 seconds between requests to avoid bans
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

        for (const product of products) {
            const cmCategory = guessCategory(product.externalId);
            const productUrl = `https://www.cardmarket.com/en/Pokemon/Products/${cmCategory}/${product.externalId}`;
            
            logger.info(`Syncing: ${product.name} at ${productUrl}`);
            
            const details = await limit(() => fetchWithRetry(() => cardmarketService.fetchProductDetails(productUrl)));
            
            const bestPrice = details.trendPrice || details.thirtyDayAvg || details.fromPrice;

            if (bestPrice) {
                await prisma.product.update({
                    where: { id: product.id },
                    data: {
                        price: bestPrice,
                        lastPriceSync: new Date()
                    }
                });

                await prisma.priceHistory.create({
                    data: {
                        productId: product.id,
                        price: bestPrice
                    }
                });

                // Update User Portfolios (UserAssets) with new market price
                await prisma.userAsset.updateMany({
                    where: { productId: product.id },
                    data: {
                        currentValue: bestPrice
                    }
                });

                logger.info(`Updated ${product.name} to price ${bestPrice} €`);
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
