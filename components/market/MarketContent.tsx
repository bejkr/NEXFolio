'use client';

import { useState } from 'react';
import { MarketOverview } from '@/components/market/MarketOverview';
import { PerformanceHeatmap } from '@/components/market/PerformanceHeatmap';
import { MarketMovers } from '@/components/market/MarketMovers';
import { LiquidityBoard } from '@/components/market/LiquidityBoard';
import { MarketTrendChart } from '@/components/market/MarketTrendChart';
import { AvailabilityTable } from '@/components/AvailabilityTable';
import {
    MarketOverviewData,
    EraPerformance,
    MarketAsset,
    MarketTrendData,
} from '@/lib/mockData';

interface Props {
    marketOverview: MarketOverviewData;
    trendData: MarketTrendData[];
    eraPerformance: EraPerformance[];
    gainers: MarketAsset[];
    decliners: MarketAsset[];
    liquidityBoard: MarketAsset[];
}

const TABS = [
    { key: 'overview',      label: 'Market Overview' },
    { key: 'availability',  label: 'Availability' },
] as const;

type Tab = typeof TABS[number]['key'];

export function MarketContent({ marketOverview, trendData, eraPerformance, gainers, decliners, liquidityBoard }: Props) {
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
                </div>
            )}

            {tab === 'availability' && (
                <div className="pt-2">
                    <AvailabilityTable />
                </div>
            )}
        </>
    );
}
