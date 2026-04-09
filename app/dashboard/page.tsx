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
    mockMarketSnapshot
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

    // Fetch Price History for all products to calculate volatility
    const productIds = assets.map((a: any) => a.productId).filter(Boolean);
    const history = await prisma.priceHistory.findMany({
        where: { productId: { in: productIds } },
        orderBy: { date: 'asc' }
    });

    // Group history by date and calculate portfolio value per day
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
            if (values[i-1] > 0) {
                returns.push((values[i] - values[i-1]) / values[i-1]);
            }
        }
        
        if (returns.length >= 2) {
            const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
            const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
            volatilityIndex = Math.sqrt(variance) * 100; // Daily volatility as %
        }
    }

    const portfolioSummary: PortfolioSummary = {
        totalValue,
        unrealizedGainLoss: {
            value: unrealizedGainLoss,
            percentage: Number(gainPercentage.toFixed(2))
        },
        cagr12M: 0, // Requires historical data
        volatilityIndex: Number(volatilityIndex.toFixed(2)),
        totalItems: assets.length
    };

    // 2. Portfolio Allocation
    const allocationMap = assets.reduce((acc: Record<string, number>, asset: any) => {
        const cat = asset.category || 'Unknown';
        const price = asset.product?.price ?? asset.currentValue;
        const qty = asset.quantity || 1;
        acc[cat] = (acc[cat] || 0) + (price * qty);
        return acc;
    }, {} as Record<string, number>);

    const allocationData: AllocationData[] = Object.entries(allocationMap).map(([name, value]) => ({
        name,
        value: totalValue > 0 ? Number(((value as number / totalValue) * 100).toFixed(1)) : 0
    }));

    // 3. Portfolio Movers (Calculating real movement from History)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const topMovers: TopMover[] = assets.map((asset: any) => {
        const productHistory = history.filter((h: any) => h.productId === asset.productId);
        const currentPrice = asset.product?.price ?? asset.currentValue;
        
        // Find price closest to 30 days ago
        const price30D = productHistory
            .filter((h: any) => h.date <= thirtyDaysAgo)
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0]?.price ?? asset.costBasis;
        
        // Find price closest to 1Y ago
        const price12M = productHistory
            .filter((h: any) => h.date <= twelveMonthsAgo)
            .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())[0]?.price ?? asset.costBasis;

        const change30D = price30D > 0 ? ((currentPrice - price30D) / price30D) * 100 : 0;
        const change12M = price12M > 0 ? ((currentPrice - price12M) / price12M) * 100 : 0;

        return {
            id: asset.id,
            name: asset.name,
            category: asset.category as any,
            currentValue: currentPrice,
            change30D: Number(change30D.toFixed(2)),
            change12M: Number(change12M.toFixed(2)),
            liquidityScore: 85, // Mock
            imageUrl: asset.product?.imageUrl ?? asset.imageUrl,
            productId: asset.productId
        };
    }).sort((a: any, b: any) => Math.abs(b.change30D) - Math.abs(a.change30D)).slice(0, 5);

    // 4. Performance Data (Placeholder until PriceHistory is populated)
    const performanceData: PerformanceData[] = [];

    // 5. Risk Metrics
    const riskMetrics: RiskMetrics = {
        volatility: Number(volatilityIndex.toFixed(2)),
        liquidityScore: 75,
        concentrationIndex: allocationData.length > 0 ? Math.max(...allocationData.map(d => d.value)) : 0,
        analyticalText: assets.length > 0
            ? `Your portfolio is concentrated in ${allocationData[0]?.name || 'N/A'}.`
            : "No data available. Start adding assets to your portfolio."
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <DashboardHeader lastSync={assets[0]?.product?.lastPriceSync || undefined} />

            <div className="grid grid-cols-12 gap-y-8 gap-x-6">

                {/* 1. Performance Chart (Hero Section) */}
                <div className="col-span-12">
                    <PerformanceChart data={performanceData} summary={portfolioSummary} />
                </div>

                {/* 2. Summary Strip (12 cols) */}
                <div className="col-span-12 mt-4">
                    <SummaryCards data={portfolioSummary} />
                </div>

                {/* 3. Portfolio Movers Cards immediately under summary */}
                <div className="col-span-12">
                    <PortfolioMoversCards data={topMovers} />
                </div>

                {/* 4. Portfolio Allocation + Risk Snapshot */}
                <div className="col-span-12 lg:col-span-8">
                    <PortfolioAllocation data={allocationData} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <RiskSnapshot data={riskMetrics} />
                </div>

                {/* 5. Market Snapshot */}
                <div className="col-span-12">
                    <MarketSnapshot data={mockMarketSnapshot} />
                </div>

            </div>
        </div>
    );
}
