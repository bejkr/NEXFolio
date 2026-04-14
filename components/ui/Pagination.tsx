'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    pageSize?: number;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');

    pages.push(total);
    return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: Props) {
    if (totalPages <= 1) return null;

    const pages = getPageNumbers(currentPage, totalPages);

    const from = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
    const to   = pageSize && totalItems ? Math.min(currentPage * pageSize, totalItems) : undefined;

    return (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
            {/* Item count */}
            <p className="text-xs text-gray-500">
                {from !== undefined && to !== undefined && totalItems !== undefined
                    ? `Showing ${from}–${to} of ${totalItems}`
                    : `Page ${currentPage} of ${totalPages}`}
            </p>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm select-none">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
                                p === currentPage
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
