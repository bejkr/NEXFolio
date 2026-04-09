'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TopMover } from '@/lib/mockData';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface PortfolioMoversCardsProps {
    data: TopMover[];
}

export function PortfolioMoversCards({ data }: PortfolioMoversCardsProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

    const formatPercent = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${val.toFixed(2)}%`;
    };

    // Only take top movers
    const movers = data.slice(0, 5);

    if (movers.length === 0) return null;

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-[#00E599]" />
                    Portfolio Movers
                </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {movers.map((item) => {
                    const isPositive = item.change30D >= 0;
                    const href = item.productId ? `/products/${item.productId}` : `#`;
                    
                    return (
                        <Link key={item.id} href={href} className="block group">
                            <Card className="bg-white/[0.03] border-white/5 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden cursor-pointer h-full">
                                <CardContent className="!p-0">
                                    <div className="relative aspect-square w-full bg-black/20 overflow-hidden">
                                    {item.imageUrl ? (
                                        <Image 
                                            src={`/api/proxy-image?url=${encodeURIComponent(item.imageUrl)}`} 
                                            alt={item.name}
                                            fill
                                            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700 font-bold text-4xl">
                                            ?
                                        </div>
                                    )}
                                    {/* Badge for percentage change */}
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold flex items-center backdrop-blur-md shadow-lg ${
                                        isPositive 
                                            ? 'bg-success-text/20 text-success-text border border-success-text/30' 
                                            : 'bg-danger-text/20 text-danger-text border border-danger-text/30'
                                    }`}>
                                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                        {formatPercent(item.change30D)}
                                    </div>
                                </div>
                                
                                <div className="p-3 space-y-3">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] uppercase tracking-widest text-[#00E599]/70 font-bold px-1.5 py-0.5 bg-[#00E599]/5 rounded border border-[#00E599]/10">
                                                {item.category}
                                            </span>
                                            <span className="text-sm font-semibold text-white">
                                                {formatCurrency(item.currentValue)}
                                            </span>
                                        </div>
                                        <h4 className="text-base font-semibold text-gray-100 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-white transition-colors">
                                            {item.name}
                                        </h4>
                                    </div>
                                    
                                    <div className="pt-3 flex justify-between items-center border-t border-white/10">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">12M Trend</span>
                                            <span className={`text-xs font-bold mt-0.5 ${item.change12M >= 0 ? 'text-success-text' : 'text-danger-text'}`}>
                                                {formatPercent(item.change12M)}
                                            </span>
                                        </div>
                                        <div className={`p-2 rounded-lg ${isPositive ? 'bg-success-text/5' : 'bg-danger-text/5'}`}>
                                            {isPositive 
                                                ? <TrendingUp className="w-4 h-4 text-success-text" /> 
                                                : <TrendingDown className="w-4 h-4 text-danger-text" />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    );
                })}
            </div>
        </div>
    );
}
