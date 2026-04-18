import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { calculatePriceChange } from '@/lib/scoring';
import { MarketContent } from '@/components/market/MarketContent';
import {
    MarketOverviewData,
    EraPerformance,
    MarketAsset,
    MarketTrendData,
} from "@/lib/mockData";

export const metadata: Metadata = {
    title: 'Market | Nexfolio',
    description: 'Pokémon TCG market overview and analytics.',
};

export const dynamic = 'force-dynamic';

// ── Era definitions ───────────────────────────────────────────────
const ERAS = [
    { era: 'Vintage',       min: 0,    max: 2002 },
    { era: 'EX Era',        min: 2003, max: 2007 },
    { era: 'DP/Platinum',   min: 2008, max: 2010 },
    { era: 'BW Era',        min: 2011, max: 2013 },
    { era: 'XY Era',        min: 2014, max: 2016 },
    { era: 'Sun/Moon',      min: 2017, max: 2019 },
    { era: 'Sword/Shield',  min: 2020, max: 2022 },
    { era: 'Scarlet/Violet',min: 2023, max: 9999 },
];

export default async function MarketPage() {
    const now = new Date();
    const twelveMonthsAgo = new Date(now); twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

    // ── 1. Fetch product lists ────────────────────────────────────
    const [sealedProducts, gradedProducts, lastSync] = await Promise.all([
        prisma.product.findMany({
            where: { category: { contains: 'Sealed', mode: 'insensitive' }, price: { not: null } },
            orderBy: { availabilityCount: 'desc' },
            take: 150,
            select: { id: true, price: true, availabilityCount: true },
        }),
        prisma.product.findMany({
            where: { category: { contains: 'Graded', mode: 'insensitive' }, price: { not: null } },
            orderBy: { availabilityCount: 'desc' },
            take: 150,
            select: { id: true, price: true, availabilityCount: true },
        }),
        prisma.product.findFirst({
            where: { lastPriceSync: { not: null } },
            orderBy: { lastPriceSync: 'desc' },
            select: { lastPriceSync: true },
        }),
    ]);

    const sealedIdSet = new Set(sealedProducts.map(p => p.id));
    const gradedIdSet = new Set(gradedProducts.map(p => p.id));
    const trendIds = [
        ...sealedProducts.slice(0, 60).map(p => p.id),
        ...gradedProducts.slice(0, 40).map(p => p.id),
    ];

    // ── 2. Price history for overview index & trend chart ─────────
    const [oldPriceHistory, trendHistory] = await Promise.all([
        // Prices at 12M ago — for sealed/graded index
        prisma.priceHistory.findMany({
            where: {
                productId: { in: [...sealedProducts.map(p => p.id), ...gradedProducts.map(p => p.id)] },
                date: { lte: twelveMonthsAgo },
            },
            orderBy: { date: 'desc' },
            select: { productId: true, price: true },
        }),
        // Last 12M history for trend chart (top products only)
        prisma.priceHistory.findMany({
            where: { productId: { in: trendIds }, date: { gte: twelveMonthsAgo } },
            select: { productId: true, price: true, date: true },
            orderBy: { date: 'asc' },
        }),
    ]);

    // ── 3. Top products with history (for movers + era + liquidity)
    const topProducts = await prisma.product.findMany({
        where: { price: { not: null }, availabilityCount: { not: null } },
        orderBy: { availabilityCount: 'desc' },
        take: 300,
        select: {
            id: true, name: true, category: true, price: true,
            availabilityCount: true, releaseYear: true,
            priceHistory: { orderBy: { date: 'desc' }, take: 90 },
        },
    });

    // ── 4. MarketOverview ─────────────────────────────────────────
    // Most recent old price per product (first match = latest ≤ 12M ago due to desc sort)
    const oldPriceMap: Record<string, number> = {};
    for (const h of oldPriceHistory) {
        if (!oldPriceMap[h.productId]) oldPriceMap[h.productId] = h.price;
    }

    function avgIndexChange(products: { id: string; price: number | null }[]) {
        const changes = products
            .filter(p => oldPriceMap[p.id] && oldPriceMap[p.id] > 0 && p.price)
            .map(p => ((p.price! - oldPriceMap[p.id]) / oldPriceMap[p.id]) * 100);
        return changes.length > 0
            ? Number((changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(1))
            : 0;
    }

    const sealedIndex12M = avgIndexChange(sealedProducts);
    const gradedIndex12M = avgIndexChange(gradedProducts);

    const maxListings = Math.max(...topProducts.map(p => p.availabilityCount ?? 0), 1);

    const avgAvail = topProducts.reduce((s, p) => s + (p.availabilityCount ?? 0), 0) / (topProducts.length || 1);
    const averageLiquidity = Math.min(100, Math.round(
        (Math.log10(avgAvail + 1) / Math.log10(maxListings + 1)) * 100
    ));

    // Market volatility: std dev of change30D values across top products
    const allChanges30D = topProducts
        .map(p => calculatePriceChange(p.priceHistory, 30))
        .filter((v): v is number => v !== null);

    let marketVolatility = 0;
    if (allChanges30D.length >= 2) {
        const mean = allChanges30D.reduce((a, b) => a + b, 0) / allChanges30D.length;
        const variance = allChanges30D.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (allChanges30D.length - 1);
        marketVolatility = Math.min(99, Number(Math.sqrt(variance).toFixed(1)));
    }

    const marketOverview: MarketOverviewData = {
        sealedIndex12M,
        gradedIndex12M,
        averageLiquidity,
        marketVolatility,
    };

    // ── 5. MarketTrendChart (monthly avg price for sealed vs graded)
    const monthlyBuckets: Record<string, { sealed: number[]; graded: number[] }> = {};

    for (const h of trendHistory) {
        const d = new Date(h.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyBuckets[key]) monthlyBuckets[key] = { sealed: [], graded: [] };
        if (sealedIdSet.has(h.productId)) monthlyBuckets[key].sealed.push(h.price);
        if (gradedIdSet.has(h.productId)) monthlyBuckets[key].graded.push(h.price);
    }

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData: MarketTrendData[] = Object.entries(monthlyBuckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, { sealed, graded }]) => {
            const [year, month] = key.split('-');
            const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
            return {
                date: `${MONTHS[parseInt(month) - 1]} ${year.slice(2)}`,
                sealedIndex: Number(avg(sealed).toFixed(2)),
                gradedIndex: Number(avg(graded).toFixed(2)),
            };
        })
        .filter(d => d.sealedIndex > 0 || d.gradedIndex > 0);

    // ── 6. Movers & Liquidity Board ───────────────────────────────
    const withMetrics: (MarketAsset & { price: number | null })[] = topProducts.map(p => {
        const listings = p.availabilityCount ?? 0;
        const liquidityScore = listings === 0 ? 5
            : Math.min(100, Math.round((Math.log10(listings + 1) / Math.log10(maxListings + 1)) * 100));
        const cat = p.category?.toLowerCase().includes('sealed') ? 'Sealed'
            : p.category?.toLowerCase().includes('graded') ? 'Graded'
            : 'Raw';

        return {
            id: p.id,
            name: p.name,
            category: cat as 'Sealed' | 'Graded' | 'Raw',
            change30D: calculatePriceChange(p.priceHistory, 30),
            change12M: calculatePriceChange(p.priceHistory, 365),
            liquidityScore,
            activeListings: listings,
            price: p.price,
        };
    });

    const gainers: MarketAsset[] = withMetrics
        .filter(p => p.change30D !== null && p.change30D > 0)
        .sort((a, b) => (b.change30D ?? 0) - (a.change30D ?? 0))
        .slice(0, 5);

    const decliners: MarketAsset[] = withMetrics
        .filter(p => p.change30D !== null && p.change30D < 0)
        .sort((a, b) => (a.change30D ?? 0) - (b.change30D ?? 0))
        .slice(0, 5);

    const liquidityBoard: MarketAsset[] = withMetrics
        .sort((a, b) => b.activeListings - a.activeListings)
        .slice(0, 10);

    // ── 7. Era Heatmap ────────────────────────────────────────────
    const eraPerformance: EraPerformance[] = ERAS.map(({ era, min, max }) => {
        const eraProds = topProducts.filter(p => {
            const y = p.releaseYear;
            return y != null && y >= min && y <= max;
        });
        if (eraProds.length === 0) return null;

        const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

        const changes3M  = eraProds.map(p => calculatePriceChange(p.priceHistory, 90)).filter((v): v is number => v !== null);
        const changes12M = eraProds.map(p => calculatePriceChange(p.priceHistory, 365)).filter((v): v is number => v !== null);

        if (changes3M.length === 0 && changes12M.length === 0) return null;

        const perf3M  = Number(avg(changes3M).toFixed(1));
        const perf12M = Number(avg(changes12M).toFixed(1));

        return {
            era,
            perf3M,
            perf12M,
            trend: perf3M > 1 ? 'up' : perf3M < -1 ? 'down' : 'flat',
        } satisfies EraPerformance;
    }).filter(Boolean) as EraPerformance[];

    // ── Render ────────────────────────────────────────────────────
    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Market</h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Real-time insights on the Pokémon TCG market from Cardmarket data.
                    </p>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block shrink-0">
                    Last sync:{' '}
                    <span className="text-gray-300 font-medium">
                        {lastSync?.lastPriceSync
                            ? formatDistanceToNow(lastSync.lastPriceSync, { addSuffix: true })
                            : 'Never'}
                    </span>
                </div>
            </div>

            <MarketContent
                marketOverview={marketOverview}
                trendData={trendData}
                eraPerformance={eraPerformance}
                gainers={gainers}
                decliners={decliners}
                liquidityBoard={liquidityBoard}
            />
        </div>
    );
}
