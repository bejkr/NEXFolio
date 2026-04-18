'use client';

import { Search, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

export type SortOption =
    | 'value_desc' | 'value_asc'
    | 'profit_desc' | 'profit_asc'
    | 'date_desc' | 'date_asc'
    | 'name_asc' | 'name_desc';

interface CollectionFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeCategory: string;
    setActiveCategory: (category: string) => void;
    viewMode: 'list' | 'grid';
    setViewMode: (mode: 'list' | 'grid') => void;
    sortBy: SortOption;
    setSortBy: (sort: SortOption) => void;
}

export function CollectionFilters({
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
}: CollectionFiltersProps) {
    const categories = ['All', 'Sealed', 'Graded', 'Raw'];

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex space-x-2 border border-[rgba(255,255,255,0.06)] rounded-lg p-1 bg-[#151A21]">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeCategory === category
                            ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,229,153,0.15)]'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Sort dropdown */}
                <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-lg pl-8 pr-8 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none cursor-pointer"
                    >
                        <optgroup label="Value">
                            <option value="value_desc">Value ↓</option>
                            <option value="value_asc">Value ↑</option>
                        </optgroup>
                        <optgroup label="Profit">
                            <option value="profit_desc">Profit ↓</option>
                            <option value="profit_asc">Profit ↑</option>
                        </optgroup>
                        <optgroup label="Date Added">
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                        </optgroup>
                        <optgroup label="Name">
                            <option value="name_asc">Name A→Z</option>
                            <option value="name_desc">Name Z→A</option>
                        </optgroup>
                    </select>
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search collection..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>

                {/* View toggle */}
                <div className="flex items-center space-x-1 border border-[rgba(255,255,255,0.06)] rounded-lg p-1 bg-[#151A21]">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white/[0.1] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                        title="List View"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white/[0.1] text-white'
                                : 'text-gray-500 hover:text-gray-300'
                            }`}
                        title="Grid View"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
