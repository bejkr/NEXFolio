import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    try {
        const count = await prisma.priceHistory.count();
        console.log('PriceHistory count:', count);
    } catch (e: any) {
        console.error('Error fetching PriceHistory:', e.message);
    }
    const user = await prisma.userAsset.findFirst({select: {userId: true}});
    if (!user) {
        console.log('No users with assets');
        return;
    }
    console.log('Testing performance logic for user', user.userId);
    const assets = await prisma.userAsset.findMany({
        where: { userId: user.userId },
        include: { product: { include: { priceHistory: { orderBy: { date: 'asc' } } } } }
    });
    console.log('Assets length:', assets.length);
    if(assets.length > 0) {
        console.log('First asset:', {id: assets[0].id, name: assets[0].name, purchaseDate: assets[0].purchaseDate, priceHistory: assets[0].product?.priceHistory?.length});
    }
}
main().finally(() => prisma.$disconnect());
