import React from 'react';
import { MarketTrendChart } from '@/components/market/MarketTrendChart';
import { SummaryCards } from '@/components/SummaryCards';
import { PortfolioSummary, MarketTrendData } from '@/lib/mockData';
import { Activity, BookOpen, Crown, TrendingUp } from 'lucide-react';

export const metadata = {
    title: 'Insights | Nexfolio',
    description: 'Deep dive into your portfolio and market trends',
};

export const dynamic = 'force-dynamic';

// Mock data to ensure the page looks good immediately
const summaryData: PortfolioSummary = {
    totalValue: 12450.50,
    unrealizedGainLoss: {
        value: 850.25,
        percentage: 7.3,
    },
    cagr12M: 14.5,
    volatilityIndex: 12.2,
    totalItems: 42,
};

const marketTrendData: MarketTrendData[] = [
    { date: 'Jan', sealedIndex: 100, gradedIndex: 105 },
    { date: 'Feb', sealedIndex: 105, gradedIndex: 110 },
    { date: 'Mar', sealedIndex: 103, gradedIndex: 115 },
    { date: 'Apr', sealedIndex: 110, gradedIndex: 120 },
    { date: 'May', sealedIndex: 115, gradedIndex: 122 },
    { date: 'Jun', sealedIndex: 125, gradedIndex: 128 },
    { date: 'Jul', sealedIndex: 130, gradedIndex: 135 },
    { date: 'Aug', sealedIndex: 128, gradedIndex: 140 },
    { date: 'Sep', sealedIndex: 135, gradedIndex: 145 },
    { date: 'Oct', sealedIndex: 140, gradedIndex: 150 },
    { date: 'Nov', sealedIndex: 145, gradedIndex: 155 },
    { date: 'Dec', sealedIndex: 152, gradedIndex: 162 },
];

export default function InsightsPage() {
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
                    Last updated: <span className="text-gray-300 font-medium">Just now</span>
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
                        <MarketTrendChart data={marketTrendData} />
                    </section>

                    <section className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-sm flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-500" />
                            Key Observations
                        </h3>
                        <div className="space-y-4 flex-1">
                            <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <h4 className="text-sm font-medium text-white">Graded Cards Outperforming</h4>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Graded index has shown a consistent 15% increase over the last quarter, outpacing sealed product growth.
                                </p>
                            </div>
                            <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    <h4 className="text-sm font-medium text-white">Vintage Sets Accumulation</h4>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Market volume for vintage sets from 1999-2003 has spiked, indicating strong collector interest.
                                </p>
                            </div>
                            <div className="bg-[#151A21] rounded-lg p-4 border border-[rgba(255,255,255,0.02)] mt-auto">
                                <button className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm font-medium transition-colors">
                                    View Full Report
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
