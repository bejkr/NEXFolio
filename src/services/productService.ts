import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface ProductData {
    externalId: string;
    name: string;
    expansion: string;
    category: string;
    releaseYear?: number;
    imageUrl?: string;
    source?: string;
    price?: number;
}

export const productService = {
    async upsertProduct(data: ProductData) {
        try {
            const product = await prisma.product.upsert({
                where: { externalId: data.externalId },
                update: {
                    name: data.name,
                    expansion: data.expansion,
                    category: data.category,
                    releaseYear: data.releaseYear,
                    imageUrl: data.imageUrl,
                    price: data.price,
                    updatedAt: new Date(),
                },
                create: {
                    ...data,
                },
            });
            logger.debug(`Upserted product: ${product.name}`);
            return product;
        } catch (error) {
            logger.error(`Failed to upsert product ${data.externalId}`, error);
            throw error;
        }
    },

    async disconnect() {
        await prisma.$disconnect();
    }
};
