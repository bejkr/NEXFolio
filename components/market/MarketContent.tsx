'use client';

import { useState } from 'react';
import { MarketOverview } from '@/components/market/MarketOverview';
import { PerformanceHeatmap } from '@/components/market/PerformanceHeatmap';
import { MarketMovers } from '@/components/market/MarketMovers';
import { LiquidityBoard } from '@/components/market/LiquidityBoard';
import { MarketTrendChart } from '@/components/market/MarketTrendChart';
import { AvailabilityTable } from '@/components/AvailabilityTable';
import { DiscoverAssets } from '@/components/market/DiscoverAssets';
import { TrendingSets } from '@/components/market/TrendingSets';
import { PriceBreakouts } from '@/components/market/PriceBreakouts';
import {
    MarketOverviewData,
    EraPerformance,
    MarketAsset,
    MarketTrendData,
    DiscoverAsset,
    TrendingSet,
    PriceBreakout,
} from '@/lib/mockData';

interface Props {
    marketOverview: MarketOverviewData;
    trendData: MarketTrendData[];
    eraPerformance: EraPerformance[];
    gainers: MarketAsset[];
    decliners: MarketAsset[];
    liquidityBoard: MarketAsset[];
    discoverAssets: DiscoverAsset[];
    trendingSets: TrendingSet[];
    breakouts: PriceBreakout[];
}

const TABS = [
    { key: 'overview',      label: 'Market Overview' },
    { key: 'discover',      label: 'Discover' },
    { key: 'availability',  label: 'Availability' },
] as const;

type Tab = typeof TABS[number]['key'];

export function MarketContent({ marketOverview, trendData, eraPerformance, gainers, decliners, liquidityBoard, discoverAssets, trendingSets, breakouts }: Props) {
    const [tab, setTab] = useState<Tab>('overview');

    return (
        <>
            {/* Tab bar */}
            <div className="flex border-b border-[rgba(255,255,255,0.06)] -mt-2">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                            tab === t.key
                                ? 'border-primary text-white'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'overview' && (
                <div className="space-y-8 pt-2">
                    <MarketOverview data={marketOverview} />
                    <div className="h-[400px]">
                        <MarketTrendChart data={trendData} />
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <PerformanceHeatmap data={eraPerformance} />
                        <MarketMovers gainers={gainers} decliners={decliners} />
                    </div>
                    <LiquidityBoard data={liquidityBoard} />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <TrendingSets data={trendingSets} />
                        <PriceBreakouts data={breakouts} />
                    </div>
                </div>
            )}

            {tab === 'discover' && (
                <DiscoverAssets data={discoverAssets} />
            )}

            {tab === 'availability' && (
                <div className="pt-2">
                    <AvailabilityTable />
                </div>
            )}
        </>
    );
}
