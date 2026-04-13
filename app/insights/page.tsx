import React from 'react';
import { MarketTrendChart } from '@/components/market/MarketTrendChart';
import { SummaryCards } from '@/components/SummaryCards';
import { PortfolioSummary, MarketTrendData } from '@/lib/mockData';
import { Activity, BookOpen, Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export const metadata = {
    title: 'Insights | Nexfolio',
    description: 'Deep dive into your portfolio and market trends',
};

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let summaryData: PortfolioSummary = {
        totalValue: 0,
        unrealizedGainLoss: { value: 0, percentage: 0 },
        cagr12M: 0,
        volatilityIndex: 0,
        totalItems: 0,
    };
    let chartData: MarketTrendData[] = [];
    let topGainer: { name: string; change30D: number } | null = null;
    let portfolioGrowth: { pct: number; value: number } | null = null;
    let lastSyncDate: Date | null = null;

    if (user) {
        const assets = await (prisma as any).userAsset.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        priceHistory: { orderBy: { date: 'asc' } }
                    }
                }
            }
        });

        if (assets.length > 0) {
            // ── Summary ──────────────────────────────────────────────────
            const totalValue = assets.reduce((sum: number, a: any) => {
                const price = a.product?.price ?? a.currentValue;
                return sum + price * (a.quantity || 1);
            }, 0);
            const totalCost = assets.reduce((sum: number, a: any) =>
                sum + a.costBasis * (a.quantity || 1), 0);
            const unrealizedGainLoss = totalValue - totalCost;
            const gainPct = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;

            // ── Volatility ───────────────────────────────────────────────
            const productQtys: Record<string, number> = {};
            assets.forEach((a: any) => {
                if (a.productId) productQtys[a.productId] = (productQtys[a.productId] || 0) + (a.quantity || 1);
            });

            const allHistory: any[] = assets.flatMap((a: any) => a.product?.priceHistory || []);

            const dailyVals: Record<string, number> = {};
            for (const h of allHistory) {
                const d = (h.date as Date).toISOString().split('T')[0];
                dailyVals[d] = (dailyVals[d] || 0) + h.price * (productQtys[h.productId] || 1);
            }
            const vals = Object.keys(dailyVals).sort().map(d => dailyVals[d]);
            let volatility = 0;
            if (vals.length >= 3) {
                const returns = vals.slice(1).map((v, i) => vals[i] > 0 ? (v - vals[i]) / vals[i] : 0);
                const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
                const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(returns.length - 1, 1);
                volatility = Math.sqrt(variance) * 100;
            }

            summaryData = {
                totalValue,
                unrealizedGainLoss: { value: unrealizedGainLoss, percentage: Number(gainPct.toFixed(2)) },
                cagr12M: 0,
                volatilityIndex: Number(volatility.toFixed(2)),
                totalItems: assets.length,
            };

            // ── Monthly portfolio trend (normalized to base 100) ─────────
            // Build: for each month, take latest known price per product × qty
            const productMonthlyPrice: Record<string, Record<string, number>> = {};
            for (const h of allHistory) {
                const month = (h.date as Date).toISOString().slice(0, 7);
                if (!productMonthlyPrice[h.productId]) productMonthlyPrice[h.productId] = {};
                // Since history is sorted asc, later entries overwrite → gives latest price of that month
                productMonthlyPrice[h.productId][month] = h.price;
            }

            const allMonths = new Set<string>();
            Object.values(productMonthlyPrice).forEach(m => Object.keys(m).forEach(mo => allMonths.add(mo)));
            const sortedMonths = [...allMonths].sort();

            if (sortedMonths.length >= 2) {
                const lastKnown: Record<string, number> = {};
                const monthlyValues: { month: string; value: number }[] = [];

                for (const month of sortedMonths) {
                    let total = 0;
                    for (const asset of assets) {
                        if (!asset.productId) continue;
                        const monthPrice = productMonthlyPrice[asset.productId]?.[month];
                        if (monthPrice !== undefined) lastKnown[asset.productId] = monthPrice;
                        const price = lastKnown[asset.productId] ?? asset.product?.price ?? asset.currentValue;
                        total += price * (asset.quantity || 1);
                    }
                    monthlyValues.push({ month, value: total });
                }

                const base = monthlyValues[0].value || 1;
                chartData = monthlyValues.map(({ month, value }) => ({
                    date: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    sealedIndex: base > 0 ? Math.round((value / base) * 100) : 100,
                }));

                // Portfolio growth from first to last month
                const firstVal = monthlyValues[0].value;
                const lastVal = monthlyValues[monthlyValues.length - 1].value;
                portfolioGrowth = {
                    value: lastVal - firstVal,
                    pct: firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0,
                };
            }

            // ── Top gainer over 30 days ──────────────────────────────────
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const movers = assets.map((a: any) => {
                const history: any[] = a.product?.priceHistory || [];
                const currentPrice = a.product?.price ?? a.currentValue;
                const price30d = history
                    .filter((h: any) => new Date(h.date) <= thirtyDaysAgo)
                    .sort((x: any, y: any) => new Date(y.date).getTime() - new Date(x.date).getTime())[0]?.price
                    ?? a.costBasis;
                const change30D = price30d > 0 ? ((currentPrice - price30d) / price30d) * 100 : 0;
                return { name: a.name, change30D };
            });
            topGainer = movers.sort((a: any, b: any) => b.change30D - a.change30D)[0] ?? null;

            // Last sync date
            const latestSync = assets
                .map((a: any) => a.product?.lastPriceSync as Date | null)
                .filter(Boolean)
                .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0] ?? null;
            lastSyncDate = latestSync;
        }
    }

    const lastUpdated = lastSyncDate
        ? lastSyncDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Never';

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Activity className="w-7 h-7 text-primary" />
                        Market Insights
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Track market trends, analyze your portfolio performance, and discover new opportunities.
                    </p>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block">
                    Last synced: <span className="text-gray-300 font-medium">{lastUpdated}</span>
                </div>
            </div>

            <div className="space-y-8">
                <section>
                    <div className="mb-4">
                        <h2 className="text-xl font-semibold text-white">Portfolio Overview</h2>
                    </div>
                    <SummaryCards data={summaryData} />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2">
                        <MarketTrendChart
                            data={chartData}
                            title="Portfolio Value Index"
                            subtitle="Normalized portfolio performance since tracking began (base = 100)"
                        />
                    </section>

                    <section className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            Key Observations
                        </h3>
                        <div className="space-y-4 flex-1">
                            {topGainer ? (
                                <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        {topGainer.change30D >= 0
                                            ? <TrendingUp className="w-4 h-4 text-green-500" />
                                            : <TrendingDown className="w-4 h-4 text-red-500" />
                                        }
                                        <h4 className="text-sm font-medium text-white">Top Performer (30D)</h4>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        <span className="text-white font-medium">{topGainer.name}</span> leads with a{' '}
                                        <span className={topGainer.change30D >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                            {topGainer.change30D >= 0 ? '+' : ''}{topGainer.change30D.toFixed(1)}%
                                        </span>{' '}
                                        price change over the last 30 days.
                                    </p>
                                </div>
                            ) : null}

                            {portfolioGrowth ? (
                                <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="w-4 h-4 text-blue-500" />
                                        <h4 className="text-sm font-medium text-white">Portfolio Growth</h4>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Your portfolio has {portfolioGrowth.pct >= 0 ? 'grown' : 'declined'} by{' '}
                                        <span className={portfolioGrowth.pct >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                                            {portfolioGrowth.pct >= 0 ? '+' : ''}{portfolioGrowth.pct.toFixed(1)}%
                                        </span>
                                        {' '}(€{Math.abs(portfolioGrowth.value).toFixed(2)}) since price tracking began.
                                    </p>
                                </div>
                            ) : null}

                            {!topGainer && !portfolioGrowth && (
                                <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)]">
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        Add assets to your portfolio and run a price sync to see personalized insights.
                                    </p>
                                </div>
                            )}

                            <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)] mt-auto">
                                <a
                                    href="/collection"
                                    className="block w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm font-medium transition-colors text-center"
                                >
                                    View Collection →
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
