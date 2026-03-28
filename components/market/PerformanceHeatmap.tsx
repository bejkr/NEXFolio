'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EraPerformance } from "@/lib/mockData";

interface Props {
    data: EraPerformance[];
}

export function PerformanceHeatmap({ data }: Props) {
    const getBgColor = (trend: string, perf: number) => {
        if (trend === 'up') return 'bg-[#00E599]/10 border-[#00E599]/20';
        if (trend === 'down') return 'bg-[#FF4D4D]/10 border-[#FF4D4D]/20';
        return 'bg-white/5 border-white/10'; // flat
    };

    const getTextColor = (trend: string) => {
        if (trend === 'up') return 'text-[#00E599]';
        if (trend === 'down') return 'text-[#FF4D4D]';
        return 'text-gray-300';
    };

    return (
        <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white">Performance Heatmap</CardTitle>
                <p className="text-sm text-gray-400">Era-based market performance</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    {data.map((item) => (
                        <div
                            key={item.era}
                            className={`p-4 rounded-lg border ${getBgColor(item.trend, item.perf12M)} transition-colors`}
                        >
                            <h4 className="font-semibold text-gray-200 mb-2">{item.era}</h4>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">3M</p>
                                    <span className={`text-sm font-medium ${getTextColor(item.trend)}`}>
                                        {item.perf3M >= 0 ? '+' : ''}{item.perf3M.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">12M</p>
                                    <span className={`text-sm font-medium ${getTextColor(item.trend)}`}>
                                        {item.perf12M >= 0 ? '+' : ''}{item.perf12M.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
