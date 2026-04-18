'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { CollectionFilters, SortOption } from '@/components/CollectionFilters';
import { CollectionTable } from '@/components/CollectionTable';
import { CollectionGrid } from '@/components/CollectionGrid';
import { AddItemModal } from '@/components/collection/AddItemModal';
import { CollectionItem } from '@/lib/mockData';
import { Loader2, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { WatchlistTab } from '@/components/WatchlistTab';
import { PortfolioSignalsTab } from '@/components/PortfolioSignalsTab';
import { useWatchlistHits } from '@/context/WatchlistHitsContext';
import { Pagination } from '@/components/ui/Pagination';

type Tab = 'portfolio' | 'reports' | 'watchlist' | 'signals';

export default function CollectionPage() {
    const [tab, setTab] = useState<Tab>('portfolio');
    const { totalAlerts } = useWatchlistHits();

    // Collection state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [sortBy, setSortBy] = useState<SortOption>('date_desc');
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Pagination
    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const response = await fetch('/api/collection');
                if (response.ok) {
                    const data = await response.json();
                    setItems(data.map((item: any) => ({
                        ...item,
                        currentValue: item.product?.price ?? item.currentValue,
                    })));
                }
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollection();
    }, []);

    // ── Metrics (shared) ──────────────────────────────────────────
    const totalValue   = items.reduce((s, i) => s + i.currentValue * (i.quantity || 1), 0);
    const totalCost    = items.reduce((s, i) => s + i.costBasis  * (i.quantity || 1), 0);
    const totalProfit  = totalValue - totalCost;
    const totalProfitPerc = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    const fmt = (v: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(v);
    const fmtFull = (v: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);
    const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
    const clr = (v: number) => v >= 0 ? 'text-emerald-400' : 'text-red-400';

    // ── Portfolio tab logic ───────────────────────────────────────
    const filteredData = useMemo(() => items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.set.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
    }), [searchQuery, activeCategory, items]);

    const handleSearchChange   = useCallback((q: string) => { setSearchQuery(q);  setCurrentPage(1); }, []);
    const handleCategoryChange = useCallback((c: string) => { setActiveCategory(c); setCurrentPage(1); }, []);
    const handleSortChange     = useCallback((s: SortOption) => { setSortBy(s);   setCurrentPage(1); }, []);

    const sortedFilteredData = useMemo(() => {
        const s = [...filteredData];
        switch (sortBy) {
            case 'value_desc':  return s.sort((a, b) => (b.currentValue*(b.quantity||1)) - (a.currentValue*(a.quantity||1)));
            case 'value_asc':   return s.sort((a, b) => (a.currentValue*(a.quantity||1)) - (b.currentValue*(b.quantity||1)));
            case 'profit_desc': return s.sort((a, b) => ((b.currentValue-b.costBasis)*(b.quantity||1)) - ((a.currentValue-a.costBasis)*(a.quantity||1)));
            case 'profit_asc':  return s.sort((a, b) => ((a.currentValue-a.costBasis)*(a.quantity||1)) - ((b.currentValue-b.costBasis)*(b.quantity||1)));
            case 'date_desc':   return s.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
            case 'date_asc':    return s.sort((a, b) => new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime());
            case 'name_asc':    return s.sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc':   return s.sort((a, b) => b.name.localeCompare(a.name));
            default: return s;
        }
    }, [filteredData, sortBy]);

    const totalPages   = Math.ceil(sortedFilteredData.length / PAGE_SIZE);
    const paginatedData = sortedFilteredData.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

    const handleAddItem    = (item: CollectionItem) => setItems(prev => [item, ...prev]);
    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        const res = await fetch(`/api/collection/${id}`, { method: 'DELETE' });
        if (res.ok) setItems(prev => prev.filter(i => i.id !== id));
    };

    // ── Reports tab data ─────────────────────────────────────────
    const reportRows = useMemo(() => items.map(item => {
        const qty = item.quantity || 1;
        const cost = item.costBasis * qty;
        const value = item.currentValue * qty;
        const pnl = value - cost;
        const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
        return { item, qty, cost, value, pnl, pnlPct };
    }), [items]);

    const winners  = reportRows.filter(r => r.pnl > 0);
    const losers   = reportRows.filter(r => r.pnl < 0);
    const winRate  = reportRows.length > 0 ? Math.round((winners.length / reportRows.length) * 100) : 0;
    const bestItem  = [...reportRows].sort((a, b) => b.pnlPct - a.pnlPct)[0];
    const worstItem = [...reportRows].sort((a, b) => a.pnlPct - b.pnlPct)[0];

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portfolio</h1>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mt-4">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{fmt(totalValue)}</span>
                        </div>
                        <div className="border-l border-[rgba(255,255,255,0.06)] pl-6 md:pl-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Cost</p>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{fmt(totalCost)}</span>
                        </div>
                        <div className="lg:border-l border-[rgba(255,255,255,0.06)] lg:pl-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">P&amp;L</p>
                            <div className="flex flex-col">
                                <span className={`text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap ${clr(totalProfit)}`}>
                                    {totalProfit >= 0 ? '+' : ''}{fmt(totalProfit)}
                                </span>
                                <span className={`text-xs font-bold opacity-80 ${clr(totalProfit)}`}>
                                    {fmtPct(totalProfitPerc)}
                                </span>
                            </div>
                        </div>
                        <div className="border-l border-[rgba(255,255,255,0.06)] pl-6 md:pl-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Items</p>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{items.length}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="shrink-0 w-full md:w-auto bg-primary text-[#0E1116] hover:bg-[#00c885] transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_20px_rgba(0,229,153,0.5)] rounded-md px-6 py-3 md:px-4 md:py-2 text-sm font-bold"
                >
                    + Add Item
                </button>
            </div>

            {/* ── Tab bar ── */}
            <div className="flex border-b border-[rgba(255,255,255,0.06)] mb-6">
                {([['portfolio', 'Collection'], ['reports', 'P&L Reports'], ['watchlist', 'Watchlist'], ['signals', 'Signals']] as [Tab, string][]).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                            tab === key
                                ? 'border-primary text-white'
                                : 'border-transparent text-gray-400 hover:text-white'
                        }`}
                    >
                        {label}
                        {key === 'watchlist' && totalAlerts > 0 && (
                            <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-[10px] font-bold text-white px-1 leading-none">
                                {totalAlerts > 9 ? '9+' : totalAlerts}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Portfolio tab ── */}
            {tab === 'portfolio' && (
                <>
                    <CollectionFilters
                        searchQuery={searchQuery}
                        setSearchQuery={handleSearchChange}
                        activeCategory={activeCategory}
                        setActiveCategory={handleCategoryChange}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        sortBy={sortBy}
                        setSortBy={handleSortChange}
                    />
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                            <p>Loading your collection...</p>
                        </div>
                    ) : viewMode === 'list' ? (
                        <CollectionTable data={paginatedData} onDelete={handleDeleteItem} />
                    ) : (
                        <CollectionGrid data={paginatedData} onDelete={handleDeleteItem} />
                    )}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={sortedFilteredData.length}
                        pageSize={PAGE_SIZE}
                    />
                </>
            )}

            {/* ── Reports tab ── */}
            {tab === 'reports' && (
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                            <p>Loading...</p>
                        </div>
                    ) : reportRows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Package className="w-10 h-10 mb-3 opacity-30" />
                            <p className="text-sm">No assets yet. Add items to your collection to see P&amp;L.</p>
                        </div>
                    ) : (
                        <>
                            {/* Win rate + best/worst */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl p-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Win Rate</p>
                                    <p className="text-3xl font-bold text-white">{winRate}%</p>
                                    <p className="text-xs text-gray-500 mt-1">{winners.length}W / {losers.length}L</p>
                                </div>
                                {bestItem && (
                                    <div className="bg-[#0E1116] border border-emerald-500/20 rounded-xl p-5">
                                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">Best Performer</p>
                                        <p className="text-white font-semibold truncate">{bestItem.item.name}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">{fmtFull(bestItem.cost)} → {fmtFull(bestItem.value)}</span>
                                            <span className={`text-sm font-bold ${clr(bestItem.pnlPct)}`}>{fmtPct(bestItem.pnlPct)}</span>
                                        </div>
                                    </div>
                                )}
                                {worstItem && (
                                    <div className="bg-[#0E1116] border border-red-500/20 rounded-xl p-5">
                                        <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">Worst Performer</p>
                                        <p className="text-white font-semibold truncate">{worstItem.item.name}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">{fmtFull(worstItem.cost)} → {fmtFull(worstItem.value)}</span>
                                            <span className={`text-sm font-bold ${clr(worstItem.pnlPct)}`}>{fmtPct(worstItem.pnlPct)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* P&L table */}
                            <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
                                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Asset Breakdown</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[rgba(255,255,255,0.06)]">
                                                {['Asset', 'Category', 'Qty', 'Cost Basis', 'Current Value', 'P&L', 'P&L %'].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                                            {reportRows.map(({ item, qty, cost, value, pnl, pnlPct }) => (
                                                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-[#151A21] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                                {(item as any).product?.imageUrl ? (
                                                                    <img src={`/api/proxy-image?url=${encodeURIComponent((item as any).product.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Package className="w-4 h-4 text-gray-600" />
                                                                )}
                                                            </div>
                                                            <span className="text-gray-200 font-medium max-w-[180px] truncate">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{item.category}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400">{qty}</td>
                                                    <td className="px-4 py-3 text-gray-300">{fmtFull(cost)}</td>
                                                    <td className="px-4 py-3 text-gray-200 font-medium">{fmtFull(value)}</td>
                                                    <td className={`px-4 py-3 font-semibold ${clr(pnl)}`}>
                                                        {pnl >= 0 ? '+' : ''}{fmtFull(pnl)}
                                                    </td>
                                                    <td className={`px-4 py-3 font-semibold ${clr(pnlPct)}`}>
                                                        {fmtPct(pnlPct)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-[rgba(255,255,255,0.08)]">
                                            <tr className="bg-[#151A21]/40">
                                                <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</td>
                                                <td className="px-4 py-3 text-gray-300 font-medium">{fmtFull(totalCost)}</td>
                                                <td className="px-4 py-3 text-gray-200 font-semibold">{fmtFull(totalValue)}</td>
                                                <td className={`px-4 py-3 font-bold ${clr(totalProfit)}`}>{totalProfit >= 0 ? '+' : ''}{fmtFull(totalProfit)}</td>
                                                <td className={`px-4 py-3 font-bold ${clr(totalProfitPerc)}`}>{fmtPct(totalProfitPerc)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Watchlist tab ── */}
            {tab === 'watchlist' && <WatchlistTab />}

            {/* ── Signals tab ── */}
            {tab === 'signals' && <PortfolioSignalsTab />}

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem}
            />
        </div>
    );
}
