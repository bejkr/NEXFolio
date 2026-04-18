import prisma from '../../lib/prisma';

async function mergeAndDelete(garbageExternalId: string, correctExternalId: string) {
    const garbage = await prisma.product.findUnique({ where: { externalId: garbageExternalId } });
    const correct = await prisma.product.findUnique({ where: { externalId: correctExternalId } });

    if (!garbage) {
        console.log(`No garbage product found for ${garbageExternalId}`);
        return;
    }
    if (!correct) {
        // No duplicate — just rename
        await prisma.product.update({ where: { externalId: garbageExternalId }, data: { externalId: correctExternalId } });
        console.log(`Renamed ${garbageExternalId} → ${correctExternalId}`);
        return;
    }

    console.log(`Merging: "${garbage.name}" (garbage) into "${correct.name}" (correct)`);

    // Move priceHistory from garbage to correct
    await prisma.priceHistory.updateMany({
        where: { productId: garbage.id },
        data: { productId: correct.id }
    });

    // Move userAssets from garbage to correct
    await prisma.userAsset.updateMany({
        where: { productId: garbage.id },
        data: { productId: correct.id }
    });

    // Delete garbage product
    await prisma.product.delete({ where: { id: garbage.id } });

    console.log(`✅ Deleted garbage product, moved assets/history to correct product`);
}

async function main() {
    await mergeAndDelete('v1|test123|0', 'Destined-Rivals-Elite-Trainer-Box');
    await mergeAndDelete('v1|test124|0', 'Evolving-Skies-Booster-Box');

    const remaining = await prisma.product.findMany({
        where: { externalId: { contains: '|' } },
        select: { name: true, externalId: true }
    });

    console.log(remaining.length === 0 ? '\nNo more garbage externalIds ✅' : `\nStill garbage: ${JSON.stringify(remaining)}`);

    await prisma.$disconnect();
}

main();
