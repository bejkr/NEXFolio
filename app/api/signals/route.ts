import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { calculateNexfolioScore, calculatePriceChange } from '@/lib/scoring';
import { PortfolioSignal } from '@/components/PortfolioSignals';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const assets = await (prisma as any).userAsset.findMany({
        where: { userId: user.id },
        include: { product: true },
    });

    if (assets.length === 0) return NextResponse.json([]);

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

    // Allocation for concentration signal
    const totalValue = assets.reduce((s: number, a: any) => {
        return s + (a.product?.price ?? a.currentValue) * (a.quantity || 1);
    }, 0);
    const allocationMap: Record<string, number> = {};
    for (const a of assets) {
        const cat = a.category || 'Unknown';
        const val = (a.product?.price ?? a.currentValue) * (a.quantity || 1);
        allocationMap[cat] = (allocationMap[cat] || 0) + val;
    }
    const allocationData = Object.entries(allocationMap).map(([name, val]) => ({
        name,
        value: totalValue > 0 ? Number(((val / totalValue) * 100).toFixed(1)) : 0,
    }));

    const rawSignals: PortfolioSignal[] = [];

    for (const asset of assets) {
        const price  = asset.product?.price ?? asset.currentValue;
        const qty    = asset.quantity || 1;
        const cost   = asset.costBasis * qty;
        const value  = price * qty;
        const pnlPct = cost > 0 ? ((value - cost) / cost) * 100 : 0;
        const ph     = historyByProduct[asset.productId] ?? [];
        const ch30   = calculatePriceChange(ph, 30);
        const ch12M  = calculatePriceChange(ph, 365);
        const score  = calculateNexfolioScore(
            { id: asset.productId ?? asset.id, price, availabilityCount: asset.product?.availabilityCount ?? null },
            ph
        );
        const href = asset.productId ? `/products/db_${asset.productId}` : undefined;
        const tag  = asset.name as string;

        if (pnlPct > 80) {
            rawSignals.push({ id: `profit-high-${asset.id}`, kind: 'profit', priority: 1,
                title: 'Take Profit',
                body: `Up ${pnlPct.toFixed(0)}% since purchase — consider locking in gains.`,
                tag, href });
        } else if (pnlPct > 40) {
            rawSignals.push({ id: `profit-med-${asset.id}`, kind: 'profit', priority: 2,
                title: 'Consider Rebalancing',
                body: `+${pnlPct.toFixed(0)}% gain — position may be oversized.`,
                tag, href });
        }

        if (ch30 != null && ch30 < -10) {
            rawSignals.push({ id: `decline-${asset.id}`, kind: 'risk', priority: ch30 < -20 ? 1 : 2,
                title: 'Price Declining',
                body: `${ch30.toFixed(1)}% over 30 days — review your position.`,
                tag, href });
        }

        if (ch30 != null && ch30 > 15) {
            rawSignals.push({ id: `momentum-${asset.id}`, kind: 'momentum', priority: 3,
                title: 'Strong Momentum',
                body: `+${ch30.toFixed(1)}% in 30 days — watch for continuation.`,
                tag, href });
        }

        if (ch12M != null && ch12M < -20) {
            rawSignals.push({ id: `under-${asset.id}`, kind: 'warn', priority: 2,
                title: 'Long-term Underperformer',
                body: `${ch12M.toFixed(0)}% over 12 months — may be worth reconsidering.`,
                tag, href });
        }

        if (score >= 75) {
            rawSignals.push({ id: `score-${asset.id}`, kind: 'info', priority: 3,
                title: 'High Nexfolio Score',
                body: `Score ${score}/100 — strong scarcity and momentum fundamentals.`,
                tag, href });
        }
    }

    // Concentration Risk
    const top = [...allocationData].sort((a, b) => b.value - a.value)[0];
    if (top && top.value > 55) {
        rawSignals.push({ id: 'concentration', kind: 'warn', priority: 1,
            title: 'Concentration Risk',
            body: `${top.name} makes up ${top.value}% of your portfolio — consider diversifying.` });
    }

    const signals = rawSignals.sort((a, b) => a.priority - b.priority).slice(0, 10);
    return NextResponse.json(signals);
}
