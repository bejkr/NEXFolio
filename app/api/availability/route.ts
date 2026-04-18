import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculatePriceChange } from '@/lib/scoring';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const query  = searchParams.get('q') || '';
    const filter = searchParams.get('filter') || 'all'; // all | scarce | liquid
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

    try {
        const where: any = { availabilityCount: { not: null } };

        if (query) {
            where.name = { contains: query, mode: 'insensitive' };
        }

        if (filter === 'scarce') {
            where.availabilityCount = { lt: 20, not: null };
        } else if (filter === 'liquid') {
            where.availabilityCount = { gt: 100 };
        }

        const orderBy = filter === 'liquid'
            ? [{ availabilityCount: 'desc' as const }]
            : [{ availabilityCount: 'asc' as const }];

        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE,
                include: {
                    priceHistory: { orderBy: { date: 'desc' }, take: 60 }
                }
            })
        ]);

        const items = products.map(p => ({
            id: p.id,
            name: p.name,
            expansion: p.expansion,
            category: p.category,
            price: p.price,
            availabilityCount: p.availabilityCount,
            imageUrl: p.imageUrl,
            change30D: calculatePriceChange(p.priceHistory, 30),
        }));

        return NextResponse.json({
            items,
            total,
            page,
            pageSize: PAGE_SIZE,
            totalPages: Math.ceil(total / PAGE_SIZE),
        });
    } catch (err: any) {
        console.error('/api/availability error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
