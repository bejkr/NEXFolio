import * as dotenv from 'dotenv';
dotenv.config();

import pLimit from 'p-limit';
import { logger } from '../utils/logger';
import { delay } from '../utils/delay';
import { cardmarketService, Expansion, ParsedProduct } from '../services/cardmarketService';
import { productService, ProductData } from '../services/productService';

const limit = pLimit(2);
const RETRY_COUNT = 3;

// Sealed product categories sorted by newest release — mirrors Cardmarket's date_desc view
const SEALED_CATEGORIES = [
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Booster-Boxes?sortBy=date_desc&perSite=30', name: 'Booster Boxes' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Elite-Trainer-Boxes?sortBy=date_desc&perSite=30', name: 'Elite Trainer Boxes' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Booster-Bundles?sortBy=date_desc&perSite=30', name: 'Booster Bundles' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Collections?sortBy=date_desc&perSite=30', name: 'Collections' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Tins?sortBy=date_desc&perSite=30', name: 'Tins' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Blister-Packs?sortBy=date_desc&perSite=30', name: 'Blister Packs' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Special-Collections?sortBy=date_desc&perSite=30', name: 'Special Collections' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Box-Sets?sortBy=date_desc&perSite=30', name: 'Box Sets' },
];

async function fetchWithRetry<T>(operation: () => Promise<T>, url: string, retries = RETRY_COUNT): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries > 0) {
            logger.warn(`Retrying fetch for ${url}. Attempts left: ${retries - 1}`);
            await delay(1000);
            return fetchWithRetry(operation, url, retries - 1);
        }
        logger.error(`Max retries reached for ${url}`);
        throw error;
    }
}

async function syncCategory(category: { url: string; name: string }) {
    try {
        logger.info(`Syncing category: ${category.name}`);
        const result = await limit(() => fetchWithRetry(
            () => cardmarketService.fetchCategoryGridPage(category.url),
            category.url
        ));

        if (result.products.length === 0) {
            logger.warn(`No products found in category ${category.name}`);
            return;
        }

        logger.info(`Found ${result.products.length} products in ${category.name}. Upserting...`);

        for (const sp of result.products) {
            const productData: ProductData = {
                externalId: sp.externalId,
                name: sp.name,
                expansion: sp.expansionName || category.name,
                category: 'sealed',
                source: 'cardmarket',
                imageUrl: sp.imageUrl,
                cardmarketUrl: sp.url,
            };
            await productService.upsertProduct(productData);
        }
    } catch (error: any) {
        logger.error(`Skipping category ${category.name} due to error: ${error.message}`);
    }
}

async function syncExpansion(expansion: Expansion) {
    try {
        const productsRaw = await limit(() => fetchWithRetry(
            () => cardmarketService.fetchProductsByExpansion(expansion.url),
            expansion.url
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
        const isFullSync = process.argv.includes('--full');
        const expansionArg = process.argv.find(a => a.startsWith('--expansion='))?.replace('--expansion=', '');

        if (expansionArg) {
            // Targeted sync: find expansion by name and sync it
            logger.info(`Fetching expansions to find: "${expansionArg}"...`);
            const expansions = await fetchWithRetry(
                () => cardmarketService.fetchExpansions(),
                'Expansions Index'
            );
            const matched = expansions.filter(e =>
                e.name.toLowerCase().includes(expansionArg.toLowerCase())
            );
            if (matched.length === 0) {
                logger.error(`No expansion found matching: "${expansionArg}"`);
                return;
            }
            logger.info(`Found ${matched.length} match(es): ${matched.map(e => e.name).join(', ')}`);
            for (const expansion of matched) {
                await syncExpansion(expansion);
                await delay(10000);
            }
        } else if (isFullSync) {
            // Full sync: all expansions alphabetically
            logger.info('Fetching expansions list...');
            const expansions = await fetchWithRetry(
                () => cardmarketService.fetchExpansions(),
                'Expansions Index'
            );
            if (expansions.length === 0) {
                logger.error('No expansions found. Check Cardmarket DOM structure or IP ban status.');
                return;
            }
            logger.info(`Full sync: ${expansions.length} expansions...`);
            for (const expansion of expansions) {
                await syncExpansion(expansion);
                await delay(10000);
            }
        } else {
            // Default: category-based sync sorted by newest release (date_desc)
            logger.info(`Syncing ${SEALED_CATEGORIES.length} categories sorted by newest release...`);
            for (const category of SEALED_CATEGORIES) {
                await syncCategory(category);
                await delay(10000);
            }
        }

        logger.info('Sync completed successfully!');

    } catch (error) {
        logger.error('Fatal error during sync process', error);
    } finally {
        await productService.disconnect();
        await cardmarketService.closeBrowser();
    }
}

main();
