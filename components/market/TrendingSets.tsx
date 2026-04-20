'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { TrendingSet } from '@/lib/mockData';
import { getSetLogoUrl } from '@/lib/setLogos';

function SetLogo({ expansion }: { expansion: string }) {
    const url = getSetLogoUrl(expansion);
    if (url) {
        return (
            <div className="w-12 h-8 shrink-0 flex items-center justify-center">
                <img
                    src={url}
                    alt={expansion}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            </div>
        );
    }
    return (
        <div className="w-12 h-8 shrink-0 rounded bg-white/[0.05] flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-none text-center px-1">
                {expansion.slice(0, 3)}
            </span>
        </div>
    );
}

function Change({ value }: { value: number }) {
    const pos = value > 0;
    const flat = Math.abs(value) < 0.1;
    if (flat) return <span className="text-xs text-gray-500">—</span>;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${pos ? 'text-[#00E599]' : 'text-red-400'}`}>
            {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {pos ? '+' : ''}{value.toFixed(1)}%
        </span>
    );
}

function HeatBar({ value }: { value: number }) {
    const clamped = Math.min(Math.abs(value), 30);
    const width = Math.round((clamped / 30) * 100);
    const color = value > 0 ? 'bg-[#00E599]' : 'bg-red-400';
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
            </div>
        </div>
    );
}

export function TrendingSets({ data }: { data: TrendingSet[] }) {
    if (data.length === 0) return null;

    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
                <div>
                    <h3 className="text-sm font-semibold text-white">Hot Expansions</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Sets with biggest 30-day price movement</p>
                </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_80px_1fr] gap-4 px-5 py-2.5 bg-white/[0.02] border-b border-[rgba(255,255,255,0.06)] text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <span>Expansion</span>
                <span className="text-right">Avg Price</span>
                <span className="text-right">30D</span>
                <span className="pl-2">Movement</span>
            </div>

            {data.map((set, i) => (
                <div
                    key={set.expansion}
                    className="grid grid-cols-[2fr_1fr_80px_1fr] gap-4 px-5 py-3.5 items-center border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                    {/* Name */}
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-600 w-4 shrink-0 tabular-nums">{i + 1}</span>
                        <SetLogo expansion={set.expansion} />
                        <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{set.expansion}</p>
                            <span className="text-[11px] text-gray-500">
                                {set.releaseYear ?? '—'}
                            </span>
                        </div>
                    </div>

                    {/* Avg price */}
                    <div className="text-right text-sm text-gray-300 tabular-nums">
                        {set.avgPrice != null ? `€${set.avgPrice.toFixed(0)}` : '—'}
                    </div>

                    {/* 30D change */}
                    <div className="text-right">
                        <Change value={set.avgChange30D} />
                    </div>

                    {/* Heat bar */}
                    <div className="pl-2">
                        <HeatBar value={set.avgChange30D} />
                    </div>
                </div>
            ))}
        </div>
    );
}
