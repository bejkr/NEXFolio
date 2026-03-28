'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TopMover } from '@/lib/mockData';
import { ChevronRight } from 'lucide-react';

interface TopMoversTableProps {
    data: TopMover[];
}

export function TopMoversTable({ data }: TopMoversTableProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

    const formatPercent = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${val.toFixed(2)}%`;
    };

    const getPercentColor = (val: number) => {
        return val >= 0 ? 'text-success-text' : 'text-danger-text';
    };

    // Only take top 5
    const topData = data.slice(0, 5);

    return (
        <Card className="col-span-1 lg:col-span-3 h-full flex flex-col">
            <CardHeader>
                <CardTitle>Top Movers</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Card / Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Current Value</TableHead>
                            <TableHead className="text-right">30D %</TableHead>
                            <TableHead className="text-right">12M %</TableHead>
                            <TableHead className="text-right">Liquidity</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topData.map((item) => (
                            <TableRow key={item.id} className="cursor-pointer group">
                                <TableCell className="font-medium text-gray-200 group-hover:text-white transition-colors">{item.name}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded bg-white/[0.04] border border-white/5 px-2 py-0.5 text-xs font-medium text-gray-400">
                                        {item.category}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right text-gray-200">{formatCurrency(item.currentValue)}</TableCell>
                                <TableCell className={`text-right font-medium ${getPercentColor(item.change30D)}`}>
                                    {formatPercent(item.change30D)}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${getPercentColor(item.change12M)}`}>
                                    {formatPercent(item.change12M)}
                                </TableCell>
                                <TableCell className="text-right text-gray-400">{item.liquidityScore}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
                <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors w-full justify-center py-2 h-full">
                    [ View Full Collection ] <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </CardFooter>
        </Card>
    );
}
