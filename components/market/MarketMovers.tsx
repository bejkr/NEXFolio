'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MarketAsset } from "@/lib/mockData";
import { TrendingUp, TrendingDown, Package } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
    gainers: MarketAsset[];
    decliners: MarketAsset[];
}

const fmtPct = (v: number | null) =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;

export function MarketMovers({ gainers, decliners }: Props) {
    const router = useRouter();

    const renderTable = (data: MarketAsset[], isGainers: boolean) => (
        <Table>
            <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-gray-400">Asset</TableHead>
                    <TableHead className="text-xs font-medium text-gray-400 text-right">30D %</TableHead>
                    <TableHead className="text-xs font-medium text-gray-400 text-right">12M %</TableHead>
                    <TableHead className="text-xs font-medium text-gray-400 text-right">Liquidity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="py-8 text-center text-sm text-gray-600">
                            <Package className="w-6 h-6 mx-auto mb-2 opacity-30" />
                            No data yet
                        </td>
                    </tr>
                ) : data.map((item) => {
                    const color30D = isGainers ? 'text-emerald-400' : 'text-red-400';
                    const color12M = item.change12M == null ? 'text-gray-600'
                        : item.change12M >= 0 ? 'text-emerald-400' : 'text-red-400';
                    return (
                        <TableRow
                            key={item.id}
                            onClick={() => router.push(`/products/db_${item.id}`)}
                            className="border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] group cursor-pointer"
                        >
                            <TableCell className="py-3">
                                <span className="font-semibold text-gray-200 block text-sm group-hover:text-primary transition-colors truncate max-w-[200px]">
                                    {item.name}
                                </span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</span>
                            </TableCell>
                            <TableCell className={`py-3 text-right text-sm font-semibold ${color30D}`}>
                                {fmtPct(item.change30D)}
                            </TableCell>
                            <TableCell className={`py-3 text-right text-sm font-medium ${color12M}`}>
                                {fmtPct(item.change12M)}
                            </TableCell>
                            <TableCell className="py-3 text-right">
                                <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                    {item.liquidityScore}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)]">
                <CardHeader className="pb-2 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <CardTitle className="text-lg font-semibold text-white">Top Gainers (30D)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">{renderTable(gainers, true)}</div>
                </CardContent>
            </Card>

            <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)]">
                <CardHeader className="pb-2 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center space-x-2">
                        <TrendingDown className="w-5 h-5 text-red-400" />
                        <CardTitle className="text-lg font-semibold text-white">Top Decliners (30D)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">{renderTable(decliners, false)}</div>
                </CardContent>
            </Card>
        </div>
    );
}
