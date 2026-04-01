import prisma from '../lib/prisma';

async function checkLinked() {
    try {
        const linked = await (prisma as any).product.findMany({
            where: { ebayItemId: { not: null } },
            take: 5
        });
        console.log('--- Linked Products (Current State) ---');
        linked.forEach((p: any) => {
            console.log(`- ${p.name}: ID=${p.id} | ExtID=${p.externalId} | Img=${p.imageUrl}`);
        });
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkLinked();
