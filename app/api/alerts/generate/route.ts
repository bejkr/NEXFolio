import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

const PRICE_ALERT_THRESHOLD = 0.05;  // 5%  → info
const PRICE_ALERT_WARN      = 0.10;  // 10% → warning
const PRICE_ALERT_CRITICAL  = 0.20;  // 20% → critical
const DEDUP_WINDOW_H        = 24;    // don't re-create unread alert within 24h
const DEDUP_READ_WINDOW_H   = 168;   // don't re-create already-read alert within 7 days

// POST /api/alerts/generate
// Checks the authenticated user's portfolio for significant price changes
// and creates new DB alerts (deduplicated).
export async function POST() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // ── Load user's portfolio with recent price history ─────────────
        const assets = await (prisma as any).userAsset.findMany({
            where: { userId: user.id, productId: { not: null } },
            include: {
                product: {
                    include: {
                        priceHistory: {
                            orderBy: { date: 'desc' },
                            take: 10, // last 10 entries is enough
                        }
                    }
                }
            }
        });

        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        const dedupWindowStart     = new Date(now.getTime() - DEDUP_WINDOW_H * 60 * 60 * 1000);
        const dedupReadWindowStart = new Date(now.getTime() - DEDUP_READ_WINDOW_H * 60 * 60 * 1000);

        // ── Existing alerts in dedup window (to avoid duplicates) ───────
        // Fetch unread alerts from last 24h + all read alerts from last 7 days
        const [recentUnread, recentRead] = await Promise.all([
            prisma.$queryRaw<{ title: string }[]>`
                SELECT title FROM "Alert"
                WHERE "userId" = ${user.id}
                  AND "createdAt" >= ${dedupWindowStart}
                  AND read = false
            `,
            prisma.$queryRaw<{ title: string }[]>`
                SELECT title FROM "Alert"
                WHERE "userId" = ${user.id}
                  AND "createdAt" >= ${dedupReadWindowStart}
                  AND read = true
            `,
        ]);
        const existingTitles = new Set([
            ...recentUnread.map(a => a.title),
            ...recentRead.map(a => a.title),
        ]);

        const created: string[] = [];

        for (const asset of assets) {
            const product = asset.product;
            if (!product || !product.price) continue;

            const history: any[] = product.priceHistory;
            if (history.length < 2) continue;

            // Most recent entry (sorted desc → index 0)
            const latest = history[0];
            // Find the most recent entry that is ≥ 48h old
            const oldEntry = history.find(
                (h: any) => new Date(h.date) <= fortyEightHoursAgo
            );
            if (!oldEntry) continue;

            const priceBefore = oldEntry.price;
            const priceNow    = latest.price;
            if (priceBefore <= 0) continue;

            const changePct = (priceNow - priceBefore) / priceBefore;
            const absChange = Math.abs(changePct);
            if (absChange < PRICE_ALERT_THRESHOLD) continue;

            // Determine severity and direction
            let severity: 'info' | 'warning' | 'critical' = 'info';
            if (absChange >= PRICE_ALERT_CRITICAL) severity = 'critical';
            else if (absChange >= PRICE_ALERT_WARN) severity = 'warning';

            const direction = changePct > 0 ? '📈 Up' : '📉 Down';
            const sign      = changePct > 0 ? '+' : '';
            const title     = `${direction} ${sign}${(changePct * 100).toFixed(1)}%: ${product.name}`;
            const description = `${product.name} moved from €${priceBefore.toFixed(2)} to €${priceNow.toFixed(2)} (${sign}${(changePct * 100).toFixed(1)}%) in the last 48 hours.`;

            // Dedup check
            if (existingTitles.has(title)) continue;

            await prisma.$executeRaw`
                INSERT INTO "Alert" (id, "userId", type, severity, title, description, read, "createdAt")
                VALUES (
                    gen_random_uuid()::text,
                    ${user.id},
                    'price',
                    ${severity},
                    ${title},
                    ${description},
                    false,
                    NOW()
                )
            `;

            existingTitles.add(title); // prevent double-insert in same loop
            created.push(title);
        }

        return NextResponse.json({ created: created.length, alerts: created });
    } catch (err: any) {
        console.error('POST /api/alerts/generate error:', err.message);
        return NextResponse.json({ error: 'Failed to generate alerts' }, { status: 500 });
    }
}
