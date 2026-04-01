import prisma from '../lib/prisma';

async function checkProgress() {
    try {
        const total = await (prisma as any).product.count();
        const linked = await (prisma as any).product.count({
            where: { ebayItemId: { not: null } }
        });
        console.log(`Progress: ${linked} / ${total} products linked.`);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkProgress();
