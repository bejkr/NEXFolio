import prisma from '../lib/prisma';

async function checkUnlinked() {
    try {
        const unlinked = await (prisma as any).product.findMany({
            where: { ebayItemId: null },
            take: 10
        });
        console.log('--- Unlinked Products Sample ---');
        unlinked.forEach((p: any) => console.log(`- ${p.name} (${p.expansion || 'No Expansion'})`));
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkUnlinked();
