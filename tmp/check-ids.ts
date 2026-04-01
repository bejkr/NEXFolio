import prisma from '../lib/prisma';

async function checkIds() {
    try {
        const products = await (prisma as any).product.findMany({
            take: 5,
            select: { name: true, externalId: true, source: true }
        });
        console.log('--- DB Product IDs ---');
        products.forEach((p: any) => console.log(`- ${p.name}: ${p.externalId} [${p.source}]`));
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkIds();
