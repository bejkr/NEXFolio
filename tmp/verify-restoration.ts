import prisma from '../lib/prisma';

async function verify() {
    const total = await (prisma as any).product.count();
    const ebayImages = await (prisma as any).product.count({
        where: { imageUrl: { contains: 'ebayimg.com' } }
    });
    const cardmarketImages = await (prisma as any).product.count({
        where: { imageUrl: { contains: 'cardmarket.com' } }
    });

    console.log(`--- VERIFICATION ---`);
    console.log(`Total Products: ${total}`);
    console.log(`eBay Images: ${ebayImages}`);
    console.log(`Cardmarket Images: ${cardmarketImages}`);
    console.log(`Other: ${total - ebayImages - cardmarketImages}`);
}

verify().catch(console.error);
