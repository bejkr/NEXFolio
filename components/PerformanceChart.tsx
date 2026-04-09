'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceData, PortfolioSummary } from '@/lib/mockData';
import { useState, useEffect } from 'react';

interface PerformanceChartProps {
    data: PerformanceData[];
    summary: PortfolioSummary;
}

export function PerformanceChart({ data: initialData, summary }: PerformanceChartProps) {
    const [timeFilter, setTimeFilter] = useState('1M');
    const [chartData, setChartData] = useState<PerformanceData[]>(initialData);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/portfolio/performance?range=${timeFilter}`);
                if (response.ok) {
                    const data = await response.json();
                    setChartData(data);
                }
            } catch (error) {
                console.error('Error fetching performance data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [timeFilter]);

    const formatYAxis = (tickItem: number) => {
        if (tickItem === 0) return '0';
        if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(1)}k`;
        return tickItem.toString();
    };

    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        if (isNaN(date.getTime())) return tickItem;
        
        switch (timeFilter) {
            case '1D':
                return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
            case '7D':
                return date.toLocaleDateString('en-IE', { weekday: 'short' });
            case '1M':
                return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
            case '3M':
            case '6M':
                return date.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' });
            case 'MAX':
                return date.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' });
            default:
                return date.toLocaleDateString('en-IE', { month: 'short' });
        }
    };

    const customFormatter = (value: number) => {
        return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(value);
    };

    const filters = ['1D', '7D', '1M', '3M', '6M', 'MAX'];

    const latestValue = summary.totalValue;
    const startValue = chartData.length > 0 ? chartData[0].value : summary.totalValue;
    const periodChange = latestValue - startValue;
    const periodChangePercent = startValue > 0 ? (periodChange / startValue) * 100 : 0;

    return (
        <Card className="col-span-12 bg-transparent border-none shadow-none">
            <CardHeader className="flex flex-col items-start justify-start pb-6 px-0">
                <div className="text-gray-400 text-sm font-medium mb-1">Portfolio: <span className="text-[#00E599]">Main</span></div>
                <div className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
                    {customFormatter(latestValue)}
                </div>
                <div className={`${periodChange >= 0 ? 'text-success-text' : 'text-danger-text'} text-sm font-medium flex items-center`}>
                    {periodChange >= 0 ? '+' : ''}{customFormatter(periodChange)} ({periodChange >= 0 ? '+' : ''}{periodChangePercent.toFixed(2)}%) in the last {timeFilter}
                </div>
            </CardHeader>
            <CardContent className="px-0">
                <div className={`h-[320px] w-full transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
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
                                tick={{ fill: '#6b7280', fontSize: 10 }}
                                tickFormatter={formatXAxis}
                                dy={10}
                                minTickGap={30}
                            />
                            <YAxis
                                width={30}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickFormatter={formatYAxis}
                                domain={['auto', 'auto']}
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
                                labelStyle={{ color: '#00E599', textTransform: 'uppercase', fontSize: '10px', marginBottom: '8px', fontWeight: 'bold' }}
                                labelFormatter={(label) => new Date(label).toLocaleString('en-IE', { dateStyle: 'medium', timeStyle: 'short' })}
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
                                animationDuration={1000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center items-center space-x-2 sm:space-x-6 mt-6">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            disabled={isLoading}
                            onClick={() => setTimeFilter(filter)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm font-medium rounded-full transition-all ${timeFilter === filter
                                ? 'bg-gray-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                : 'text-gray-500 hover:text-gray-300'
                                } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
