'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Target, TrendingDown, Package, RefreshCw, ExternalLink } from 'lucide-react';
import { useWatchlistHits } from '@/context/WatchlistHitsContext';

export default function AlertsPage() {
    const router = useRouter();
    const { hits, near, totalAlerts, loading, refresh } = useWatchlistHits();

    // Refresh when page is opened
    useEffect(() => { refresh(); }, []);

    const fmtPrice = (v: number | null) =>
        v == null ? '—' : `€${v.toLocaleString('en-IE', { minimumFractionDigits: 2 })}`;

    const pctBelow = (price: number, target: number) =>
        (((target - price) / target) * 100).toFixed(1);

    const pctAway = (price: number, target: number) =>
        (((price - target) / target) * 100).toFixed(1);

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Alerts</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        Price alerts from your Watchlist. Set target prices in{' '}
                        <button onClick={() => router.push('/collection')} className="text-primary hover:underline">
                            Portfolio → Watchlist
                        </button>.
                    </p>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {totalAlerts === 0 && !loading ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-[#151A21] flex items-center justify-center mb-5 border border-white/5">
                        <Bell className="w-7 h-7 text-gray-600" />
                    </div>
                    <h3 className="text-white font-semibold text-lg mb-2">No active alerts</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">
                        Add products to your Watchlist and set a target price — you'll see alerts here when the price gets close or hits your target.
                    </p>
                    <button
                        onClick={() => router.push('/collection')}
                        className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                        Open Watchlist →
                    </button>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* 🎯 Target Hit */}
                    {hits.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
                                    Target Reached — {hits.length} item{hits.length !== 1 ? 's' : ''}
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {hits.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/products/db_${item.productId}`)}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-[#151A21] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-white font-semibold truncate">{item.name}</span>
                                                <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </div>
                                            <p className="text-xs text-gray-500">{item.expansion}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-emerald-400 font-bold text-sm">
                                                    {fmtPrice(item.price)}
                                                </span>
                                                <span className="text-xs text-gray-500">current</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Target {fmtPrice(item.targetPrice)}{' '}
                                                <span className="text-emerald-400 font-medium">
                                                    (−{pctBelow(item.price!, item.targetPrice!)}% below)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                                ✓ Hit
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 🔔 Near Target */}
                    {near.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="w-4 h-4 text-amber-400" />
                                <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                                    Approaching Target — {near.length} item{near.length !== 1 ? 's' : ''} within 10%
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {near.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors cursor-pointer group"
                                        onClick={() => router.push(`/products/db_${item.productId}`)}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-[#151A21] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                            {item.imageUrl ? (
                                                <img src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Package className="w-5 h-5 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-white font-semibold truncate">{item.name}</span>
                                                <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                            </div>
                                            <p className="text-xs text-gray-500">{item.expansion}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="text-amber-400 font-bold text-sm">
                                                    {fmtPrice(item.price)}
                                                </span>
                                                <span className="text-xs text-gray-500">current</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Target {fmtPrice(item.targetPrice)}{' '}
                                                <span className="text-amber-400 font-medium">
                                                    ({pctAway(item.price!, item.targetPrice!)}% away)
                                                </span>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                Near
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
