import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.product.createMany({
        data: [
            {
                externalId: 'v1|test123|0',
                name: 'Destined Rivals Elite Trainer Box',
                expansion: 'Scarlet & Violet',
                category: 'Sealed',
                releaseYear: 2024,
                imageUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=400&auto=format&fit=crop',
                source: 'cardmarket',
            },
            {
                externalId: 'v1|test124|0',
                name: 'Evolving Skies Booster Box',
                expansion: 'Sword & Shield',
                category: 'Sealed',
                releaseYear: 2021,
                imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=400&auto=format&fit=crop',
                source: 'cardmarket',
            }
        ],
        skipDuplicates: true,
    });
    console.log('Seeded test products.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
