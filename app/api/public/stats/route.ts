import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cache for 1 hour — landing page stat, no auth required
export const revalidate = 3600;

export async function GET() {
    const [products, pricePoints, expansions] = await Promise.all([
        prisma.product.count(),
        prisma.priceHistory.count(),
        prisma.product.groupBy({ by: ['expansion'], _count: true }).then(r => r.length),
    ]);

    return NextResponse.json({ products, pricePoints, expansions });
}
