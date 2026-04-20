'use client';

import { Zap, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { PriceBreakout } from '@/lib/mockData';

function Pct({ value, className }: { value: number | null; className?: string }) {
    if (value === null) return <span className="text-xs text-gray-600">—</span>;
    const pos = value >= 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${pos ? 'text-[#00E599]' : 'text-red-400'} ${className ?? ''}`}>
            {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {pos ? '+' : ''}{value.toFixed(1)}%
        </span>
    );
}

export function PriceBreakouts({ data }: { data: PriceBreakout[] }) {
    if (data.length === 0) return null;

    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">7-Day Price Breakouts</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Sealed products up &gt;20% in the last 7 days</p>
                </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-2.5 bg-white/[0.02] border-b border-[rgba(255,255,255,0.06)] text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <span>Product</span>
                <span className="text-right">Price</span>
                <span className="text-right">7D</span>
                <span className="text-right">30D</span>
            </div>

            {data.map((item) => (
                <Link
                    key={item.id}
                    href={`/products/db_${item.id}`}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 items-center border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                    {/* Image + Name */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-[rgba(255,255,255,0.06)] shrink-0 overflow-hidden flex items-center justify-center">
                            {item.imageUrl ? (
                                <img
                                    src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-[9px] text-gray-600 font-bold uppercase">{item.category.slice(0,3)}</span>
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{item.name}</p>
                            <span className="text-[11px] text-gray-500">{item.activeListings} listings</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="text-right text-sm text-gray-300 tabular-nums">
                        {item.price != null ? `€${item.price.toFixed(2)}` : '—'}
                    </div>

                    {/* 7D */}
                    <div className="text-right">
                        <Pct value={item.change7D} />
                    </div>

                    {/* 30D context */}
                    <div className="text-right">
                        <Pct value={item.change30D} />
                    </div>
                </Link>
            ))}
        </div>
    );
}
