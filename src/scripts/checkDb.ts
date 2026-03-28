import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const products = await prisma.product.findMany({
        where: {
            imageUrl: { not: null }
        },
        take: 10
    });

    console.log(`Found ${products.length} products with images in DB.`);
    products.forEach(p => {
        console.log(`- ${p.name}: ${p.imageUrl}`);
    });

    await prisma.$disconnect();
}

check();
