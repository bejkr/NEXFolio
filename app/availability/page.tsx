import React from 'react';
import { ShoppingCart, PackageOpen, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const metadata = {
    title: 'Availability | Nexfolio',
    description: 'Track market inventory and availability alerts',
};

export default function AvailabilityPage() {
    return (
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <ShoppingCart className="w-7 h-7 text-primary" />
                        Market Availability
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">
                        Monitor product inventory levels, restock alerts, and live market supply.
                    </p>
                </div>
                <div className="text-sm text-gray-500 hidden sm:block">
                    Last updated: <span className="text-gray-300 font-medium">Just now</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'High Liquidity Assets', value: '42', desc: 'Readily available on secondary market', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Low Supply Warning', value: '14', desc: 'Items nearing zero market velocity', icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                    { label: 'Tracked Distributors', value: '8', desc: 'Active B2B connections', icon: PackageOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
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

            <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden flex flex-col h-[400px]">
                <div className="p-5 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Live Tracking Setup</h3>
                    <button className="px-4 py-2 bg-primary hover:bg-emerald-500 text-[#0E1116] text-sm font-semibold rounded-md transition-colors shadow-[0_0_15px_rgba(0,229,153,0.3)]">
                        Add Tracker
                    </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
                    {/* Background design elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="w-16 h-16 bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-full flex items-center justify-center mb-6 relative z-10">
                        <PackageOpen className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="text-xl font-medium text-white mb-3 relative z-10">No Active Trackers</h4>
                    <p className="text-sm text-gray-400 max-w-sm mb-6 relative z-10">
                        You are currently not tracking any specific products. Set up a tracker to receive instant alerts when inventory hits your target store or price point.
                    </p>
                </div>
            </div>
        </div>
    );
}
