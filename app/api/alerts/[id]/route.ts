import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// PATCH /api/alerts/[id] — mark alert as read
export async function PATCH(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await prisma.$executeRaw`
            UPDATE "Alert"
            SET read = true
            WHERE id = ${params.id} AND "userId" = ${user.id}
        `;
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
    }
}

// DELETE /api/alerts/[id] — delete alert
export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await prisma.$executeRaw`
            DELETE FROM "Alert"
            WHERE id = ${params.id} AND "userId" = ${user.id}
        `;
        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
    }
}
