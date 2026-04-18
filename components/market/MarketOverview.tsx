'use client';

import { Card, CardContent } from "@/components/ui/card";
import { MarketOverviewData } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Activity, Box, BarChart2 } from "lucide-react";

interface Props {
    data: MarketOverviewData;
}

export function MarketOverview({ data }: Props) {
    const change12MPositive = data.sealedIndex12M >= 0;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Avg Market Price */}
            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Product Price</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">
                                €{data.sealedAvgPrice != null && data.sealedAvgPrice > 0 ? data.sealedAvgPrice.toFixed(2) : '—'}
                            </h3>
                        </div>
                        <div className="p-2 bg-[#00E599]/10 rounded-lg shrink-0">
                            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E599]" />
                        </div>
                    </div>
                    <div className={`mt-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium ${change12MPositive ? 'text-[#00E599]' : 'text-red-400'}`}>
                        <div className="flex items-center">
                            {change12MPositive
                                ? <TrendingUp className="w-3.5 h-3.5 mr-1" />
                                : <TrendingDown className="w-3.5 h-3.5 mr-1" />
                            }
                            <span>{change12MPositive ? '+' : ''}{data.sealedIndex12M.toFixed(1)}%</span>
                        </div>
                        <span className="text-gray-500 font-normal">in 12M</span>
                    </div>
                </CardContent>
            </Card>

            {/* Graded — not tracked */}
            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Graded Index</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">—</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                            <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="mt-4 text-[11px] sm:text-sm font-medium text-gray-500 leading-tight">
                        Graded tracking coming soon
                    </div>
                </CardContent>
            </Card>

            {/* Avg Listings */}
            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Listings</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">
                                {data.averageLiquidity > 0 ? Math.round(data.averageLiquidity) : '—'}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="mt-4 text-[11px] sm:text-sm font-medium text-gray-500 leading-tight">
                        per product on Cardmarket
                    </div>
                </CardContent>
            </Card>

            {/* Market Volatility */}
            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Market Volatility</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">
                                {data.marketVolatility > 0 ? `${data.marketVolatility.toFixed(1)}%` : '—'}
                            </h3>
                        </div>
                        <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                    </div>
                    <div className="mt-4 text-[11px] sm:text-sm font-medium text-gray-500 leading-tight">
                        Daily price std. deviation
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
