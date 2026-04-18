'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Package } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

type FilterType = 'all' | 'scarce' | 'liquid';

interface AvailabilityItem {
    id: string;
    name: string;
    expansion: string | null;
    category: string | null;
    price: number | null;
    availabilityCount: number | null;
    imageUrl: string | null;
    change30D: number | null;
}

function statusBadge(count: number | null) {
    if (count === null) return { label: 'Unknown', cls: 'bg-white/5 text-gray-500' };
    if (count === 0)    return { label: 'Out of Stock', cls: 'bg-red-500/10 text-red-400' };
    if (count < 5)      return { label: 'Critical', cls: 'bg-red-500/10 text-red-400' };
    if (count < 20)     return { label: 'Scarce', cls: 'bg-yellow-500/10 text-yellow-400' };
    if (count < 100)    return { label: 'Stable', cls: 'bg-blue-500/10 text-blue-400' };
    return               { label: 'Liquid', cls: 'bg-emerald-500/10 text-emerald-400' };
}

const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all',    label: 'All' },
    { key: 'scarce', label: 'Scarce  (< 20)' },
    { key: 'liquid', label: 'Liquid  (> 100)' },
];

export function AvailabilityTable() {
    const router = useRouter();

    const [filter, setFilter]   = useState<FilterType>('all');
    const [query, setQuery]     = useState('');
    const [page, setPage]       = useState(1);
    const [loading, setLoading] = useState(true);
    const [items, setItems]     = useState<AvailabilityItem[]>([]);
    const [total, setTotal]     = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async (q: string, f: FilterType, p: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ q, filter: f, page: String(p) });
            const res  = await fetch(`/api/availability?${params}`);
            const data = await res.json();
            setItems(data.items ?? []);
            setTotal(data.total ?? 0);
            setTotalPages(data.totalPages ?? 1);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce search, immediate for filter/page
    useEffect(() => {
        const id = setTimeout(() => fetchData(query, filter, page), query ? 300 : 0);
        return () => clearTimeout(id);
    }, [query, filter, page, fetchData]);

    const handleFilterChange = (f: FilterType) => { setFilter(f); setPage(1); };
    const handleSearch = (q: string)             => { setQuery(q);  setPage(1); };

    const fmtPrice = (v: number | null) =>
        v == null ? '—' : `€${v.toLocaleString('en-IE', { minimumFractionDigits: 2 })}`;

    const fmtPct = (v: number | null) =>
        v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

    return (
        <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#151A21]/30">
                <div>
                    <h3 className="text-lg font-semibold text-white">Inventory Watch</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {total.toLocaleString()} products tracked
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Filter tabs */}
                    <div className="flex items-center gap-1 border border-[rgba(255,255,255,0.06)] rounded-lg p-1 bg-[#0E1116]">
                        {FILTERS.map(f => (
                            <button
                                key={f.key}
                                onClick={() => handleFilterChange(f.key)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                                    filter === f.key
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-lg pl-8 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-52 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto relative">
                {loading && (
                    <div className="absolute inset-0 bg-[#0E1116]/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                )}

                {!loading && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Package className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm">No products match your filters.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#151A21]/10">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Expansion</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Price</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">30D</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Listings</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                            {items.map(item => {
                                const badge = statusBadge(item.availabilityCount);
                                const change = item.change30D;
                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => router.push(`/products/db_${item.id}`)}
                                        className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-md bg-[#151A21] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {item.imageUrl ? (
                                                        <img
                                                            src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="w-4 h-4 text-gray-600" />
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-200 group-hover:text-primary transition-colors max-w-[200px] lg:max-w-[340px] truncate">
                                                    {item.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden md:table-cell">
                                            <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5 whitespace-nowrap">
                                                {item.expansion ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                                            {item.category ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-200 text-right font-medium">
                                            {fmtPrice(item.price)}
                                        </td>
                                        <td className={`px-4 py-3 text-sm text-right font-medium ${
                                            change == null ? 'text-gray-600' : change >= 0 ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            {fmtPct(change)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-sm font-bold text-white">
                                                {item.availabilityCount ?? '?'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap ${badge.cls}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="px-4 pb-3 shrink-0">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={total}
                    pageSize={25}
                />
            </div>
        </div>
    );
}
