import * as dotenv from 'dotenv';
dotenv.config();

import pLimit from 'p-limit';
import { logger } from '../utils/logger';
import { delay } from '../utils/delay';
import { cardmarketService, Expansion, ParsedProduct } from '../services/cardmarketService';
import { productService, ProductData } from '../services/productService';

// Max 2 requests per second globally across the script to be polite
const limit = pLimit(2);

const RETRY_COUNT = 3;

async function fetchWithRetry<T>(operation: () => Promise<T>, url: string, retries = RETRY_COUNT): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries > 0) {
            logger.warn(`Retrying fetch for ${url}. Attempts left: ${retries - 1}`);
            await delay(1000); // 1s backoff
            return fetchWithRetry(operation, url, retries - 1);
        }
        logger.error(`Max retries reached for ${url}`);
        throw error;
    }
}

async function syncExpansion(expansion: Expansion) {
    try {
        const url = expansion.url;
        // Schedule the fetch through p-limit
        const productsRaw = await limit(() => fetchWithRetry(
            () => cardmarketService.fetchProductsByExpansion(url),
            url
        ));

        const sealedProducts = cardmarketService.filterSealedProducts(productsRaw);

        if (sealedProducts.length === 0) {
            logger.debug(`No sealed products found for expansion: ${expansion.name}`);
            return;
        }

        logger.info(`Found ${sealedProducts.length} sealed products in ${expansion.name}. Upserting...`);

        for (const sp of sealedProducts) {
            const productData: ProductData = {
                externalId: sp.externalId,
                name: sp.name,
                expansion: expansion.name,
                category: 'sealed',
                source: 'cardmarket',
                imageUrl: sp.imageUrl,
                cardmarketUrl: sp.url,
            };

            await productService.upsertProduct(productData);
        }
    } catch (error: any) {
        logger.error(`Skipping expansion ${expansion.name} due to error: ${error.message}`);
    }
}

async function main() {
    logger.info('Starting Cardmarket Sealed Product Sync...');

    try {
        // 1. Fetch all expansions
        logger.info('Fetching expansions list...');
        const expansions = await fetchWithRetry(
            () => cardmarketService.fetchExpansions(),
            'Expansions Index'
        );

        if (expansions.length === 0) {
            logger.error('No expansions found. Check Cardmarket DOM structure or IP ban status.');
            return;
        }

        logger.info(`Found ${expansions.length} expansions. Starting sync...`);

        // 2. Iterate and sync each
        const isFullSync = process.argv.includes('--full');
        const expansionsToSync = isFullSync ? expansions : expansions.slice(-20);
        
        if (isFullSync) {
            logger.info(`Full sync enabled. Syncing all ${expansions.length} expansions...`);
        } else {
            logger.info(`Syncing only the 20 most recent expansions to avoid Cloudflare blocks. Use --full to sync all.`);
        }

        for (const expansion of expansionsToSync) {
            await syncExpansion(expansion);

            // Polite delay between expansions - increased to 10s for stability in CI
            await delay(10000);
        }

        // 3. Optional: Sync specific categories that might not be in the expansion list
        const EXTRA_CATEGORIES = [
            { url: 'https://www.cardmarket.com/en/Pokemon/Products/Box-Sets', name: 'Box Sets' },
            { url: 'https://www.cardmarket.com/en/Pokemon/Products/Tins', name: 'Tins' },
            { url: 'https://www.cardmarket.com/en/Pokemon/Products/Special-Collections', name: 'Special Collections' }
        ];

        logger.info('Starting Category-specific sync for Extra Categories...');
        for (const category of EXTRA_CATEGORIES) {
            logger.info(`Syncing category: ${category.name}`);
            const result = await limit(() => fetchWithRetry(
                () => cardmarketService.fetchCategoryGridPage(category.url),
                category.url
            ));

            const sealedProducts = cardmarketService.filterSealedProducts(result.products);
            logger.info(`Found ${sealedProducts.length} sealed products in category ${category.name}. Upserting...`);

            for (const sp of sealedProducts) {
                const productData: ProductData = {
                    externalId: sp.externalId,
                    name: sp.name,
                    expansion: sp.expansionName || 'Special',
                    category: 'sealed',
                    source: 'cardmarket',
                    imageUrl: sp.imageUrl,
                    cardmarketUrl: sp.url,
                };
                await productService.upsertProduct(productData);
            }
            await delay(5000);
        }

        logger.info('Sync completed successfully!');

    } catch (error) {
        logger.error('Fatal error during sync process', error);
    } finally {
        await productService.disconnect();
        await cardmarketService.closeBrowser();
    }
}

// Execute
main();
