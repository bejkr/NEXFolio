import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.$executeRaw`
        DELETE FROM "WatchlistItem"
        WHERE id = ${params.id} AND "userId" = ${user.id}
    `;
    return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetPrice } = await request.json();

    await prisma.$executeRaw`
        UPDATE "WatchlistItem"
        SET "targetPrice" = ${targetPrice ?? null}
        WHERE id = ${params.id} AND "userId" = ${user.id}
    `;

    const rows = await prisma.$queryRaw<any[]>`
        SELECT id, "productId", "targetPrice" FROM "WatchlistItem"
        WHERE id = ${params.id} LIMIT 1
    `;
    return NextResponse.json(rows[0] ?? { id: params.id, targetPrice });
}
