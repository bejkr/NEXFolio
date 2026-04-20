'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, Search } from "lucide-react";

export function MarketFilters() {
    return (
        <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] h-full">
            <CardHeader className="pb-4 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <CardTitle className="text-lg font-semibold text-white">Filters</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Search Asset</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Charizard, Evolving Skies..."
                            className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md pl-9 pr-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
                    <div className="space-y-2">
                        {['Sealed'].map((category) => (
                            <label key={category} className="flex items-center space-x-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-gray-600 bg-[#151A21] group-hover:border-primary transition-colors flex items-center justify-center">
                                    {/* Checkbox active state would go here */}
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Era</label>
                    <select className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-primary transition-colors appearance-none">
                        <option>All Eras</option>
                        <option>Base Era (1996 - 2002)</option>
                        <option>EX Era (2003 - 2007)</option>
                        <option>Modern (2018 - 2023)</option>
                        <option>Special Sets</option>
                    </select>
                </div>

                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Min. Liquidity Score</label>
                    <input type="range" className="w-full accent-primary" min="0" max="100" defaultValue="50" />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>0</span>
                        <span>100</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
