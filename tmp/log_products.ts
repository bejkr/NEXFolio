import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.product.findMany({where: {source: 'cardmarket'}, take: 5}).then(console.log).finally(() => p.$disconnect());
