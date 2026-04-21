'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, Trash2, Check, X, Target, ExternalLink } from 'lucide-react';

interface WatchlistItem {
    id: string;
    productId: string;
    targetPrice: number | null;
    addedAt: string;
    name: string;
    expansion: string | null;
    category: string | null;
    imageUrl: string | null;
    price: number | null;
    change30D: number | null;
    change12M: number | null;
    nexfolioScore: number;
}

function ScoreBadge({ score }: { score: number }) {
    const color = score >= 70 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : score >= 40 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        : 'text-red-400 bg-red-500/10 border-red-500/20';
    return (
        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color}`}>{score}</span>
    );
}

export function WatchlistTab() {
    const router = useRouter();
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        fetch('/api/watchlist')
            .then(r => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
            .then(data => { if (Array.isArray(data)) setItems(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const removeItem = async (id: string) => {
        await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const startEdit = (item: WatchlistItem) => {
        setEditingId(item.id);
        setEditValue(item.targetPrice != null ? String(item.targetPrice) : '');
    };

    const saveTarget = async (id: string) => {
        const val = editValue.trim() === '' ? null : parseFloat(editValue);
        const res = await fetch(`/api/watchlist/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetPrice: isNaN(val as number) ? null : val }),
        });
        if (res.ok) {
            const updated = await res.json();
            setItems(prev => prev.map(i => i.id === id ? { ...i, targetPrice: updated.targetPrice } : i));
        }
        setEditingId(null);
    };

    const fmtPrice = (v: number | null) =>
        v == null ? '—' : `€${v.toLocaleString('en-IE', { minimumFractionDigits: 2 })}`;

    const fmtPct = (v: number | null) =>
        v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-[#151A21] border border-white/5 flex items-center justify-center mb-5">
                    <Target className="w-7 h-7 text-gray-500" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Watchlist is empty</h3>
                <p className="text-gray-400 text-sm max-w-xs mb-6">
                    Browse the Products screener and click the bookmark icon to start tracking prices.
                </p>
                <button
                    onClick={() => router.push('/products')}
                    className="px-5 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                    Browse Products →
                </button>
            </div>
        );
    }

    return (
        <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Watching</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{items.length} product{items.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                            {['Product', 'Price', '30D %', '12M %', 'Score', 'Target Price', ''].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap last:text-right">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                        {items.map(item => {
                            const atOrBelowTarget = item.targetPrice != null && item.price != null && item.price <= item.targetPrice;
                            return (
                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                    {/* Product */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-md bg-[#151A21] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                {item.imageUrl ? (
                                                    <img src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-4 h-4 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <button
                                                    onClick={() => router.push(`/products/db_${item.productId}`)}
                                                    className="text-gray-200 font-medium hover:text-primary transition-colors text-left max-w-[180px] truncate flex items-center gap-1 group/link"
                                                >
                                                    <span className="truncate">{item.name}</span>
                                                    <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </button>
                                                <p className="text-xs text-gray-500 truncate">{item.expansion}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-3 font-medium text-gray-200 whitespace-nowrap">
                                        {fmtPrice(item.price)}
                                    </td>

                                    {/* 30D */}
                                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${
                                        item.change30D == null ? 'text-gray-600'
                                        : item.change30D >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {fmtPct(item.change30D)}
                                    </td>

                                    {/* 12M */}
                                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${
                                        item.change12M == null ? 'text-gray-600'
                                        : item.change12M >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {fmtPct(item.change12M)}
                                    </td>

                                    {/* Score */}
                                    <td className="px-4 py-3">
                                        <ScoreBadge score={item.nexfolioScore} />
                                    </td>

                                    {/* Target Price — inline edit */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {editingId === item.id ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500 text-sm">€</span>
                                                <input
                                                    autoFocus
                                                    type="number"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') saveTarget(item.id); if (e.key === 'Escape') setEditingId(null); }}
                                                    className="w-24 bg-[#151A21] border border-primary/40 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                                                    placeholder="0.00"
                                                />
                                                <button onClick={() => saveTarget(item.id)} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-gray-300 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(item)}
                                                className={`text-sm transition-colors hover:text-white ${
                                                    atOrBelowTarget
                                                        ? 'text-emerald-400 font-semibold'
                                                        : item.targetPrice != null ? 'text-gray-300' : 'text-gray-600 hover:text-gray-400'
                                                }`}
                                                title="Click to set target price"
                                            >
                                                {item.targetPrice != null ? (
                                                    <span className="flex items-center gap-1">
                                                        {atOrBelowTarget && <Target className="w-3 h-3" />}
                                                        {fmtPrice(item.targetPrice)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs border border-dashed border-white/10 px-2 py-0.5 rounded hover:border-white/30 transition-colors">
                                                        Set target
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </td>

                                    {/* Remove */}
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
                                            title="Remove from watchlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
