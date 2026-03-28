'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceData, PortfolioSummary } from '@/lib/mockData';
import { useState } from 'react';

interface PerformanceChartProps {
    data: PerformanceData[];
    summary: PortfolioSummary;
}

export function PerformanceChart({ data, summary }: PerformanceChartProps) {
    const [timeFilter, setTimeFilter] = useState('12M');

    const formatYAxis = (tickItem: number) => {
        return `${(tickItem / 1000).toFixed(0)}k`; // Changed to 'k' for smaller TCG values if needed, but keeping logic
    };

    const customFormatter = (value: number) => {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
    };

    const filters = ['1D', '7D', '1M', '3M', '6M', 'MAX'];

    return (
        <Card className="col-span-12 bg-transparent border-none shadow-none">
            <CardHeader className="flex flex-col items-start justify-start pb-6 px-0">
                <div className="text-gray-400 text-sm font-medium mb-1">Portfolio: <span className="text-[#00E599]">Main</span></div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                    {customFormatter(summary.totalValue)}
                </div>
                <div className="text-success-text text-sm font-medium flex items-center">
                    {summary.unrealizedGainLoss.value >= 0 ? '+' : ''}{customFormatter(summary.unrealizedGainLoss.value)} in the last {timeFilter}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00E599" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#00E599" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={formatYAxis}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0E1116',
                                    borderColor: 'rgba(0,229,153,0.3)',
                                    color: '#f3f4f6',
                                    borderRadius: '8px',
                                    boxShadow: '0 0 20px rgba(0,229,153,0.15)'
                                }}
                                formatter={(value: number) => [customFormatter(value), 'Value']}
                                labelStyle={{ color: '#00E599', textTransform: 'uppercase', fontSize: '12px', marginBottom: '8px', fontWeight: 'bold', textShadow: '0 0 8px rgba(0,229,153,0.5)' }}
                                cursor={{ stroke: 'rgba(0,229,153,0.3)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#00E599"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                activeDot={{ r: 6, fill: '#0E1116', stroke: '#00E599', strokeWidth: 2 }}
                                style={{ filter: "drop-shadow(0 0 8px rgba(0,229,153,0.3))" }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center items-center space-x-2 sm:space-x-6 mt-6">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setTimeFilter(filter)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm font-medium rounded-full transition-all ${timeFilter === filter
                                ? 'bg-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
