'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MarketTrendData } from "@/lib/mockData";
import { useState } from "react";

interface Props {
    data: MarketTrendData[];
}

export function MarketTrendChart({ data }: Props) {
    const [timeframe, setTimeframe] = useState('12M');
    const timeframes = ['1M', '3M', '6M', '12M'];

    // Slice to the last N months based on timeframe (data is monthly buckets)
    const monthsMap: Record<string, number> = { '1M': 1, '3M': 3, '6M': 6, '12M': 12 };
    const months = monthsMap[timeframe] ?? 12;
    const filteredData = data.slice(-months);

    return (
        <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
                <div>
                    <CardTitle className="text-lg font-semibold text-white">Market Trend Index</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">Sealed vs. Graded historic performance</p>
                </div>
                <div className="flex bg-[#151A21] rounded-lg p-1 border border-[rgba(255,255,255,0.06)]">
                    {timeframes.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeframe === tf
                                ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,229,153,0.15)]'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[300px] p-0 pb-6 pl-0">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSealed" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00E599" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00E599" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorGraded" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#4b5563"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#4b5563"
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#151A21', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                        <Line
                            type="monotone"
                            dataKey="sealedIndex"
                            name="Sealed Index"
                            stroke="#00E599"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#00E599', stroke: '#151A21', strokeWidth: 2 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="gradedIndex"
                            name="Graded Index"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#151A21', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
