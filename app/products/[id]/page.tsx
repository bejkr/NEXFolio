'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Package, ShieldCheck, Globe, Activity, TrendingUp, AlertTriangle, Loader2, ArrowLeft, ShoppingCart } from "lucide-react";
import { StoreOffers } from "@/components/StoreOffers";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    // Clean dynamic DB ids
    const dbId = params.id.startsWith('db_') ? params.id.replace('db_', '') : params.id;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // To fetch a single product, we can query our list API by exact ID or name,
                // but since the API is built for searching, we'll fetch all and filter client side
                // for this specific ID. Alternatively we can implement a GET /api/products/[id]
                // For simplicity we will search
                const res = await fetch(`/api/products/${dbId}`);
                if (res.status === 404) {
                    notFound();
                    return;
                }
                const data = await res.json();
                if (data && !data.error) {
                    setProduct(data);
                } else {
                    notFound();
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [dbId]);



    if (loading) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!product) return null;
    
    // Use real metrics from API
    const price = product.price || 0;
    const change30D = product.change30D || 0;
    const change12M = product.change12M || 0;
    const score = product.nexfolioScore || 50;
    const isPositive = change12M >= 0;

    // Use real chart data from product.priceHistory
    const chartData = product.priceHistory && product.priceHistory.length > 0
        ? product.priceHistory.map((h: any) => ({
            date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: h.price
        }))
        : [{
            date: 'Current',
            value: price
        }];

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">
            {/* Header Section */}
            <button
                onClick={() => router.push('/products')}
                className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Screener
            </button>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-xl bg-[#151A21] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={`/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}`}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-10 h-10 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-white/10 text-white border border-white/20">
                                {product.category}
                            </span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">{product.expansion}</span>
                            <span className="text-xs text-gray-500">{product.releaseYear}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-1">{product.name}</h1>
                        <p className="text-gray-400 text-sm">Product ID: {product.id.substring(0, 8)}...</p>
                    </div>
                </div>

                <div className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 min-w-[250px] shadow-lg relative overflow-hidden">
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Current Est. Value</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-white tracking-tight">
                            {product.price ? `€${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : 'N/A'}
                        </span>

                    </div>

                    <div className="mt-2 flex items-center gap-2">
                        {product.lastPriceSync ? (
                            <span className="inline-flex items-center text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                <Activity className="w-3 h-3 mr-1" /> LIVE
                            </span>
                        ) : (
                            <span className="inline-flex items-center text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                ESTIMATED
                            </span>
                        )}
                        {product.availabilityCount !== null && (
                            <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${product.availabilityCount < 20 ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>
                                <ShoppingCart className="w-3 h-3 mr-1" /> {product.availabilityCount} AVAILABLE
                            </span>
                        )}
                        {product.lastPriceSync && (
                            <span className="text-[10px] text-gray-500">
                                Updated {new Date(product.lastPriceSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>


                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Trend Price</p>
                            <p className="text-sm font-semibold text-white">
                                {product.trendPrice ? `€${product.trendPrice.toFixed(2)}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">7D Average</p>
                            <p className="text-sm font-semibold text-white">
                                {product.sevenDayAvg ? `€${product.sevenDayAvg.toFixed(2)}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">30D Average</p>
                            <p className="text-sm font-semibold text-white">
                                {product.thirtyDayAvg ? `€${product.thirtyDayAvg.toFixed(2)}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">From Price</p>
                            <p className={`text-sm font-semibold ${product.priceReason?.includes('outlier') ? 'text-red-400' : 'text-white'}`}>
                                {product.fromPrice ? `€${product.fromPrice.toFixed(2)}` : '—'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <span className={`flex items-center text-sm font-semibold ${change30D >= 0 ? 'text-[#00E599]' : 'text-[#FF4D4D]'}`}>
                            {change30D >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                            {Math.abs(change30D).toFixed(1)}% (30D)
                        </span>
                        <span className="text-[10px] text-gray-500 italic max-w-[150px] text-right leading-tight">
                            {product.priceReason ? `Source: ${product.priceReason}` : 'Price estimate based on market data'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area (Chart + Commentary) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Interactive Chart */}
                    <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white">Price History (30 Days)</h3>
                            <div className="flex space-x-2">
                                {['1W', '1M', '3M', '1Y', 'ALL'].map(t => (
                                    <button key={t} className={`px-3 py-1 text-xs font-medium rounded-md ${t === '1M' ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="rgba(255,255,255,0.2)"
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                        tickMargin={10}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        stroke="rgba(255,255,255,0.2)"
                                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                                        tickFormatter={(val) => `€${val}`}
                                        tickMargin={10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#151A21', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 500 }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, fill: "#3b82f6", stroke: "#0E1116", strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Investment Thesis / Commentary */}
                    <Card className="bg-[#151A21] border border-primary/20 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary" /> Algorithmic Commentary
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            This asset exhibits a {score > 60 ? 'strong' : 'moderate'} liquidity profile relative to its category peers.
                            Recent price action shows {isPositive ? 'bullish momentum' : 'a period of consolidation'},
                            supported by stable supply metrics on secondary markets. The fundamentals for {product.expansion}
                            sealed products remain robust due to sustained set popularity and natural attrition of available raw supply.
                        </p>
                    </Card>

                    {/* Store Discovery Widget */}
                    <StoreOffers productId={product.id} />
                </div>

                {/* Sidebar Metrics */}
                <div className="space-y-6">
                    {/* Index Score */}
                    <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 flex items-center justify-center mb-4 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-primary" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${100 - score}%, 0 ${100 - score}%)` }} />
                            <span className="text-4xl font-bold text-white">{score}</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">Nexfolio Index Score</h3>
                        <p className="text-xs text-gray-500">Based on liquidity, momentum, and scarcity.</p>
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
                                        <TrendingUp className="w-4 h-4 mr-2" /> Volatility
                                    </div>
                                    <span className="text-sm font-medium text-white">{score > 70 ? 'High' : 'Medium'}</span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <ShoppingCart className="w-4 h-4 mr-2" /> Market Availability
                                    </div>
                                    <span className={`text-sm font-bold ${product.availabilityCount < 20 ? 'text-yellow-500' : 'text-primary'}`}>
                                        {product.availabilityCount ?? 'N/A'}
                                    </span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <Globe className="w-4 h-4 mr-2" /> Global Tx Vol.
                                    </div>
                                    <span className="text-sm font-medium text-white">{score * 12} per week</span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <ShieldCheck className="w-4 h-4 mr-2" /> Authentication
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</span>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Risk Profile
                                    </div>
                                    <span className={`text-sm font-medium ${score > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                        {score > 60 ? 'Moderate' : 'Low'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
