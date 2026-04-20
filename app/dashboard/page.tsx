import { Metadata } from 'next';
import { SummaryCards } from '@/components/SummaryCards';
import { PortfolioAllocation } from '@/components/PortfolioAllocation';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TopMoversTable } from '@/components/TopMoversTable';
import { RiskSnapshot } from '@/components/RiskSnapshot';
import { MarketSnapshot } from '@/components/MarketSnapshot';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import {
    PortfolioSummary,
    AllocationData,
    PerformanceData,
    TopMover,
    RiskMetrics,
    MarketSnapshotData,
} from '@/lib/mockData';

import { DashboardHeader } from '@/components/DashboardHeader';
import { PortfolioMoversCards } from '@/components/PortfolioMoversCards';

export const metadata: Metadata = {
    title: 'Dashboard | Nexfolio',
    description: 'Portfolio analytics dashboard for Nexfolio.',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto w-full text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Please log in to view your dashboard.</h1>
            </div>
        );
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

    // Fetch user assets
    const assets = await (prisma as any).userAsset.findMany({
        where: { userId: user.id },
        include: { product: true },
        orderBy: { currentValue: 'desc' }
    });

    // 1. Calculate Summary
    const totalValue = assets.reduce((sum: number, asset: any) => {
        const price = asset.product?.price ?? asset.currentValue;
        return sum + (price * (asset.quantity || 1));
    }, 0);
    const totalCost = assets.reduce((sum: number, asset: any) => sum + (asset.costBasis * (asset.quantity || 1)), 0);
    const unrealizedGainLoss = totalValue - totalCost;
    const gainPercentage = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;

    // Fetch Price History for portfolio products
    const productIds = assets.map((a: any) => a.productId).filter(Boolean);
    const history = productIds.length > 0 ? await prisma.priceHistory.findMany({
        where: { productId: { in: productIds } },
        orderBy: { date: 'asc' },
        select: { productId: true, price: true, date: true }
    }) : [];

    // Group history by date for volatility calculation
    const productQuantities = assets.reduce((acc: Record<string, number>, a: any) => {
        if (a.productId) acc[a.productId] = (acc[a.productId] || 0) + (a.quantity || 1);
        return acc;
    }, {} as Record<string, number>);

    const dailyValues: Record<string, number> = {};
    history.forEach((h: any) => {
        const dateStr = h.date.toISOString().split('T')[0];
        const qty = productQuantities[h.productId] || 1;
        dailyValues[dateStr] = (dailyValues[dateStr] || 0) + (h.price * qty);
    });

    const sortedDates = Object.keys(dailyValues).sort();
    const values = sortedDates.map(d => dailyValues[d]);

    let volatilityIndex = 0;
    if (values.length >= 2) {
        const returns = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) returns.push((values[i] - values[i - 1]) / values[i - 1]);
        }
        if (returns.length >= 2) {
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
            volatilityIndex = Math.sqrt(variance) * 100;
        }
    }

    const portfolioSummary: PortfolioSummary = {
        totalValue,
        unrealizedGainLoss: {
            value: unrealizedGainLoss,
            percentage: Number(gainPercentage.toFixed(2))
        },
        cagr12M: 0,
        volatilityIndex: Number(volatilityIndex.toFixed(2)),
        totalItems: assets.length
    };

    // 2. Portfolio Allocation
    const allocationMap = assets.reduce((acc: Record<string, number>, asset: any) => {
        const cat = asset.category || 'Unknown';
        const price = asset.product?.price ?? asset.currentValue;
        acc[cat] = (acc[cat] || 0) + (price * (asset.quantity || 1));
        return acc;
    }, {} as Record<string, number>);

    const allocationData: AllocationData[] = Object.entries(allocationMap).map(([name, value]) => ({
        name,
        value: totalValue > 0 ? Number(((value as number / totalValue) * 100).toFixed(1)) : 0
    }));

    // 3. Top Movers — real 30D and 12M changes from history
    const maxListings = Math.max(...assets.map((a: any) => a.product?.availabilityCount || 0), 1);

    const historyByProduct: Record<string, { price: number; date: Date }[]> = {};
    history.forEach((h: any) => {
        if (!historyByProduct[h.productId]) historyByProduct[h.productId] = [];
        historyByProduct[h.productId].push({ price: h.price, date: h.date });
    });

    const topMovers: TopMover[] = assets.map((asset: any) => {
        const productHistory = historyByProduct[asset.productId] || [];
        const currentPrice = asset.product?.price ?? asset.currentValue;

        const price30DEntry = productHistory
            .filter((h) => h.date <= thirtyDaysAgo)
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        const price12MEntry = productHistory
            .filter((h) => h.date <= twelveMonthsAgo)
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        const change30D = price30DEntry && price30DEntry.price > 0
            ? ((currentPrice - price30DEntry.price) / price30DEntry.price) * 100
            : null;
        const change12M = price12MEntry && price12MEntry.price > 0
            ? ((currentPrice - price12MEntry.price) / price12MEntry.price) * 100
            : null;

        // Liquidity score: log-scale normalize availabilityCount to 0–100
        const listings = asset.product?.availabilityCount || 0;
        const liquidityScore = listings === 0 ? 5
            : Math.min(100, Math.round((Math.log10(listings + 1) / Math.log10(maxListings + 1)) * 100));

        return {
            id: asset.id,
            name: asset.name,
            category: asset.category as any,
            currentValue: currentPrice,
            change30D: change30D != null ? Number(change30D.toFixed(2)) : null,
            change12M: change12M != null ? Number(change12M.toFixed(2)) : null,
            liquidityScore,
            imageUrl: asset.product?.imageUrl ?? asset.imageUrl,
            productId: asset.productId
        };
    }).sort((a: any, b: any) => Math.abs(b.change30D ?? 0) - Math.abs(a.change30D ?? 0)).slice(0, 5);

    // 4. Performance Data (empty — PerformanceChart fetches via API)
    const performanceData: PerformanceData[] = [];

    // 5. Risk Metrics
    // Avg demand score across portfolio (same log-scale as top movers)
    const avgDemandScore = assets.length > 0 && maxListings > 0
        ? Math.round(assets.reduce((sum: number, a: any) => {
            const l = a.product?.availabilityCount || 0;
            return sum + (l === 0 ? 5 : Math.min(100, Math.round((Math.log10(l + 1) / Math.log10(maxListings + 1)) * 100)));
          }, 0) / assets.length)
        : 0;

    // Cap volatility at 99 — big spikes happen when price history is first synced
    const displayVolatility = Math.min(99, Number(volatilityIndex.toFixed(2)));

    const riskMetrics: RiskMetrics = {
        volatility: displayVolatility,
        liquidityScore: avgDemandScore,
        concentrationIndex: allocationData.length > 0 ? Math.max(...allocationData.map(d => d.value)) : 0,
        analyticalText: assets.length > 0
            ? `Your portfolio is concentrated in ${allocationData[0]?.name || 'N/A'} (${allocationData[0]?.value ?? 0}%).`
            : "No data available. Start adding assets to your portfolio."
    };

    // 6. Market Snapshot — real data from all products in DB
    // Sealed index: avg 12M price change across all sealed products with history
    const [sealedProducts, avgListingsAgg] = await Promise.all([
        prisma.product.findMany({
            where: {
                category: { contains: 'Sealed', mode: 'insensitive' },
                price: { not: null }
            },
            select: { id: true, price: true }
        }),
        prisma.product.aggregate({ _avg: { availabilityCount: true } })
    ]);

    let sealedIndex12M = 0;
    if (sealedProducts.length > 0) {
        const sealedIds = sealedProducts.map(p => p.id);
        const oldPriceHistories = await prisma.priceHistory.findMany({
            where: { productId: { in: sealedIds }, date: { lte: twelveMonthsAgo } },
            orderBy: { date: 'desc' },
            select: { productId: true, price: true }
        });

        // Most recent price ≥12M ago per product
        const oldPriceMap: Record<string, number> = {};
        for (const h of oldPriceHistories) {
            if (!oldPriceMap[h.productId]) oldPriceMap[h.productId] = h.price;
        }

        const changes = sealedProducts
            .filter(p => oldPriceMap[p.id] && oldPriceMap[p.id] > 0 && p.price)
            .map(p => ((p.price! - oldPriceMap[p.id]) / oldPriceMap[p.id]) * 100);

        if (changes.length > 0) {
            sealedIndex12M = Number((changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(1));
        }
    }

    const avgListings = avgListingsAgg._avg.availabilityCount ?? 0;

    const marketLiquidityTrend: 'Increasing' | 'Stable' | 'Decreasing' =
        avgListings > 60 ? 'Increasing' : avgListings < 20 ? 'Decreasing' : 'Stable';

    const marketSnapshot: MarketSnapshotData = {
        sealedIndex12M,
        marketLiquidityTrend,
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <DashboardHeader lastSync={assets[0]?.product?.lastPriceSync || undefined} />

            <div className="grid grid-cols-12 gap-y-8 gap-x-6">

                {/* 1. Performance Chart (Hero Section) */}
                <div className="col-span-12">
                    <PerformanceChart data={performanceData} summary={portfolioSummary} />
                </div>

                {/* 2. Summary Strip */}
                <div className="col-span-12 mt-4">
                    <SummaryCards data={portfolioSummary} />
                </div>

                {/* 3. Portfolio Movers Cards */}
                <div className="col-span-12">
                    <PortfolioMoversCards data={topMovers} />
                </div>


            </div>
        </div>
    );
}
