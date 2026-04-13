export const dynamic = 'force-dynamic';

import { MarketOverview } from "@/components/market/MarketOverview";
import { PerformanceHeatmap } from "@/components/market/PerformanceHeatmap";
import { MarketMovers } from "@/components/market/MarketMovers";
import { LiquidityBoard } from "@/components/market/LiquidityBoard";
import { MarketTrendChart } from "@/components/market/MarketTrendChart";
import { MarketFilters } from "@/components/market/MarketFilters";
import { MarketAsset, MarketOverviewData, MarketTrendData, EraPerformance } from "@/lib/mockData";
import prisma from "@/lib/prisma";
import { TrendingUp } from "lucide-react";

export default async function MarketPage() {
    // ── Fetch all products with recent price history ──────────────────────
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const products = await prisma.product.findMany({
        where: { price: { not: null, gt: 0 } },
        include: {
            priceHistory: {
                orderBy: { date: 'asc' },
                where: { date: { gte: twelveMonthsAgo } }
            }
        }
    });

    // ── Helper: find closest price history entry at or before a date ──────
    function priceAt(history: any[], atDate: Date): number | null {
        const before = history.filter((h: any) => new Date(h.date) <= atDate);
        if (before.length === 0) return null;
        return before[before.length - 1].price; // history sorted asc, last = closest
    }

    // ── Build MarketAsset list with computed changes ───────────────────────
    const maxListings = Math.max(...products.map(p => p.availabilityCount ?? 0), 1);

    const allAssets: MarketAsset[] = products.map(p => {
        const currentPrice = p.price!;
        const history = p.priceHistory as any[];

        const price30d = priceAt(history, thirtyDaysAgo);
        const price12m = priceAt(history, twelveMonthsAgo);

        const change30D = price30d && price30d > 0
            ? ((currentPrice - price30d) / price30d) * 100
            : 0;
        const change12M = price12m && price12m > 0
            ? ((currentPrice - price12m) / price12m) * 100
            : 0;

        // Normalize listings to 0-100 score (capped at 200 listings = 100)
        const listings = p.availabilityCount ?? 0;
        const liquidityScore = Math.min(100, Math.round((listings / 200) * 100));

        return {
            id: p.id,
            name: p.name,
            category: 'Sealed' as const,
            change30D: Number(change30D.toFixed(2)),
            change12M: Number(change12M.toFixed(2)),
            liquidityScore,
            activeListings: listings,
        };
    });

    // ── Gainers & Decliners (need at least 1 data point 30 days ago) ──────
    const withHistory = allAssets.filter(a => {
        const p = products.find(pr => pr.id === a.id);
        return p && priceAt(p.priceHistory as any[], thirtyDaysAgo) !== null;
    });

    const gainers = [...withHistory]
        .filter(a => a.change30D > 0)
        .sort((a, b) => b.change30D - a.change30D)
        .slice(0, 5);

    const decliners = [...withHistory]
        .filter(a => a.change30D < 0)
        .sort((a, b) => a.change30D - b.change30D)
        .slice(0, 5);

    // ── Liquidity Board (top 10 by active listings) ────────────────────────
    const liquidityBoard = [...allAssets]
        .filter(a => a.activeListings > 0)
        .sort((a, b) => b.activeListings - a.activeListings)
        .slice(0, 10);

    // ── Market Trend (monthly avg price across all products, normalized) ───
    const monthlyPrices: Record<string, number[]> = {};
    for (const p of products) {
        for (const h of p.priceHistory as any[]) {
            const month = (h.date as Date).toISOString().slice(0, 7);
            if (!monthlyPrices[month]) monthlyPrices[month] = [];
            monthlyPrices[month].push(h.price);
        }
    }
    const sortedMonths = Object.keys(monthlyPrices).sort();
    let marketTrend: MarketTrendData[] = [];
    if (sortedMonths.length >= 2) {
        const monthlyAvgs = sortedMonths.map(m => ({
            month: m,
            avg: monthlyPrices[m].reduce((a, b) => a + b, 0) / monthlyPrices[m].length
        }));
        const base = monthlyAvgs[0].avg || 1;
        marketTrend = monthlyAvgs.map(({ month, avg }) => ({
            date: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            sealedIndex: base > 0 ? Math.round((avg / base) * 100) : 100,
        }));
    }

    // ── Market Overview ────────────────────────────────────────────────────
    const avgPrice = products.length > 0
        ? products.reduce((s, p) => s + (p.price ?? 0), 0) / products.length
        : 0;

    // Avg 12M change (only products with 12M history)
    const with12MChange = allAssets.filter(a => a.change12M !== 0);
    const avg12MChange = with12MChange.length > 0
        ? with12MChange.reduce((s, a) => s + a.change12M, 0) / with12MChange.length
        : 0;

    const avgListings = products.length > 0
        ? products.reduce((s, p) => s + (p.availabilityCount ?? 0), 0) / products.length
        : 0;

    // Daily price volatility from market trend
    let marketVolatility = 0;
    if (marketTrend.length >= 3) {
        const vals = marketTrend.map(m => m.sealedIndex);
        const returns = vals.slice(1).map((v, i) => vals[i] > 0 ? (v - vals[i]) / vals[i] : 0);
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(returns.length - 1, 1);
        marketVolatility = Math.sqrt(variance) * 100;
    }

    const overviewData: MarketOverviewData = {
        sealedAvgPrice: Number(avgPrice.toFixed(2)),
        sealedIndex12M: Number(avg12MChange.toFixed(1)),
        averageLiquidity: Math.round(avgListings),
        marketVolatility: Number(marketVolatility.toFixed(1)),
    };

    // ── Market Spotlight (top 7D gainer) ──────────────────────────────────
    const spotlightAsset = allAssets
        .map(a => {
            const p = products.find(pr => pr.id === a.id);
            const history = p?.priceHistory as any[] ?? [];
            const price7d = priceAt(history, sevenDaysAgo);
            const current = p?.price ?? 0;
            const change7D = price7d && price7d > 0 ? ((current - price7d) / price7d) * 100 : null;
            return { ...a, change7D };
        })
        .filter(a => a.change7D !== null && a.change7D > 0)
        .sort((a, b) => (b.change7D ?? 0) - (a.change7D ?? 0))[0] ?? null;

    const lastSyncDate = products
        .map(p => p.lastPriceSync)
        .filter(Boolean)
        .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] ?? null;

    const lastUpdated = lastSyncDate
        ? (lastSyncDate as Date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never';

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Market Overview</h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Pokémon TCG sealed product market — {products.length} products tracked.
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Last synced: <span className="text-gray-300 font-medium">{lastUpdated}</span>
                </div>
            </div>

            {/* 1. Market Overview */}
            <MarketOverview data={overviewData} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left: Charts */}
                <div className="xl:col-span-3 space-y-6">
                    {/* Market Trend Chart */}
                    <div className="h-[400px]">
                        <MarketTrendChart
                            data={marketTrend}
                            title="Sealed Market Trend"
                            subtitle="Average product price across all tracked sealed products (normalized, base = 100)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Era Heatmap — placeholder until era field exists */}
                        <div className="h-full">
                            <PerformanceHeatmap data={[] as EraPerformance[]} />
                        </div>

                        {/* Market Spotlight */}
                        <div className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                            {spotlightAsset ? (
                                <>
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <TrendingUp className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Market Spotlight</h3>
                                    <p className="text-sm text-primary font-medium mb-1">{spotlightAsset.name}</p>
                                    <p className="text-xs text-gray-400 max-w-[200px]">
                                        Top 7-day gainer:{' '}
                                        <span className="text-green-400 font-semibold">
                                            +{(spotlightAsset.change7D ?? 0).toFixed(1)}%
                                        </span>
                                        {' '}with {spotlightAsset.activeListings} active listings.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-xl">🌟</span>
                                    </div>
                                    <h3 className="text-white font-medium mb-1">Market Spotlight</h3>
                                    <p className="text-xs text-gray-400 max-w-[200px]">
                                        No significant 7-day movers yet. Check back after the next price sync.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Top Movers */}
                    <MarketMovers gainers={gainers} decliners={decliners} />

                    {/* Liquidity Board */}
                    <LiquidityBoard data={liquidityBoard} />
                </div>

                {/* Right: Filters */}
                <div className="xl:col-span-1">
                    <div className="sticky top-6">
                        <MarketFilters />
                    </div>
                </div>
            </div>
        </div>
    );
}
