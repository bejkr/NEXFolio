'use client';

import { useState, useEffect, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Package, Activity, TrendingUp, TrendingDown, AlertTriangle, Loader2, ArrowLeft, ShoppingCart, PlusCircle, Bookmark } from "lucide-react";
import { StoreOffers } from "@/components/StoreOffers";
import { AddItemModal } from "@/components/collection/AddItemModal";
import { CollectionItem } from '@/lib/mockData';

const TIMEFRAMES = ['1W', '1M', '3M', '1Y', 'ALL'] as const;
type Timeframe = typeof TIMEFRAMES[number];

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<Timeframe>('1M');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isWatching, setIsWatching] = useState(false);
    const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
    const [watchLoading, setWatchLoading] = useState(false);

    const dbId = params.id.startsWith('db_') ? params.id.replace('db_', '') : params.id;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${dbId}`);
                if (res.status === 404) { notFound(); return; }
                const data = await res.json();
                if (data && !data.error) setProduct(data);
                else notFound();
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [dbId]);

    // Check watchlist status
    useEffect(() => {
        if (!dbId) return;
        fetch('/api/watchlist')
            .then(r => r.ok ? r.json() : [])
            .then((items: any[]) => {
                const found = items.find((i: any) => i.productId === dbId);
                if (found) { setIsWatching(true); setWatchlistItemId(found.id); }
            })
            .catch(() => {});
    }, [dbId]);

    const toggleWatch = async () => {
        setWatchLoading(true);
        try {
            if (isWatching && watchlistItemId) {
                await fetch(`/api/watchlist/${watchlistItemId}`, { method: 'DELETE' });
                setIsWatching(false);
                setWatchlistItemId(null);
            } else {
                const res = await fetch('/api/watchlist', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: dbId }),
                });
                if (res.ok || res.status === 409) {
                    const data = res.status === 409 ? null : await res.json();
                    setIsWatching(true);
                    if (data?.id) setWatchlistItemId(data.id);
                }
            }
        } finally {
            setWatchLoading(false);
        }
    };

    const price = product?.price || 0;
    const change30D: number | null = product?.change30D ?? null;
    const change12M: number | null = product?.change12M ?? null;
    const score = product?.nexfolioScore || 50;

    // Filter price history by selected timeframe
    const chartData = useMemo(() => {
        if (!product?.priceHistory?.length) return [{ date: new Date().toISOString(), value: price }];

        const now = new Date();
        const cutoff = new Date(now);
        switch (timeframe) {
            case '1W': cutoff.setDate(now.getDate() - 7); break;
            case '1M': cutoff.setMonth(now.getMonth() - 1); break;
            case '3M': cutoff.setMonth(now.getMonth() - 3); break;
            case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
            case 'ALL': cutoff.setFullYear(2000); break;
        }

        const filtered = product.priceHistory.filter((h: any) => new Date(h.date) >= cutoff);
        const data = (filtered.length > 0 ? filtered : product.priceHistory).map((h: any) => ({
            date: h.date,
            value: h.price
        }));

        // Add current price as last point
        const lastDate = new Date(data[data.length - 1]?.date || now);
        const nowMs = now.getTime();
        if (nowMs - lastDate.getTime() > 12 * 3600 * 1000) {
            data.push({ date: now.toISOString(), value: price });
        }

        return data;
    }, [product, timeframe, price]);

    // Period change for selected timeframe
    const periodChange = useMemo(() => {
        if (chartData.length < 2) return 0;
        const first = chartData[0].value;
        return first > 0 ? ((price - first) / first) * 100 : 0;
    }, [chartData, price]);

    const formatXAxis = (tick: string) => {
        const d = new Date(tick);
        if (isNaN(d.getTime())) return tick;
        if (timeframe === '1W') return d.toLocaleDateString('en-IE', { weekday: 'short' });
        if (timeframe === '1M') return d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
        return d.toLocaleDateString('en-IE', { month: 'short', year: '2-digit' });
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-4">
            {/* Back */}
            <button
                onClick={() => router.push('/products')}
                className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Screener
            </button>

            {/* Compact Header — image + name + Add to Collection */}
            <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-[#151A21] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                        <img
                            src={`/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Package className="w-8 h-8 text-gray-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white border border-white/20">
                            {product.category}
                        </span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest">{product.expansion}</span>
                        <span className="text-xs text-gray-500">{product.releaseYear}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight truncate">{product.name}</h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Watch toggle */}
                    <button
                        onClick={toggleWatch}
                        disabled={watchLoading}
                        title={isWatching ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium border transition-all ${
                            isWatching
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                    >
                        {watchLoading
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Bookmark className={`w-4 h-4 ${isWatching ? 'fill-amber-400' : ''}`} />
                        }
                        <span className="hidden sm:inline">{isWatching ? 'Watching' : 'Watch'}</span>
                    </button>

                    {/* Add to collection */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-primary text-[#0E1116] hover:bg-[#00c885] transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_20px_rgba(0,229,153,0.5)] rounded-md px-5 py-2 text-sm font-bold"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add to Collection
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Chart + Commentary */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Price History Chart */}
                    <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-white">Price History</h3>
                                {chartData.length > 1 && (
                                    <p className={`text-xs mt-0.5 ${periodChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {periodChange >= 0 ? '+' : ''}{periodChange.toFixed(2)}% in selected period
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-1">
                                {TIMEFRAMES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTimeframe(t)}
                                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                                            t === timeframe
                                                ? 'bg-primary/20 text-primary border border-primary/30'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[320px] w-full">
                            {chartData.length <= 1 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                    No price history data yet. Run a sync to populate.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorPriceHist" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            stroke="rgba(255,255,255,0.1)"
                                            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                                            tickMargin={10}
                                            minTickGap={40}
                                            tickFormatter={formatXAxis}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.1)"
                                            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                                            tickFormatter={(val) => `€${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                                            tickMargin={8}
                                            width={50}
                                            domain={([dataMin, dataMax]: [number, number]) => {
                                                const range = dataMax - dataMin || dataMax * 0.05 || 10;
                                                const pad = range * 0.2;
                                                return [Math.floor(dataMin - pad), Math.ceil(dataMax + pad)];
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0E1116', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff', fontWeight: 500 }}
                                            labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontSize: '10px' }}
                                            formatter={(val: number) => [`€${val.toFixed(2)}`, 'Price']}
                                            labelFormatter={(label) => {
                                                const d = new Date(label);
                                                return isNaN(d.getTime()) ? label : d.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
                                            }}
                                        />
                                        <Area
                                            type="linear"
                                            dataKey="value"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="url(#colorPriceHist)"
                                            dot={false}
                                            activeDot={{ r: 5, fill: '#3b82f6', stroke: '#0E1116', strokeWidth: 2 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </Card>

                    {/* Algorithmic Commentary */}
                    <Card className="bg-[#151A21] border border-primary/20 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <h3 className="text-base font-semibold text-white mb-3 flex items-center">
                            <Activity className="w-4 h-4 mr-2 text-primary" /> Algorithmic Commentary
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            This asset exhibits a {score > 60 ? 'strong' : 'moderate'} liquidity profile relative to its category peers.
                            {change30D == null
                                ? ' Insufficient price history to assess short-term momentum.'
                                : ` Recent price action shows ${change30D >= 0 ? 'bullish momentum' : 'a period of consolidation'} with a ${Math.abs(change30D).toFixed(1)}% move over the last 30 days.`}
                            {change12M != null && ` Over the past year, the price has ${change12M >= 0 ? 'appreciated' : 'declined'} by ${Math.abs(change12M).toFixed(1)}%.`}
                            {' '}The fundamentals for {product.expansion} sealed products remain driven by set popularity and natural attrition of raw supply.
                        </p>
                    </Card>

                    {/* Store Discovery */}
                    <StoreOffers productId={product.id} />
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-6">
                    {/* Price Card */}
                    <div className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 shadow-lg">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Est. Value</p>
                        <div className="flex items-end gap-3 flex-wrap">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {product.price ? `€${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'}
                            </span>
                            <div className="flex items-center gap-2 pb-1">
                                {change30D == null ? (
                                    <span className="text-sm text-gray-600">30D —</span>
                                ) : (
                                    <span className={`text-sm font-semibold ${change30D >= 0 ? 'text-[#00E599]' : 'text-[#FF4D4D]'}`}>
                                        {change30D >= 0 ? '+' : ''}{change30D.toFixed(1)}% 30D
                                    </span>
                                )}
                                <span className="text-gray-600 text-xs">·</span>
                                {change12M == null ? (
                                    <span className="text-sm text-gray-600">12M —</span>
                                ) : (
                                    <span className={`text-sm font-semibold ${change12M >= 0 ? 'text-[#00E599]' : 'text-[#FF4D4D]'}`}>
                                        {change12M >= 0 ? '+' : ''}{change12M.toFixed(1)}% 12M
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {product.lastPriceSync ? (
                                <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                    <Activity className="w-3 h-3 mr-1" /> LIVE
                                </span>
                            ) : (
                                <span className="inline-flex items-center text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    ESTIMATED
                                </span>
                            )}
                            {product.availabilityCount != null && (
                                <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${product.availabilityCount < 20 ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                                    <ShoppingCart className="w-3 h-3 mr-1" /> {product.availabilityCount} available
                                </span>
                            )}
                            {product.lastPriceSync && (
                                <span className="text-[10px] text-gray-500">
                                    {new Date(product.lastPriceSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Nexfolio Score */}
                    <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] p-6">
                        {(() => {
                            const r = 44;
                            const circ = 2 * Math.PI * r;
                            const offset = circ * (1 - score / 100);
                            const color = score >= 70 ? '#00E599' : score >= 40 ? '#f59e0b' : '#ef4444';
                            const label = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Weak';
                            return (
                                <div className="flex items-center gap-5">
                                    <div className="relative shrink-0">
                                        <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                                            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                            <circle
                                                cx="50" cy="50" r={r} fill="none"
                                                stroke={color} strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={circ}
                                                strokeDashoffset={offset}
                                                style={{ transition: 'stroke-dashoffset 0.6s ease', filter: `drop-shadow(0 0 6px ${color}80)` }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-3xl font-bold text-white">{score}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Nexfolio Score</p>
                                        <p className="text-lg font-bold" style={{ color }}>{label}</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">Liquidity · Momentum · Scarcity</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </Card>

                    {/* Key Metrics */}
                    <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)]">
                        <CardHeader className="pb-3 border-b border-[rgba(255,255,255,0.06)]">
                            <CardTitle className="text-sm font-medium text-white uppercase tracking-wider">Key Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <TrendingUp className="w-4 h-4 mr-2" /> 30D Change
                                    </div>
                                    {change30D == null ? (
                                        <span className="text-sm text-gray-600">—</span>
                                    ) : (
                                        <span className={`text-sm font-semibold ${change30D >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {change30D >= 0 ? '+' : ''}{change30D.toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <TrendingUp className="w-4 h-4 mr-2" /> 12M Change
                                    </div>
                                    {change12M == null ? (
                                        <span className="text-sm text-gray-600">—</span>
                                    ) : (
                                        <span className={`text-sm font-semibold ${change12M >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {change12M >= 0 ? '+' : ''}{change12M.toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <ShoppingCart className="w-4 h-4 mr-2" /> Availability
                                    </div>
                                    <span className={`text-sm font-bold ${(product.availabilityCount ?? 99) < 20 ? 'text-yellow-500' : 'text-primary'}`}>
                                        {product.availabilityCount ?? 'N/A'}
                                    </span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <Activity className="w-4 h-4 mr-2" /> Data Points
                                    </div>
                                    <span className="text-sm font-medium text-white">
                                        {product.priceHistory?.length ?? 0}
                                    </span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Risk Profile
                                    </div>
                                    <span className={`text-sm font-medium ${score > 70 ? 'text-amber-400' : score > 40 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                        {score > 70 ? 'Elevated' : score > 40 ? 'Moderate' : 'Low'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add to Collection Modal */}
            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={(item: CollectionItem) => {
                    setIsAddModalOpen(false);
                    router.push('/collection');
                }}
                initialProduct={{
                    id: product.id,
                    name: product.name,
                    expansion: product.expansion,
                    category: product.category,
                    price: product.price,
                    imageUrl: product.imageUrl,
                }}
            />
        </div>
    );
}
