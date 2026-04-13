'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MarketAsset } from "@/lib/mockData";
import { Activity } from "lucide-react";

interface Props {
    data: MarketAsset[];
}

export function LiquidityBoard({ data }: Props) {
    return (
        <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden">
            <CardHeader className="pb-4 border-b border-[rgba(255,255,255,0.06)] flex flex-row items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <CardTitle className="text-lg font-semibold text-white">Liquidity Board</CardTitle>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Research layer indicating market velocity</p>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                                <TableHead className="font-medium text-gray-400">Asset</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">Active Listings</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">7D Sold</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">Sell-Through Rate</TableHead>
                                <TableHead className="font-medium text-gray-400 text-right">Liquidity Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id} className="border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] group">
                                    <TableCell className="py-4">
                                        <span className="font-semibold text-gray-200 block group-hover:text-white transition-colors">{item.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.category}</span>
                                    </TableCell>
                                    <TableCell className="py-4 text-right text-gray-300 font-medium">
                                        {item.activeListings}
                                    </TableCell>
                                    <TableCell className="py-4 text-right text-white font-semibold">
                                        {item.sold7D !== undefined ? item.sold7D : <span className="text-gray-600">—</span>}
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        {item.sellThroughRate !== undefined ? (
                                            <div className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                {item.sellThroughRate}%
                                            </div>
                                        ) : (
                                            <span className="text-gray-600">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4 text-right">
                                        <div className="w-full bg-white/5 rounded-full h-2 mt-2 max-w-[100px] ml-auto">
                                            <div
                                                className="bg-purple-500 h-2 rounded-full"
                                                style={{ width: `${item.liquidityScore}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 mt-1 block">{item.liquidityScore}/100</span>
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
