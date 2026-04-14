import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { calculateNexfolioScore } from '@/lib/scoring';

export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const assets = await prisma.userAsset.findMany({
            where: { userId: user.id },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch price history for all linked products in one query
        const productIds = assets.map((a: any) => a.productId).filter(Boolean) as string[];
        const history = productIds.length > 0
            ? await prisma.priceHistory.findMany({
                where: { productId: { in: productIds } },
                orderBy: { date: 'desc' },
                select: { productId: true, price: true, date: true },
              })
            : [];

        const historyByProduct: Record<string, { price: number; date: Date }[]> = {};
        for (const h of history) {
            if (!historyByProduct[h.productId]) historyByProduct[h.productId] = [];
            historyByProduct[h.productId].push({ price: h.price, date: h.date });
        }

        const enriched = assets.map((asset: any) => ({
            ...asset,
            nexfolioScore: calculateNexfolioScore(
                {
                    id: asset.productId ?? asset.id,
                    price: asset.product?.price ?? asset.currentValue,
                    availabilityCount: asset.product?.availabilityCount ?? null,
                },
                historyByProduct[asset.productId] ?? []
            ),
        }));

        return NextResponse.json(enriched);
    } catch (error: any) {
        console.error('API /api/collection GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch collection', details: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await request.json();

        const newAsset = await prisma.userAsset.create({
            data: {
                userId: user.id,
                name: data.name,
                set: data.set,
                category: data.category,
                costBasis: data.costBasis,
                currentValue: data.currentValue,
                purchaseDate: new Date(data.purchaseDate),
                imageUrl: data.imageUrl,
                productId: data.productId,
                quantity: data.quantity || 1
            }
        });

        return NextResponse.json(newAsset);
    } catch (error: any) {
        console.error('API /api/collection POST Error:', error);
        return NextResponse.json({ error: 'Failed to save asset', details: error.message }, { status: 500 });
    }
}
