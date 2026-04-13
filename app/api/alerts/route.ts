import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

// GET /api/alerts — fetch all alerts for authenticated user
export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const alerts = await prisma.$queryRaw<any[]>`
            SELECT id, "userId", type, severity, title, description, read, "createdAt"
            FROM "Alert"
            WHERE "userId" = ${user.id}
            ORDER BY "createdAt" DESC
            LIMIT 100
        `;

        return NextResponse.json(
            alerts.map(a => ({
                id: a.id,
                type: a.type,
                severity: a.severity,
                title: a.title,
                description: a.description,
                read: a.read,
                timestamp: a.createdAt,
            }))
        );
    } catch (err: any) {
        console.error('GET /api/alerts error:', err.message);
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }
}

// POST /api/alerts/mark-all-read is below, but also handle POST for creating an alert
export async function POST(req: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // Mark all as read
    if (action === 'mark-all-read') {
        try {
            await prisma.$executeRaw`
                UPDATE "Alert" SET read = true WHERE "userId" = ${user.id} AND read = false
            `;
            return NextResponse.json({ ok: true });
        } catch (err: any) {
            return NextResponse.json({ error: 'Failed to mark all read' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
