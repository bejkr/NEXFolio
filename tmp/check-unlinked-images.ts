import prisma from '../lib/prisma';

async function checkUnlinked() {
    try {
        const unlinked = await (prisma as any).product.findMany({
            where: { ebayItemId: null },
            take: 5
        });
        console.log('--- Unlinked Products (Original Images) ---');
        unlinked.forEach((p: any) => {
            console.log(`- ${p.name}: ${p.imageUrl}`);
        });
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkUnlinked();
