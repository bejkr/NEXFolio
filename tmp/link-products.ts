import prisma from '../lib/prisma';
import { PriceSyncService } from '../lib/price-sync';

async function runLink() {
    console.log('--- Linking Existing Products to eBay ---');
    try {
        const products = await (prisma as any).product.findMany({
            where: {
                ebayItemId: null
            }
        });

        console.log(`Found ${products.length} unlinked products.`);

        const batchSize = 10;
        for (let i = 0; i < products.length; i += batchSize) {
            const batch = products.slice(i, i + batchSize);
            console.log(`\n--- Processing Batch ${Math.floor(i / batchSize) + 1} (${batch.length} items) ---`);
            await Promise.all(batch.map(async (product: any) => {
                const success = await PriceSyncService.linkProductToEbay(product.id);
                if (success) {
                    console.log(`✅ Linked: ${product.name}`);
                } else {
                    console.log(`❌ Failed: ${product.name}`);
                }
            }));
        }

        console.log('\n--- Syncing Prices ---');
        const syncResult = await PriceSyncService.syncPrices();
        console.log('Sync Result:', syncResult);

    } catch (error: any) {
        console.error('Linking error:', error.message);
    }
}

runLink();
