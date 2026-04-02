import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const p = new PrismaClient();
async function run() {
    const assets = await p.userAsset.findMany({
        where: { name: { contains: 'Ascended' } },
        include: { product: true }
    });
    fs.writeFileSync('tmp/dump.json', JSON.stringify(assets, null, 2));
}
run().finally(() => p.$disconnect());
