import prisma from '../lib/prisma';

async function checkUserAssets() {
    try {
        const assets = await (prisma as any).userAsset.findMany({
            where: {
                imageUrl: { contains: 'cardmarket.com' }
            },
            select: { productId: true, imageUrl: true }
        });
        console.log(`Found ${assets.length} assets with Cardmarket images.`);

        // Map of productId -> imageUrl
        const productImages = new Map<string, string>();
        assets.forEach((a: any) => {
            if (!productImages.has(a.productId)) {
                productImages.set(a.productId, a.imageUrl);
            }
        });

        console.log(`Unique products covered: ${productImages.size}`);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkUserAssets();
