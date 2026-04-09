import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { EbayClient } from '@/lib/ebay';
import pLimit from 'p-limit';

const ebay = new EbayClient();
const limit = pLimit(2); // Keep it low for sandbox/rate limits

export async function POST(request: NextRequest) {
    try {
        const products = await prisma.product.findMany({
            where: {
                // You could add logic here to only sync old products
                // lastPriceSync: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });

        const results = await Promise.all(products.map(product =>
            limit(async () => {
                try {
                    console.log(`Syncing price for: ${product.name}`);
                    const searchResult = await ebay.searchItems(product.name);

                    if (searchResult.itemSummaries && searchResult.itemSummaries.length > 0) {
                        const topItem = searchResult.itemSummaries[0];
                        const newPrice = parseFloat(topItem.price.value);

                        // Update Product
                        await prisma.product.update({
                            where: { id: product.id },
                            data: {
                                price: newPrice,
                                lastPriceSync: new Date(),
                                currency: topItem.price.currency
                            }
                        });

                        // Add to Price History
                        await prisma.priceHistory.create({
                            data: {
                                productId: product.id,
                                price: newPrice,
                                date: new Date()
                            }
                        });

                        // Update associated UserAssets
                        await prisma.userAsset.updateMany({
                            where: { productId: product.id },
                            data: {
                                currentValue: newPrice
                            }
                        });

                        return { name: product.name, status: 'success', price: newPrice };
                    }
                    console.warn(`No results for ${product.name}`);
                    return { name: product.name, status: 'no_results' };
                } catch (err: any) {
                    const errMsg = err.response?.data?.errors?.[0]?.message || err.message;
                    console.error(`Failed to sync ${product.name}:`, errMsg);
                    return { name: product.name, status: 'error', error: errMsg };
                }
            })
        ));

        return NextResponse.json({
            message: 'Sync completed',
            results
        });
    } catch (error: any) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed', details: error.message }, { status: 500 });
    }
}
