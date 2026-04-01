import prisma from '../lib/prisma';

async function checkAssetImages() {
    try {
        const assets = await (prisma as any).userAsset.findMany({
            take: 10,
            include: { product: true }
        });
        console.log('--- User Assets (Image Check) ---');
        assets.forEach((a: any) => {
            console.log(`- Asset: ${a.name} | AssetImg: ${a.imageUrl} | ProdImg: ${a.product?.imageUrl}`);
        });
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkAssetImages();
