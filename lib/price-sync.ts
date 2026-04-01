import prisma from './prisma';
import { EbayClient } from './ebay';

const ebayClient = new EbayClient();

export class PriceSyncService {
    /**
     * Searches for a product on eBay and links the best match to the database record.
     */
    static async linkProductToEbay(productId: string): Promise<boolean> {
        const product = await (prisma as any).product.findUnique({
            where: { id: productId }
        });

        if (!product) return false;

        const query = `${product.name} ${product.expansion || ''}`.trim();
        console.log(`Linking product: ${query}...`);

        try {
            const results = await ebayClient.searchItems(query);
            if (!results.itemSummaries || results.itemSummaries.length === 0) {
                console.warn(`No eBay results for: ${query}`);
                return false;
            }

            // Simple heuristic: Take the first result (usually best match)
            // In a real app we might want more sophisticated matching or user confirmation
            const bestMatch = results.itemSummaries[0];
            const priceValue = parseFloat(bestMatch.price.value);

            if (isNaN(priceValue)) {
                console.warn(`Invalid price for ${query}: ${bestMatch.price.value}`);
                return false;
            }

            await (prisma as any).product.update({
                where: { id: productId },
                data: {
                    ebayItemId: bestMatch.itemId,
                    ebayUrl: bestMatch.itemWebUrl,
                    imageUrl: bestMatch.image?.imageUrl || product.imageUrl,
                    price: priceValue,
                    currency: bestMatch.price.currency,
                    lastPriceSync: new Date(),
                    source: 'ebay'
                }
            });

            console.log(`Successfully linked ${product.name} to eBay item: ${bestMatch.itemId}`);
            return true;
        } catch (error) {
            console.error(`Failed to link product ${productId}:`, error);
            return false;
        }
    }

    /**
     * Updates prices for all products that have an ebayItemId linked.
     */
    static async syncPrices(): Promise<{ updated: number, errors: number }> {
        const productsToSync = await (prisma as any).product.findMany({
            where: {
                ebayItemId: { not: null }
            }
        });

        console.log(`Syncing prices for ${productsToSync.length} products...`);
        let updated = 0;
        let errors = 0;

        for (const product of productsToSync) {
            try {
                const { value, currency } = await ebayClient.getItemPrice(product.ebayItemId!);

                if (isNaN(value)) {
                    console.warn(`Invalid price sync for product ${product.id}: value is NaN`);
                    errors++;
                    continue;
                }

                await (prisma as any).$transaction([
                    (prisma as any).product.update({
                        where: { id: product.id },
                        data: {
                            price: value,
                            currency: currency,
                            lastPriceSync: new Date()
                        }
                    }),
                    (prisma as any).priceHistory.create({
                        data: {
                            productId: product.id,
                            price: value
                        }
                    }),
                    (prisma as any).userAsset.updateMany({
                        where: { productId: product.id },
                        data: {
                            currentValue: value
                        }
                    })
                ]);
                updated++;
            } catch (error) {
                console.error(`Failed to sync price for product ${product.id}:`, error);
                errors++;
            }
        }

        return { updated, errors };
    }
}
