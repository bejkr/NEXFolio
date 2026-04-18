import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get('q')?.trim() || '';
    if (q.length < 2) return NextResponse.json({ products: [], collection: [] });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [products, collection] = await Promise.all([
        prisma.product.findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            select: { id: true, name: true, expansion: true, category: true, price: true, imageUrl: true },
            take: 6,
            orderBy: { name: 'asc' },
        }),
        user ? (prisma as any).userAsset.findMany({
            where: {
                userId: user.id,
                name: { contains: q, mode: 'insensitive' },
            },
            select: { id: true, name: true, set: true, category: true, currentValue: true, imageUrl: true },
            take: 4,
        }) : Promise.resolve([]),
    ]);

    return NextResponse.json({ products, collection });
}
