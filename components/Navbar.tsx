'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Menu, Package, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationDropdown } from './NotificationDropdown';

interface SearchResult {
    products: { id: string; name: string; expansion: string; category: string; price: number | null; imageUrl: string | null }[];
    collection: { id: string; name: string; set: string; category: string; currentValue: number; imageUrl: string | null }[];
}

export function Navbar() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult>({ products: [], collection: [] });
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) { setResults({ products: [], collection: [] }); setOpen(false); return; }
        const id = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
                setOpen(true);
            } finally {
                setLoading(false);
            }
        }, 250);
        return () => clearTimeout(id);
    }, [query]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Keyboard shortcut: Ctrl+K / Cmd+K
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const handleSelect = (href: string) => {
        setOpen(false);
        setQuery('');
        router.push(href);
    };

    const hasResults = results.products.length > 0 || results.collection.length > 0;

    return (
        <header className="h-16 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-6 bg-[#0E1116] shrink-0">
            <div className="flex items-center flex-1">
                <button
                    className="lg:hidden text-gray-400 hover:text-white mr-4"
                    onClick={() => window.dispatchEvent(new Event('open-mobile-nav'))}
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Search */}
                <div className="max-w-md w-full relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none z-10" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onFocus={() => query.length >= 2 && setOpen(true)}
                        placeholder="Search assets…"
                        className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md pl-10 pr-16 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                    {query ? (
                        <button
                            onClick={() => { setQuery(''); setOpen(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    ) : (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 font-mono border border-[rgba(255,255,255,0.08)] rounded px-1 py-0.5 hidden md:inline">
                            ⌘K
                        </span>
                    )}

                    {/* Dropdown */}
                    {open && (
                        <div
                            ref={dropdownRef}
                            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[#151A21] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            {loading && (
                                <div className="px-4 py-3 text-xs text-gray-500">Searching…</div>
                            )}

                            {!loading && !hasResults && (
                                <div className="px-4 py-4 text-sm text-gray-500 text-center">No results for "{query}"</div>
                            )}

                            {!loading && results.products.length > 0 && (
                                <div>
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Products DB</p>
                                    {results.products.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => handleSelect(`/products/db_${p.id}`)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-md bg-[#0E1116] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                {p.imageUrl ? (
                                                    <img src={`/api/proxy-image?url=${encodeURIComponent(p.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-4 h-4 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-200 truncate">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.expansion} · {p.category}</p>
                                            </div>
                                            {p.price != null && (
                                                <span className="text-sm font-medium text-gray-300 shrink-0">€{p.price.toFixed(2)}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!loading && results.collection.length > 0 && (
                                <div className={results.products.length > 0 ? 'border-t border-white/5' : ''}>
                                    <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">My Collection</p>
                                    {results.collection.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => handleSelect('/collection')}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
                                        >
                                            <div className="w-8 h-8 rounded-md bg-[#0E1116] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                {c.imageUrl ? (
                                                    <img src={`/api/proxy-image?url=${encodeURIComponent(c.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Package className="w-4 h-4 text-gray-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-200 truncate">{c.name}</p>
                                                <p className="text-xs text-gray-500">{c.set} · {c.category}</p>
                                            </div>
                                            <span className="text-sm font-medium text-gray-300 shrink-0">€{c.currentValue.toFixed(2)}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {hasResults && (
                                <div className="border-t border-white/5 px-4 py-2.5">
                                    <button
                                        onClick={() => handleSelect(`/products?q=${encodeURIComponent(query)}`)}
                                        className="text-xs text-primary hover:underline"
                                    >
                                        See all results in Products Screener →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <Link href="/dashboard/profile">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-[#008055] border border-[rgba(0,229,153,0.3)] shadow-[0_0_10px_rgba(0,229,153,0.2)] cursor-pointer hover:scale-110 active:scale-95 transition-all"></div>
                </Link>
            </div>
        </header>
    );
}
