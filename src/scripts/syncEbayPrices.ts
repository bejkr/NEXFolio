import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { EbayClient } from '../../lib/ebay';
import { logger } from '../utils/logger';
import { delay } from '../utils/delay';
import pLimit from 'p-limit';

const prisma = new PrismaClient();
const ebay = new EbayClient();
const limit = pLimit(1); // 1 request at a time to be safe with sandbox/rate limits

async function syncProductPrice(product: any) {
    try {
        const query = `${product.name} Pokemon TCG`;
        logger.info(`Syncing eBay price for: ${query}`);

        // Search eBay for the product
        let results = await ebay.searchItems(query);

        let price: number | null = null;
        let currency: string | null = null;
        let ebayUrl: string | null = null;

        if (results.itemSummaries && results.itemSummaries.length > 0) {
            const firstItem = results.itemSummaries[0];
            price = parseFloat(firstItem.price.value);
            currency = firstItem.price.currency;
            ebayUrl = firstItem.itemWebUrl;
        } else if (ebay.isSandbox) {
            // --- Sandbox Fallback ---
            // If we are in Sandbox mode and no results are found, generate a mock price
            // so the user can verify the UI and system flow.
            price = 45.0 + (Math.random() * 20); // Random price between 45 and 65
            currency = "USD";
            ebayUrl = "https://sandbox.ebay.com/search?q=" + encodeURIComponent(query);
            logger.info(`[Sandbox Mode] Generated mock price for: ${product.name}`);
        }

        if (price !== null) {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    price,
                    currency: currency || "EUR",
                    ebayUrl: ebayUrl || "",
                    lastPriceSync: new Date(),
                }
            });
            logger.info(`Updated ${product.name}: ${price} ${currency || "EUR"}`);
        } else {
            logger.warn(`No eBay results found for: ${product.name}`);
        }
    } catch (error: any) {
        logger.error(`Failed to sync price for ${product.name}: ${error.message}`);
    }
}

async function main() {
    logger.info('Starting eBay Price Sync...');

    try {
        const products = await prisma.product.findMany();
        logger.info(`Found ${products.length} products to sync.`);

        for (const product of products) {
            await limit(() => syncProductPrice(product));
            await delay(1000); // Wait 1s between products
        }

        logger.info('eBay Price Sync completed successfully!');
    } catch (error: any) {
        logger.error('Fatal error during eBay sync', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
