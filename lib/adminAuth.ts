import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Verifies that the request comes from an admin.
 * Two accepted methods (either is sufficient):
 *   1. x-admin-secret header matching ADMIN_SECRET env var  (for scripts / cron)
 *   2. Authenticated Supabase session with email matching ADMIN_EMAIL env var (for UI)
 *
 * Returns null if authorised, or a NextResponse 401/403 to return immediately.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
    const adminSecret = process.env.ADMIN_SECRET;
    const adminEmail  = process.env.ADMIN_EMAIL;

    // ── Method 1: secret header (scripts / cron jobs) ────────────────────
    const headerSecret = req.headers.get('x-admin-secret');
    if (adminSecret && headerSecret) {
        if (headerSecret === adminSecret) return null; // authorised
        return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 });
    }

    // ── Method 2: Supabase session + admin email check ───────────────────
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (adminEmail && user.email !== adminEmail) {
        return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    return null; // authorised
}
