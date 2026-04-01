import prisma from '../lib/prisma';

async function checkRestorable() {
    try {
        const productsCount = await (prisma as any).product.count({
            where: { ebayItemId: { not: null } }
        });

        // Find products with at least one asset that has a Cardmarket image
        const restorableProducts = await (prisma as any).product.findMany({
            where: {
                ebayItemId: { not: null },
                userAssets: {
                    some: {
                        imageUrl: { contains: 'cardmarket' }
                    }
                }
            },
            include: { userAssets: true }
        });

        console.log(`Linked Products: ${productsCount}`);
        console.log(`Restorable from Assets: ${restorableProducts.length}`);

        if (restorableProducts.length > 0) {
            console.log('Sample restore:');
            const p = restorableProducts[0];
            console.log(`- Product: ${p.name} | Current: ${p.imageUrl} | Original (from Asset): ${p.userAssets[0].imageUrl}`);
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkRestorable();
