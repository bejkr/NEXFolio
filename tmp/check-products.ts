import prisma from '../lib/prisma';

async function checkProducts() {
    try {
        const products = await (prisma as any).product.findMany({
            where: {
                imageUrl: { contains: 'cardmarket.com' }
            },
            select: { id: true, name: true, imageUrl: true }
        });
        console.log(`Found ${products.length} products with Cardmarket images.`);
        if (products.length > 0) {
            console.log('Sample:', products[0]);
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkProducts();
