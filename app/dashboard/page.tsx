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
    const totalValue = assets.reduce((sum: number, asset: any) => sum + asset.currentValue, 0);
    const totalCost = assets.reduce((sum: number, asset: any) => sum + asset.costBasis, 0);
    const unrealizedGainLoss = totalValue - totalCost;
    const gainPercentage = totalCost > 0 ? (unrealizedGainLoss / totalCost) * 100 : 0;

    const portfolioSummary: PortfolioSummary = {
        totalValue,
        unrealizedGainLoss: {
            value: unrealizedGainLoss,
            percentage: Number(gainPercentage.toFixed(2))
        },
        cagr12M: 0, // Requires historical data
        volatilityIndex: 0 // Requires historical data
    };

    // 2. Portfolio Allocation
    const allocationMap = assets.reduce((acc: Record<string, number>, asset: any) => {
        const cat = asset.category || 'Unknown';
        acc[cat] = (acc[cat] || 0) + asset.currentValue;
        return acc;
    }, {} as Record<string, number>);

    const allocationData: AllocationData[] = Object.entries(allocationMap).map(([name, value]) => ({
        name,
        value: totalValue > 0 ? Number(((value as number / totalValue) * 100).toFixed(1)) : 0
    }));

    // 3. Top Movers (Using current value for now since we lack history)
    const topMovers: TopMover[] = assets.slice(0, 5).map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        category: asset.category as any,
        currentValue: asset.currentValue,
        change30D: 0,
        change12M: 0,
        liquidityScore: 85 // Mock for now
    }));

    // 4. Performance Data (Placeholder until PriceHistory is populated)
    const performanceData: PerformanceData[] = [
        { month: 'Start', value: totalCost },
        { month: 'Current', value: totalValue }
    ];

    // 5. Risk Metrics
    const riskMetrics: RiskMetrics = {
        volatility: 0,
        liquidityScore: 75,
        concentrationIndex: allocationData.length > 0 ? Math.max(...allocationData.map(d => d.value)) : 0,
        analyticalText: assets.length > 0
            ? `Your portfolio is concentrated in ${allocationData[0]?.name || 'N/A'}.`
            : "No data available. Start adding assets to your portfolio."
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Collection Overview</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="bg-[#151A21] text-gray-300 border border-[rgba(255,255,255,0.06)] hover:bg-white/[0.02] hover:text-white transition-colors rounded-md px-4 py-2 text-sm font-medium">
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-y-8 gap-x-6">

                {/* 1. Performance Chart (Hero Section) */}
                <div className="col-span-12">
                    <PerformanceChart data={performanceData} summary={portfolioSummary} />
                </div>

                {/* 2. Summary Strip (12 cols) */}
                <div className="col-span-12 mt-4">
                    <SummaryCards data={portfolioSummary} />
                </div>

                {/* 2. Portfolio Allocation + Risk Snapshot */}
                <div className="col-span-12 lg:col-span-8">
                    <PortfolioAllocation data={allocationData} />
                </div>
                <div className="col-span-12 lg:col-span-4">
                    <RiskSnapshot data={riskMetrics} />
                </div>

                {/* 4. Top Movers */}
                <div className="col-span-12">
                    <TopMoversTable data={topMovers} />
                </div>

                {/* 5. Market Snapshot */}
                <div className="col-span-12">
                    <MarketSnapshot data={mockMarketSnapshot} />
                </div>

            </div>
        </div>
    );
}
