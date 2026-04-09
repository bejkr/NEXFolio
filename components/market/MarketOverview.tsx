'use client';

import { Card, CardContent } from "@/components/ui/card";
import { MarketOverviewData } from "@/lib/mockData";
import { TrendingUp, Activity, Box, Sparkles } from "lucide-react";

interface Props {
    data: MarketOverviewData;
}

export function MarketOverview({ data }: Props) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Sealed Index</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">1,420.50</h3>
                        </div>
                        <div className="p-2 bg-[#00E599]/10 rounded-lg shrink-0">
                            <Box className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E599]" />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-[#00E599]">
                        <div className="flex items-center">
                            <TrendingUp className="w-3.5 h-3.5 mr-1" />
                            <span>+{data.sealedIndex12M}%</span>
                        </div>
                        <span className="text-gray-500 font-normal">in 12M</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Graded Index</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">845.20</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-[#00E599]">
                        <div className="flex items-center">
                            <TrendingUp className="w-3.5 h-3.5 mr-1" />
                            <span>+{data.gradedIndex12M}%</span>
                        </div>
                        <span className="text-gray-500 font-normal">in 12M</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Liquidity</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">{data.averageLiquidity}/100</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg shrink-0">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="mt-4 text-[11px] sm:text-sm font-medium text-gray-500 leading-tight">
                        High transaction velocity
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] shadow-none">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">Market Volatility</p>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1.5 truncate">{data.marketVolatility}%</h3>
                        </div>
                        <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                    </div>
                    <div className="mt-4 text-[11px] sm:text-sm font-medium text-gray-500 leading-tight">
                        Stabilizing across eras
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
