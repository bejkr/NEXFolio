'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { CollectionItem } from '@/lib/mockData';

interface CollectionTableProps {
    data: CollectionItem[];
}

export function CollectionTable({ data }: CollectionTableProps) {
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
                                <TableHead className="text-gray-400 font-medium py-4 pl-6">Card / Product</TableHead>
                                <TableHead className="text-gray-400 font-medium">Set / Expansion</TableHead>
                                <TableHead className="text-gray-400 font-medium">Condition</TableHead>
                                <TableHead className="text-right text-gray-400 font-medium">Cost Basis</TableHead>
                                <TableHead className="text-right text-gray-400 font-medium">Market Value</TableHead>
                                <TableHead className="text-right text-gray-400 font-medium pr-6">Total Return</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => {
                                const { diff, perc } = calculateReturn(item.currentValue, item.costBasis);
                                const isPositive = diff >= 0;
                                const returnColor = isPositive ? 'text-[#00E599]' : 'text-[#FF4D4D]';

                                return (
                                    <TableRow key={item.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] transition-colors group">
                                        <TableCell className="py-4 pl-6 group-hover:text-white transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-14 rounded overflow-hidden bg-black/40 border border-white/5 flex-shrink-0 flex items-center justify-center">
                                                    {/* Using a standard img tag for simplicity with external mock URLs */}
                                                    <img
                                                        src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <span className="font-semibold text-gray-200">{item.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400">{item.set}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-white/[0.04] border border-white/5 px-2.5 py-1 text-xs font-medium text-gray-300">
                                                {item.condition}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-400 font-medium">
                                            {formatCurrency(item.costBasis)}
                                        </TableCell>
                                        <TableCell className="text-right text-white font-bold tracking-tight">
                                            {formatCurrency(item.currentValue)}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium pr-6 ${returnColor}`}>
                                            <div className="flex flex-col items-end">
                                                <span>{isPositive ? '+' : ''}{perc.toFixed(2)}%</span>
                                                <span className="text-xs opacity-70 font-normal">
                                                    {isPositive ? '+' : ''}{formatCurrency(diff)}
                                                </span>
                                            </div>
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
