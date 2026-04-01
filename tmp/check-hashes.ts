import prisma from '../lib/prisma';

async function checkHashes() {
    try {
        const unlinked = await (prisma as any).product.findMany({
            where: { ebayItemId: null },
            take: 10
        });
        console.log('--- Unlinked Products Hash Check ---');
        unlinked.forEach((p: any) => {
            console.log(`- ${p.name}: ${p.imageUrl}`);
        });
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkHashes();
