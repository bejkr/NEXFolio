import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { calculatePriceChange, calculateNexfolioScore } from '@/lib/scoring';

export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Raw query — works without regenerated Prisma client
    const items = await prisma.$queryRaw<any[]>`
        SELECT
            w.id, w."productId", w."targetPrice", w."addedAt",
            p.name, p.expansion, p.category, p."imageUrl",
            p.price, p."availabilityCount"
        FROM "WatchlistItem" w
        JOIN "Product" p ON p.id = w."productId"
        WHERE w."userId" = ${user.id}
        ORDER BY w."addedAt" DESC
    `;

    // Fetch price history for all watched products
    const productIds = items.map((i: any) => i.productId);
    const history = productIds.length > 0
        ? await prisma.priceHistory.findMany({
            where: { productId: { in: productIds } },
            orderBy: { date: 'desc' },
            select: { productId: true, price: true, date: true },
          })
        : [];

    const historyByProduct: Record<string, any[]> = {};
    for (const h of history) {
        if (!historyByProduct[h.productId]) historyByProduct[h.productId] = [];
        historyByProduct[h.productId].push(h);
    }

    const enriched = items.map((item: any) => {
        const ph = historyByProduct[item.productId] || [];
        return {
            id: item.id,
            productId: item.productId,
            targetPrice: item.targetPrice,
            addedAt: item.addedAt,
            name: item.name,
            expansion: item.expansion,
            category: item.category,
            imageUrl: item.imageUrl,
            price: item.price,
            availabilityCount: item.availabilityCount,
            change30D: calculatePriceChange(ph, 30),
            change12M: calculatePriceChange(ph, 365),
            nexfolioScore: calculateNexfolioScore(
                { id: item.productId, price: item.price, availabilityCount: item.availabilityCount },
                ph
            ),
        };
    });

    return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, targetPrice } = await request.json();
    if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 });

    try {
        const id = crypto.randomUUID();
        await prisma.$executeRaw`
            INSERT INTO "WatchlistItem" (id, "userId", "productId", "targetPrice", "addedAt")
            VALUES (${id}, ${user.id}, ${productId}, ${targetPrice ?? null}, NOW())
            ON CONFLICT ("userId", "productId") DO NOTHING
        `;

        // Fetch back the created/existing item
        const rows = await prisma.$queryRaw<any[]>`
            SELECT id, "productId", "targetPrice", "addedAt"
            FROM "WatchlistItem"
            WHERE "userId" = ${user.id} AND "productId" = ${productId}
            LIMIT 1
        `;
        return NextResponse.json(rows[0] ?? { id, productId }, { status: 201 });
    } catch (err: any) {
        console.error('/api/watchlist POST error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
