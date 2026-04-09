import React from 'react';
import { ShoppingCart, PackageOpen, AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Info } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
    title: 'Availability | Nexfolio',
    description: 'Track market inventory and availability alerts',
};

export const dynamic = 'force-dynamic';

export default async function AvailabilityPage() {
    // Fetch stats
    const highLiquidityCount = await prisma.product.count({
        where: { availabilityCount: { gt: 100 } }
    });

    const lowSupplyCount = await prisma.product.count({
        where: { 
            availabilityCount: { 
                lt: 20,
                not: null
            }
        }
    });

    const totalTracked = await prisma.product.count({
        where: { availabilityCount: { not: null } }
    });

    // Fetch products with low availability first
    const items = await prisma.product.findMany({
        where: { availabilityCount: { not: null } },
        orderBy: [
            { availabilityCount: 'asc' },
            { name: 'asc' }
        ],
        take: 20
    });

    const lastSync = await prisma.product.findFirst({
        where: { lastPriceSync: { not: null } },
        orderBy: { lastPriceSync: 'desc' },
        select: { lastPriceSync: true }
    });

    const stats = [
        { label: 'High Liquidity Assets', value: highLiquidityCount.toString(), desc: 'Products with > 100 market listings', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Low Supply Warning', value: lowSupplyCount.toString(), desc: 'Items with < 20 listings remaining', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Market Coverage', value: totalTracked.toString(), desc: 'Products with live inventory tracking', icon: PackageOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                        Market Availability
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Monitor product inventory levels, restock alerts, and live market supply from Cardmarket.
                    </p>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block">
                    Last Global Sync: <span className="text-gray-300 font-medium">
                        {lastSync?.lastPriceSync ? formatDistanceToNow(lastSync.lastPriceSync, { addSuffix: true }) : 'Never'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 shadow-sm group hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-xs text-gray-500">{stat.desc}</p>
                    </div>
                ))}
            </div>

            <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between bg-[#151A21]/30">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Critical Inventory Watch</h3>
                        <p className="text-xs text-gray-500 mt-1">Products with lowest market availability</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-yellow-500">Live Scarcity Detection</span>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    {items.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[rgba(255,255,255,0.06)] bg-[#151A21]/10">
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expansion</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Market Price</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Availability</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {item.imageUrl && (
                                                    <img src={item.imageUrl} alt={item.name} className="w-8 h-8 rounded bg-black/20 object-contain" />
                                                )}
                                                <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">{item.expansion}</td>
                                        <td className="p-4 text-sm text-gray-200 text-right font-mono">
                                            {item.price ? `${item.price.toFixed(2)} €` : 'N/A'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-black/40 border border-[rgba(255,255,255,0.1)]">
                                                <span className={`text-sm font-bold ${(item.availabilityCount ?? 0) < 15 ? 'text-yellow-500' : 'text-primary'}`}>
                                                    {item.availabilityCount}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${(item.availabilityCount ?? 0) < 15 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                                                {(item.availabilityCount ?? 0) < 15 ? 'High Scarcity' : 'Stable'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 relative overflow-hidden">
                            <div className="w-16 h-16 bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-full flex items-center justify-center mb-6 relative z-10">
                                <PackageOpen className="w-8 h-8 text-gray-500" />
                            </div>
                            <h4 className="text-xl font-medium text-white mb-3 relative z-10">No Scarcity Data Yet</h4>
                            <p className="text-sm text-gray-400 max-w-sm mb-6 relative z-10">
                                Run a market sync to populate inventory levels. We'll automatically identify products with limited supply.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-white">Investment Opportunity</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Low supply items with stable or rising price trends often precede a market price correction. Nexfolio monitors these delta signals to give you a head start.
                    </p>
                    <div className="flex gap-2">
                        <div className="h-1 flex-1 bg-primary/20 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[30%]" />
                        </div>
                    </div>
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Info className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-white">How Liquidity Works</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                        Liquidity is measured by the total count of active listings on Cardmarket. High liquidity (100+) means you can easily exit a position. Low liquidity ( {'<'} 20) indicates high scarcity where individual sales can significantly move the market.
                    </p>
                </div>
            </div>
        </div>
    );
}
