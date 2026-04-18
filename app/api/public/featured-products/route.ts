import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 3600;

export async function GET() {
    // Fetch 40 products with images, spread across price ranges for variety
    const products = await prisma.product.findMany({
        where: {
            imageUrl: { not: null },
            price: { not: null, gt: 10 },
        },
        select: { id: true, name: true, imageUrl: true, price: true },
        orderBy: { price: 'desc' },
        take: 80,
    });

    // Pick every other one to get variety across price range
    const picked = products.filter((_, i) => i % 2 === 0).slice(0, 40);

    return NextResponse.json(picked);
}
