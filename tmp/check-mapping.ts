import prisma from '../lib/prisma';

async function checkMapping() {
    try {
        const product = await (prisma as any).product.findFirst({
            where: { externalId: "733620" }
        });
        if (product) {
            console.log(`Found Product: ${product.name} | Current Source: ${product.source}`);
        } else {
            console.log('Product not found for externalId: 733620');
        }
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

checkMapping();
