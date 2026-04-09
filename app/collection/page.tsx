'use client';

export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from 'react';
import { CollectionFilters } from '@/components/CollectionFilters';
import { CollectionTable } from '@/components/CollectionTable';
import { CollectionGrid } from '@/components/CollectionGrid';
import { AddItemModal } from '@/components/collection/AddItemModal';
import { CollectionItem } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';

export default function CollectionPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const response = await fetch('/api/collection');
                if (response.ok) {
                    const data = await response.json();
                    const mappedItems = data.map((item: any) => ({
                        ...item,
                        currentValue: item.product?.price ?? item.currentValue
                    }));
                    setItems(mappedItems);
                }
            } catch (error) {
                console.error('Error fetching collection:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollection();
    }, []);

    // Calculate total collection metrics
    const totalItems = items.length;
    const totalValue = items.reduce((acc, item) => acc + (item.currentValue * (item.quantity || 1)), 0);
    const totalCost = items.reduce((acc, item) => acc + (item.costBasis * (item.quantity || 1)), 0);
    const totalProfit = totalValue - totalCost;
    const totalProfitPerc = (totalProfit / totalCost) * 100;

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

    const filteredData = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.set.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' ? true : item.category === activeCategory;

            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, activeCategory, items]);

    const handleAddItem = (newItem: CollectionItem) => {
        setItems(prev => [newItem, ...prev]);
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await fetch(`/api/collection/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setItems(prev => prev.filter(item => item.id !== id));
            } else {
                console.error('Failed to delete item');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Collection</h1>
                    <p className="text-sm text-gray-400 mb-6">Manage and track your individual Pokemon TCG cards and sealed products.</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Value</p>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{formatCurrency(totalValue)}</span>
                        </div>
                        <div className="border-l border-[rgba(255,255,255,0.06)] pl-6 md:pl-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Cost</p>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="lg:border-l border-[rgba(255,255,255,0.06)] lg:pl-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Profit / Loss</p>
                            <div className="flex flex-col">
                                <span className={`text-2xl md:text-3xl font-bold tracking-tight whitespace-nowrap ${totalProfit >= 0 ? 'text-[#00E599]' : 'text-[#FF4D4D]'}`}>
                                    {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                                </span>
                                <span className={`text-xs font-bold ${totalProfit >= 0 ? 'text-[#00E599]' : 'text-[#FF4D4D]'} opacity-80`}>
                                    {totalProfit >= 0 ? '+' : ''}{totalProfitPerc ? totalProfitPerc.toFixed(2) : '0.00'}%
                                </span>
                            </div>
                        </div>
                        <div className="border-l border-[rgba(255,255,255,0.06)] pl-6 md:pl-8">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Items</p>
                            <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{totalItems}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-3 shrink-0 w-full md:w-auto">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-full md:w-auto bg-primary text-[#0E1116] hover:bg-[#00c885] transition-all shadow-[0_0_15px_rgba(0,229,153,0.3)] hover:shadow-[0_0_20px_rgba(0,229,153,0.5)] rounded-md px-6 py-3 md:px-4 md:py-2 text-sm font-bold border border-transparent"
                    >
                        Add Item
                    </button>
                </div>
            </div>

            <CollectionFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                viewMode={viewMode}
                setViewMode={setViewMode}
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                    <p>Loading your collection...</p>
                </div>
            ) : viewMode === 'list' ? (
                <CollectionTable data={filteredData} onDelete={handleDeleteItem} />
            ) : (
                <CollectionGrid data={filteredData} onDelete={handleDeleteItem} />
            )}

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddItem}
            />
        </div>
    );
}
