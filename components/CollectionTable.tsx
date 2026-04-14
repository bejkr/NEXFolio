'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CollectionItem } from '@/lib/mockData';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

interface CollectionTableProps {
    data: CollectionItem[];
    onDelete?: (id: string) => void;
}

export function CollectionTable({ data, onDelete }: CollectionTableProps) {
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
        <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden">
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-[#151A21]">
                            <TableRow className="border-b border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                                <TableHead className="text-gray-400 font-medium py-4 pl-4">Card / Product</TableHead>
                                <TableHead className="text-gray-400 font-medium">Set / Expansion</TableHead>
                                <TableHead className="text-gray-400 font-medium text-center">Quantity</TableHead>
                                <TableHead className="text-right text-gray-400 font-medium">Cost Basis</TableHead>
                                <TableHead className="text-right text-gray-400 font-medium">Market Value</TableHead>
                                <TableHead className="text-right text-gray-400 font-medium">Total Return</TableHead>
                                <TableHead className="text-center text-gray-400 font-medium">Score</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => {
                                const qty = item.quantity || 1;
                                const { diff, perc } = calculateReturn(item.currentValue * qty, item.costBasis * qty);
                                const isPositive = diff >= 0;
                                const returnColor = isPositive ? '!text-[#00E599]' : '!text-[#FF4D4D]';

                                return (
                                    <TableRow key={item.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="py-4 pl-4 group-hover:text-white transition-colors">
                                            {item.productId ? (
                                                <Link href={`/products/${item.productId}`} className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                                                    <div className="w-14 h-20 rounded overflow-hidden bg-black/40 border border-white/5 flex-shrink-0 flex items-center justify-center">
                                                            <img
                                                                src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain p-0.5"
                                                            />
                                                    </div>
                                                    <span className="font-semibold text-gray-200">{item.name}</span>
                                                </Link>
                                            ) : (
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-20 rounded overflow-hidden bg-black/40 border border-white/5 flex-shrink-0 flex items-center justify-center">
                                                        <img
                                                            src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain p-0.5"
                                                        />
                                                    </div>
                                                    <span className="font-semibold text-gray-200">{item.name}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-400">{item.set}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center rounded-md bg-white/[0.04] border border-white/5 px-3 py-1 text-xs font-bold text-gray-200">
                                                {(item as any).quantity || 1}x
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-400 font-medium">
                                            {formatCurrency(item.costBasis)}
                                        </TableCell>
                                        <TableCell className="text-right text-white font-bold tracking-tight">
                                            {formatCurrency(item.currentValue)}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${returnColor}`}>
                                            <div className="flex flex-col items-end">
                                                <span>{isPositive ? '+' : ''}{perc.toFixed(2)}%</span>
                                                <span className="text-xs opacity-70 font-normal">
                                                    {isPositive ? '+' : ''}{formatCurrency(diff)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {item.nexfolioScore != null ? (
                                                <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded text-xs font-bold border ${
                                                    item.nexfolioScore >= 70
                                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                                        : item.nexfolioScore >= 40
                                                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                                        : 'text-red-400 bg-red-500/10 border-red-500/20'
                                                }`}>
                                                    {item.nexfolioScore}
                                                </span>
                                            ) : (
                                                <span className="text-gray-600 text-xs">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <button
                                                onClick={() => onDelete?.(item.id)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all"
                                                title="Delete item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
