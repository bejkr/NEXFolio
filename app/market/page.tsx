'use client';

import { MarketOverview } from "@/components/market/MarketOverview";
import { PerformanceHeatmap } from "@/components/market/PerformanceHeatmap";
import { MarketMovers } from "@/components/market/MarketMovers";
import { LiquidityBoard } from "@/components/market/LiquidityBoard";
import { MarketTrendChart } from "@/components/market/MarketTrendChart";
import { MarketFilters } from "@/components/market/MarketFilters";
import {
    mockMarketOverview,
    mockEraPerformance,
    mockMarketGainers,
    mockMarketDecliners,
    mockLiquidityBoard,
    mockMarketTrend
} from "@/lib/mockData";

export default function MarketPage() {
    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Market Overview</h1>
                    <p className="text-gray-400 mt-2 text-sm">Institutional-grade insights on the overall Pokémon TCG market.</p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: <span className="text-gray-300 font-medium">Just now</span>
                </div>
            </div>

            {/* 1. Market Overview (Top Section) */}
            <MarketOverview data={mockMarketOverview} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left Column: Charts and Heatmap (Takes up 3 columns on large screens) */}
                <div className="xl:col-span-3 space-y-6">
                    {/* 5. Trend Chart */}
                    <div className="h-[400px]">
                        <MarketTrendChart data={mockMarketTrend} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 2. Performance Heatmap */}
                        <div className="h-full">
                            <PerformanceHeatmap data={mockEraPerformance} />
                        </div>
                        {/* Placeholder for future specific widget or just to balance UI. I'll let Heatmap take full width if we want, or put filtering next to it. For now, let heatmap span 1 col, next could be a spotlight. */}
                        <div className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <span className="text-xl">🌟</span>
                            </div>
                            <h3 className="text-white font-medium mb-1">Market Spotlight</h3>
                            <p className="text-xs text-gray-400 max-w-[200px]">Vintage sealed products showed abnormal volume over the last 48 hours.</p>
                        </div>
                    </div>

                    {/* 3. Top Movers */}
                    <MarketMovers gainers={mockMarketGainers} decliners={mockMarketDecliners} />

                    {/* 4. Liquidity Board */}
                    <LiquidityBoard data={mockLiquidityBoard} />
                </div>

                {/* Right Column: Filters */}
                <div className="xl:col-span-1">
                    <div className="sticky top-6">
                        {/* 6. Filter Panel */}
                        <MarketFilters />
                    </div>
                </div>
            </div>
        </div>
    );
}
