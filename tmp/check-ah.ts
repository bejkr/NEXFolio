import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function run() {
    const asset = await p.product.findFirst({
        where: { name: { contains: 'Ascended' } }
    });
    console.log("Product:", asset);
    
    // Also check user assets
    const userAssets = await p.userAsset.findMany({
        where: { name: { contains: 'Ascended' } }
    });
    console.log("UserAssets:", userAssets);
}
run().finally(() => p.$disconnect());
