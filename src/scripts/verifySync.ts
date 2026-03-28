import * as dotenv from 'dotenv';
dotenv.config();

import { cardmarketService } from '../services/cardmarketService';
import { productService } from '../services/productService';
import { logger } from '../utils/logger';

async function main() {
    logger.info('Starting Limited Verification Sync...');
    try {
        const expansion = {
            name: 'Scarlet & Violet',
            url: 'https://www.cardmarket.com/en/Pokemon/Products/Search?idCategory=0&idExpansion=1646&mode=list'
        };

        logger.info(`Syncing expansion: ${expansion.name}`);
        const productsRaw = await cardmarketService.fetchProductsByExpansion(expansion.url);
        const sealedProducts = cardmarketService.filterSealedProducts(productsRaw);

        logger.info(`Found ${sealedProducts.length} sealed products.`);

        for (const sp of sealedProducts.slice(0, 5)) { // Just first 5 for verification
            const productData = {
                externalId: sp.externalId,
                name: sp.name,
                expansion: expansion.name,
                category: 'sealed',
                source: 'cardmarket',
                imageUrl: sp.imageUrl,
            };

            await productService.upsertProduct(productData);
            logger.info(`- Upserted: ${sp.name} | Image: ${sp.imageUrl}`);
        }

        logger.info('Verification sync completed!');
    } catch (error) {
        logger.error('Error during verification sync', error);
    } finally {
        await productService.disconnect();
        await cardmarketService.closeBrowser();
    }
}

main();
