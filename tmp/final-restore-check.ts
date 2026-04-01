import prisma from '../lib/prisma';

async function finalCheck() {
    try {
        const totalProducts = await (prisma as any).product.count();
        const linkedProducts = await (prisma as any).product.findMany({
            where: { ebayItemId: { not: null } },
            include: { userAssets: true }
        });

        let restorable = 0;
        let missing = 0;

        for (const p of linkedProducts) {
            const assetWithImage = p.userAssets.find((a: any) => a.imageUrl && a.imageUrl.includes('cardmarket'));
            if (assetWithImage) {
                restorable++;
            } else {
                missing++;
                console.log(`Missing original image for: ${p.name}`);
            }
        }

        console.log(`Total Products: ${totalProducts}`);
        console.log(`Linked Products: ${linkedProducts.length}`);
        console.log(`Restorable from Assets: ${restorable}`);
        console.log(`Missing original image URL record: ${missing}`);

    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

finalCheck();
