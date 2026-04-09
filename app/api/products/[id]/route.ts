import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateNexfolioScore, calculatePriceChange } from '@/lib/scoring';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                priceHistory: {
                    orderBy: {
                        date: 'asc'
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate real metrics
        const nexfolioScore = calculateNexfolioScore(product, product.priceHistory);
        const change30D = calculatePriceChange(product.priceHistory, 30);
        const change12M = calculatePriceChange(product.priceHistory, 365);

        return NextResponse.json({
            ...product,
            nexfolioScore,
            change30D,
            change12M
        });
    } catch (error: any) {
        console.error('API /api/products/[id] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch product from database' }, { status: 500 });
    }
}
