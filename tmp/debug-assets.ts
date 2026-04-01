import prisma from '../lib/prisma';

async function debugAssets() {
    try {
        const assets = await (prisma as any).userAsset.findMany({
            take: 20,
            select: { name: true, imageUrl: true }
        });
        console.log('--- Asset Images Debug (First 20) ---');
        assets.forEach((a: any) => console.log(`- ${a.name}: ${a.imageUrl}`));
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

debugAssets();
