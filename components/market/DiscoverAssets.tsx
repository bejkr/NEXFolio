'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Droplets, Compass } from 'lucide-react';
import Link from 'next/link';
import { DiscoverAsset } from '@/lib/mockData';

const SORTS = [
    { key: 'score',     label: 'Best Score' },
    { key: 'momentum',  label: 'Top Momentum' },
    { key: 'liquidity', label: 'Most Liquid' },
] as const;

type SortKey = typeof SORTS[number]['key'];

const CATS = ['All', 'Sealed'] as const;
type Cat = typeof CATS[number];

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 70 ? 'text-[#00E599] bg-[#00E599]/10 border-[#00E599]/20'
        : score >= 45 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        : 'text-gray-400 bg-white/5 border-white/10';
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
            {score}
        </span>
    );
}

function MomentumBadge({ value }: { value: number | null }) {
    if (value === null) return <span className="text-xs text-gray-600">—</span>;
    const pos = value >= 0;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${pos ? 'text-[#00E599]' : 'text-red-400'}`}>
            {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {pos ? '+' : ''}{value.toFixed(1)}%
        </span>
    );
}

export function DiscoverAssets({ data }: { data: DiscoverAsset[] }) {
    const [sort, setSort] = useState<SortKey>('score');
    const [cat, setCat] = useState<Cat>('All');

    const filtered = data
        .filter(a => cat === 'All' || a.category === cat)
        .sort((a, b) => {
            if (sort === 'momentum') return (b.momentum30D ?? -999) - (a.momentum30D ?? -999);
            if (sort === 'liquidity') return b.liquidityScore - a.liquidityScore;
            return b.discoverScore - a.discoverScore;
        })
        .slice(0, 25);

    return (
        <div className="space-y-5 pt-2">
            {/* Controls */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                {/* Category filter */}
                <div className="flex gap-1">
                    {CATS.map(c => (
                        <button
                            key={c}
                            onClick={() => setCat(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                cat === c
                                    ? 'bg-white/10 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                {/* Sort */}
                <div className="flex gap-1">
                    {SORTS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSort(s.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                sort === s.key
                                    ? 'bg-[#00E599]/10 text-[#00E599] border border-[#00E599]/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-4 md:px-5 py-3 bg-white/[0.03] border-b border-[rgba(255,255,255,0.06)] text-xs text-gray-500 font-medium uppercase tracking-wider">
                    <span>Product</span>
                    <span className="text-right">Price</span>
                    <span className="hidden md:flex text-right items-center justify-end">30D</span>
                    <span className="hidden md:flex items-center justify-end gap-1"><Droplets className="w-3 h-3" />Liquidity</span>
                    <span className="text-right flex items-center justify-end gap-1"><Compass className="w-3 h-3" />Score</span>
                </div>

                {filtered.length === 0 && (
                    <div className="px-5 py-12 text-center text-gray-500 text-sm">No assets found.</div>
                )}

                {filtered.map((asset, i) => (
                    <Link
                        key={asset.id}
                        href={`/products/db_${asset.id}`}
                        className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-4 md:px-5 py-3.5 border-b border-[rgba(255,255,255,0.06)] last:border-0 hover:bg-white/[0.03] transition-colors items-center"
                    >
                        {/* Image + Name + rank */}
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <span className="hidden md:inline text-xs text-gray-600 w-5 shrink-0 tabular-nums">{i + 1}</span>
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/[0.05] border border-[rgba(255,255,255,0.06)] shrink-0 overflow-hidden flex items-center justify-center">
                                {asset.imageUrl ? (
                                    <img
                                        src={`/api/proxy-image?url=${encodeURIComponent(asset.imageUrl)}`}
                                        alt={asset.name}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-[9px] text-gray-600 font-bold uppercase">SEA</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-white font-medium truncate">{asset.name}</p>
                                <span className="text-[11px] text-gray-500">{asset.category}</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="text-right text-sm text-white font-medium tabular-nums">
                            {asset.price != null ? `€${asset.price.toFixed(2)}` : '—'}
                        </div>

                        {/* 30D momentum — hidden on mobile */}
                        <div className="hidden md:block text-right">
                            <MomentumBadge value={asset.momentum30D} />
                        </div>

                        {/* Liquidity — hidden on mobile */}
                        <div className="hidden md:block text-right">
                            <div className="inline-flex items-center gap-1.5">
                                <div className="w-12 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-blue-400"
                                        style={{ width: `${asset.liquidityScore}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-400 tabular-nums w-7">{asset.liquidityScore}</span>
                            </div>
                        </div>

                        {/* Discover score */}
                        <div className="text-right">
                            <ScoreBadge score={asset.discoverScore} />
                        </div>

                    </Link>
                ))}
            </div>

            <p className="text-xs text-gray-600 text-right">
                Score = 40% Nexfolio Index + 35% Momentum + 25% Liquidity
            </p>
        </div>
    );
}
