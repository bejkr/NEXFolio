'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Loader2, Package } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

export default function ProductsPage() {
    const router = useRouter();

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [expansionFilter, setExpansionFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [sortFilter, setSortFilter] = useState('name_asc');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const PAGE_SIZE = 25;

    // Data State
    const [products, setProducts] = useState<any[]>([]);
    const [availableExpansions, setAvailableExpansions] = useState<{ main: string[], other: string[] }>({ main: [], other: [] });
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // Reset to page 1 when filters change
    const handleSearchChange = (q: string) => { setSearchQuery(q); setPage(1); };
    const handleExpansionChange = (v: string) => { setExpansionFilter(v); setPage(1); };
    const handleYearChange = (v: string) => { setYearFilter(v); setPage(1); };
    const handleSortChange = (v: string) => { setSortFilter(v); setPage(1); };

    // Fetch Database Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    q: searchQuery,
                    expansion: expansionFilter,
                    year: yearFilter,
                    sort: sortFilter,
                    page: String(page),
                });
                const res = await fetch(`/api/products?${params.toString()}`);
                const data = await res.json();

                if (data.products) {
                    setProducts(data.products);
                    setTotalPages(data.totalPages ?? 1);
                    setTotalItems(data.total ?? 0);
                    setAvailableExpansions(data.filters.expansions || { main: [], other: [] });
                    setAvailableYears(data.filters.years || []);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search, immediate for other changes
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [searchQuery, expansionFilter, yearFilter, sortFilter, page]);

    // Metrics are now provided by the API

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-3xl font-bold text-white tracking-tight">Products Screener</h1>
                <p className="text-gray-400 mt-1 text-sm">Research DB populated from Cardmarket (2010+).</p>
            </div>

            <div className="flex flex-col gap-6 flex-1 min-h-0">

                {/* 1. Filters (Top) */}
                <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] shrink-0 w-full rounded-xl">
                    <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center space-x-2 bg-[#0E1116] rounded-t-xl">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <h2 className="font-semibold text-white">DB Filters</h2>
                    </div>
                    <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Search Name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="E.g. Booster Box..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md pl-9 pr-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        {/* Expansion */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Expansion Set</label>
                            <select
                                value={expansionFilter}
                                onChange={(e) => handleExpansionChange(e.target.value)}
                                className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option value="all">All Sets</option>
                                {availableExpansions.main.length > 0 && (
                                    <optgroup label="Main Sets" className="bg-[#0E1116] text-primary font-bold">
                                        {availableExpansions.main.map(exp => (
                                            <option key={exp} value={exp} className="bg-[#151A21] text-gray-200 font-normal">{exp}</option>
                                        ))}
                                    </optgroup>
                                )}
                                {availableExpansions.other.length > 0 && (
                                    <optgroup label="Other" className="bg-[#0E1116] text-gray-400">
                                        {availableExpansions.other.map(exp => (
                                            <option key={exp} value={exp} className="bg-[#151A21] text-gray-200">{exp}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>

                        {/* Release Year */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Release Year</label>
                            <select
                                value={yearFilter}
                                onChange={(e) => handleYearChange(e.target.value)}
                                className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option value="all">Any Year</option>
                                {availableYears.map(yr => (
                                    <option key={yr} value={yr}>{yr}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Sort By</label>
                            <select
                                value={sortFilter}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                                <option value="year_desc">Newest First</option>
                                <option value="year_asc">Oldest First</option>
                            </select>
                        </div>

                    </CardContent>
                </Card>

                {/* 2. Products Table */}
                <Card className="flex-1 min-h-0 bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden flex flex-col min-w-0">
                    <div className="overflow-y-auto custom-scrollbar flex-1 min-h-0 relative">
                        {loading && (
                            <div className="absolute inset-0 bg-[#0E1116]/50 backdrop-blur-sm z-20 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        )}
                        <Table>
                            <TableHeader className="sticky top-0 bg-[#0E1116] z-10 shadow-[0_1px_0_rgba(255,255,255,0.06)]">
                                <TableRow className="border-none hover:bg-transparent">
                                    <TableHead className="py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Product Info</TableHead>
                                    <TableHead className="py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Expansion</TableHead>
                                    <TableHead className="py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">Year</TableHead>
                                    <TableHead className="py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Est. Price</TableHead>
                                    <TableHead className="py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">30D %</TableHead>
                                    <TableHead className="py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Liquidity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.length === 0 && !loading ? (
                                    <TableRow className="border-none hover:bg-transparent">
                                        <TableCell colSpan={6} className="h-64 text-center text-gray-500">
                                            No products found matching your filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    products.map((product) => {
                                        const change30D = product.change30D || 0;
                                        const score = product.nexfolioScore || 50;
                                        return (
                                            <TableRow
                                                key={product.id}
                                                onClick={() => router.push(`/products/db_${product.id}`)}
                                                className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] group cursor-pointer transition-colors"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-md bg-[#151A21] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0 overflow-hidden">
                                                            {product.imageUrl ? (
                                                                <img
                                                                    src={`/api/proxy-image?url=${encodeURIComponent(product.imageUrl)}`}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Package className="w-5 h-5 text-gray-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-200 group-hover:text-primary transition-colors max-w-[250px] lg:max-w-[400px] truncate">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-0.5">{product.category}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4 text-right">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#151A21] text-gray-300 border border-[rgba(255,255,255,0.06)] whitespace-nowrap">
                                                        {product.expansion}
                                                    </span>
                                                </TableCell>

                                                <TableCell className="py-4 text-center">
                                                    <span className="text-sm text-gray-400">{product.releaseYear || '—'}</span>
                                                </TableCell>

                                                <TableCell className="py-4 text-right">
                                                    <div className="font-medium text-gray-200">
                                                        {product.price ? `€${product.price.toLocaleString('en-IE', { minimumFractionDigits: 2 })}` : '—'}
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4 text-right">
                                                    <div className={`text-sm font-medium ${change30D >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {change30D > 0 ? '+' : ''}{change30D.toFixed(1)}%
                                                    </div>
                                                </TableCell>

                                                <TableCell className="py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <span className="text-sm font-medium text-gray-300">{score}/100</span>
                                                        <div className="w-12 h-1.5 rounded-full bg-[#151A21] overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${score}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="px-4 pb-3 shrink-0">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            totalItems={totalItems}
                            pageSize={PAGE_SIZE}
                        />
                    </div>
                </Card>
            </div>
        </div >

    );
}

