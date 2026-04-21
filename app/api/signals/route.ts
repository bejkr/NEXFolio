import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { calculateNexfolioScore, calculatePriceChange } from '@/lib/scoring';
import { PortfolioSignal } from '@/components/PortfolioSignals';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

const AI_SYSTEM_PROMPT = `You are a TCG (Trading Card Game) portfolio analyst for Nexfolio. Analyze the user's portfolio and return 2-4 actionable signals that complement rule-based signals.

Focus on patterns rules can't catch: cross-card correlations, expansion trends, unusual risk/reward combos, portfolio health insights.

Return ONLY a valid JSON array — no markdown, no explanation:
[
  {
    "id": "ai-1",
    "kind": "profit" | "risk" | "momentum" | "warn" | "info",
    "priority": 1 | 2 | 3,
    "title": "Max 30 chars",
    "body": "One actionable sentence, max 120 chars.",
    "tag": "Card name or null"
  }
]

Priority: 1=urgent, 2=consider acting, 3=informational.`;

function getAdminClient() {
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

function isToday(date: Date): boolean {
    const now = new Date();
    return (
        date.getUTCFullYear() === now.getUTCFullYear() &&
        date.getUTCMonth() === now.getUTCMonth() &&
        date.getUTCDate() === now.getUTCDate()
    );
}

async function getCachedAiSignals(userId: string): Promise<PortfolioSignal[] | null> {
    const admin = getAdminClient();
    const { data } = await admin
        .from('ai_signal_cache')
        .select('signals, generated_at')
        .eq('user_id', userId)
        .single();

    if (!data) return null;
    if (!isToday(new Date(data.generated_at))) return null;
    return data.signals as PortfolioSignal[];
}

async function saveAiSignals(userId: string, signals: PortfolioSignal[]) {
    const admin = getAdminClient();
    await admin.from('ai_signal_cache').upsert({
        user_id: userId,
        signals,
        generated_at: new Date().toISOString(),
    });
}

async function generateAiSignals(portfolioSummary: string): Promise<PortfolioSignal[]> {
    const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: [
            {
                type: 'text',
                text: AI_SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
            },
        ],
        messages: [
            {
                role: 'user',
                content: portfolioSummary,
            },
        ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '[]';
    try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) return [];
        return parsed as PortfolioSignal[];
    } catch {
        return [];
    }
}

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

    // Rule-based signals
    const rawSignals: PortfolioSignal[] = [];
    const assetSummaries: string[] = [];

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

        assetSummaries.push(
            `${asset.name} (${asset.category}, ${asset.product?.expansion ?? asset.set}): ` +
            `price €${price.toFixed(2)}, qty ${qty}, PnL ${pnlPct.toFixed(1)}%, ` +
            `30D change ${ch30 != null ? `${ch30.toFixed(1)}%` : 'n/a'}, ` +
            `12M change ${ch12M != null ? `${ch12M.toFixed(1)}%` : 'n/a'}, ` +
            `score ${score}/100`
        );
    }

    // Concentration Risk
    const top = [...allocationData].sort((a, b) => b.value - a.value)[0];
    if (top && top.value > 55) {
        rawSignals.push({ id: 'concentration', kind: 'warn', priority: 1,
            title: 'Concentration Risk',
            body: `${top.name} makes up ${top.value}% of your portfolio — consider diversifying.` });
    }

    // AI signals (cached per day)
    let aiSignals: PortfolioSignal[] = [];
    try {
        const cached = await getCachedAiSignals(user.id);
        if (cached) {
            aiSignals = cached;
        } else {
            const portfolioSummary =
                `Portfolio: ${assets.length} cards, total value €${totalValue.toFixed(2)}\n` +
                `Allocation: ${allocationData.map(a => `${a.name} ${a.value}%`).join(', ')}\n\n` +
                `Assets:\n${assetSummaries.join('\n')}`;

            aiSignals = await generateAiSignals(portfolioSummary);
            await saveAiSignals(user.id, aiSignals);
        }
    } catch {
        // AI signals are non-critical — degrade gracefully
    }

    const allSignals = [...rawSignals, ...aiSignals]
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 10);

    return NextResponse.json(allSignals);
}
