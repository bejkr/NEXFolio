'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MarketAsset } from "@/lib/mockData";
import { Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    data: MarketAsset[];
}

export function LiquidityBoard({ data }: Props) {
    const router = useRouter();

    const fmtPct = (v: number | null) =>
        v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

    return (
        <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden">
            <CardHeader className="pb-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <CardTitle className="text-lg font-semibold text-white">Liquidity Board</CardTitle>
                </div>
                <p className="text-sm text-gray-500 mt-1">Most liquid products by active market listings</p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                                <TableHead className="font-medium text-gray-400">Asset</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">Price</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">30D %</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">Listings</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">Liquidity Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow
                                    key={item.id}
                                    onClick={() => router.push(`/products/db_${item.id}`)}
                                    className="border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] group cursor-pointer"
                                >
                                    <TableCell className="py-3">
                                        <span className="font-semibold text-gray-200 block group-hover:text-primary transition-colors truncate max-w-[220px]">
                                            {item.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</span>
                                    </TableCell>
                                    <TableCell className="py-3 text-right text-sm text-gray-300 font-medium">
                                        {item.price != null
                                            ? `€${(item.price as number).toLocaleString('en-IE', { minimumFractionDigits: 2 })}`
                                            : '—'}
                                    </TableCell>
                                    <TableCell className={`py-3 text-right text-sm font-medium ${
                                        item.change30D == null ? 'text-gray-600'
                                        : item.change30D >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {fmtPct(item.change30D)}
                                    </TableCell>
                                    <TableCell className="py-3 text-right text-gray-300 font-medium">
                                        {item.activeListings.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-20 bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-purple-500 h-1.5 rounded-full"
                                                    style={{ width: `${item.liquidityScore}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-400 w-8 text-right">{item.liquidityScore}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
