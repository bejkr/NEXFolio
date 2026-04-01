'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CollectionItem } from '@/lib/mockData';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface CollectionGridProps {
    data: CollectionItem[];
    onDelete?: (id: string) => void;
}

export function CollectionGrid({ data, onDelete }: CollectionGridProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

    const calculateReturn = (current: number, cost: number) => {
        const diff = current - cost;
        const perc = (diff / cost) * 100;
        return { diff, perc };
    };

    if (data.length === 0) {
        return (
            <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)]">
                <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p>No items found matching your criteria.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data.map((item) => {
                const { diff, perc } = calculateReturn(item.currentValue, item.costBasis);
                const isPositive = diff >= 0;
                const returnColor = isPositive ? 'text-[#00E599]' : 'text-[#FF4D4D]';

                return (
                    <Card key={item.id} className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.2)] transition-all overflow-hidden group cursor-pointer flex flex-col h-full">
                        {item.productId ? (
                            <Link href={`/products/${item.productId}`} className="contents">
                                <div className="relative aspect-[3/4] w-full bg-black/40 border-b border-[rgba(255,255,255,0.06)] overflow-hidden flex items-center justify-center">
                                    <img
                                        src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[10px] font-medium text-gray-300">
                                        {item.condition}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="relative aspect-[3/4] w-full bg-black/40 border-b border-[rgba(255,255,255,0.06)] overflow-hidden flex items-center justify-center">
                                <img
                                    src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[10px] font-medium text-gray-300">
                                    {item.condition}
                                </div>
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(item.id);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md text-gray-400 hover:text-red-500 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Delete item"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <CardContent className="p-4 flex flex-col flex-1">
                            {item.productId ? (
                                <Link href={`/products/${item.productId}`} className="block hover:opacity-80 transition-opacity">
                                    <p className="text-xs text-gray-400 mb-1">{item.set}</p>
                                    <h3 className="font-semibold text-gray-200 line-clamp-2 mb-3 flex-1">{item.name}</h3>
                                </Link>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-400 mb-1">{item.set}</p>
                                    <h3 className="font-semibold text-gray-200 line-clamp-2 mb-3 flex-1">{item.name}</h3>
                                </>
                            )}

                            <div className="flex justify-between items-end mt-auto pt-3 border-t border-[rgba(255,255,255,0.06)]">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Market Value</p>
                                    <p className="font-bold tracking-tight text-white">{formatCurrency(item.currentValue)}</p>
                                </div>
                                <div className={`flex flex-col items-end ${returnColor}`}>
                                    <span className="text-sm font-medium">{isPositive ? '+' : ''}{perc.toFixed(2)}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
