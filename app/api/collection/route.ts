import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';

const prisma = new PrismaClient();

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
        return NextResponse.json(assets);
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
                productId: data.productId
            }
        });

        return NextResponse.json(newAsset);
    } catch (error: any) {
        console.error('API /api/collection POST Error:', error);
        return NextResponse.json({ error: 'Failed to save asset', details: error.message }, { status: 500 });
    }
}
