import React from 'react';
import { ShoppingCart, PackageOpen, AlertTriangle, CheckCircle2, TrendingUp, Info } from 'lucide-react';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { AvailabilityTable } from '@/components/AvailabilityTable';

export const metadata = {
    title: 'Availability | Nexfolio',
    description: 'Track market inventory and availability alerts',
};

export const dynamic = 'force-dynamic';

export default async function AvailabilityPage() {
    const [highLiquidityCount, lowSupplyCount, totalTracked, lastSync] = await Promise.all([
        prisma.product.count({ where: { availabilityCount: { gt: 100 } } }),
        prisma.product.count({ where: { availabilityCount: { lt: 20, not: null } } }),
        prisma.product.count({ where: { availabilityCount: { not: null } } }),
        prisma.product.findFirst({
            where: { lastPriceSync: { not: null } },
            orderBy: { lastPriceSync: 'desc' },
            select: { lastPriceSync: true }
        }),
    ]);

    const stats = [
        {
            label: 'High Liquidity Assets',
            value: highLiquidityCount.toLocaleString(),
            desc: 'Products with > 100 market listings',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
        },
        {
            label: 'Low Supply Warning',
            value: lowSupplyCount.toLocaleString(),
            desc: 'Items with < 20 listings',
            icon: AlertTriangle,
            color: 'text-yellow-400',
            bg: 'bg-yellow-500/10',
        },
        {
            label: 'Market Coverage',
            value: totalTracked.toLocaleString(),
            desc: 'Products with live inventory tracking',
            icon: PackageOpen,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
        },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                        Market Availability
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Monitor product inventory levels and live market supply from Cardmarket.
                    </p>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block shrink-0">
                    Last sync:{' '}
                    <span className="text-gray-300 font-medium">
                        {lastSync?.lastPriceSync
                            ? formatDistanceToNow(lastSync.lastPriceSync, { addSuffix: true })
                            : 'Never'}
                    </span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 hover:border-primary/30 transition-colors"
                    >
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

            {/* Interactive table (client component) */}
            <AvailabilityTable />

            {/* Info panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-5 h-5 text-primary shrink-0" />
                        <h3 className="font-semibold text-white">Investment Opportunity</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                        Low supply items with stable or rising price trends often precede a market price correction.
                        Nexfolio monitors these delta signals to give you a head start.
                    </p>
                </div>
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Info className="w-5 h-5 text-yellow-400 shrink-0" />
                        <h3 className="font-semibold text-white">How Liquidity Works</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                        Liquidity is measured by active listings on Cardmarket. High liquidity (100+) means you can
                        easily exit a position. Low liquidity (&lt;20) indicates high scarcity where individual sales
                        can significantly move the market.
                    </p>
                </div>
            </div>
        </div>
    );
}
