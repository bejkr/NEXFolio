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
            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Sealed Index</p>
                            <h3 className="text-2xl font-bold text-white mt-1">1,420.50</h3>
                        </div>
                        <div className="p-2 bg-[#00E599]/10 rounded-lg">
                            <Box className="w-5 h-5 text-[#00E599]" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-[#00E599]">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+{data.sealedIndex12M}% </span>
                        <span className="text-gray-500 ml-2 font-normal">in 12M</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Graded Index</p>
                            <h3 className="text-2xl font-bold text-white mt-1">845.20</h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-[#00E599]">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        <span>+{data.gradedIndex12M}% </span>
                        <span className="text-gray-500 ml-2 font-normal">in 12M</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Avg. Liquidity</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{data.averageLiquidity}/100</h3>
                        </div>
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Activity className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-400">
                        <span>High transaction velocity</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#151A21] border border-[rgba(255,255,255,0.06)]">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Market Volatility</p>
                            <h3 className="text-2xl font-bold text-white mt-1">{data.marketVolatility}%</h3>
                        </div>
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-400">
                        <span>Stabilizing across eras</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
