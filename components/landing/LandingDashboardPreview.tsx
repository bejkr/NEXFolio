'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { landingPerformanceData, landingPortfolioSummary } from './LandingMockData';
import { TrendingUp, Wallet, PieChart as PieChartIcon } from 'lucide-react';

export const LandingDashboardPreview: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-16 relative group animate-float">
      {/* Decorative Glow */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#00E599]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#00E599]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden shadow-2xl premium-glow">
        {/* Top bar (Fake browser/app header) */}
        <div className="h-12 border-b border-white/5 bg-black/20 flex items-center px-6 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <div className="ml-4 h-6 w-32 bg-white/5 rounded-md" />
        </div>

        <div className="p-8">
          <div className="grid grid-cols-12 gap-8">
            {/* Left: Summary Metrics */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
                <div className="space-y-1">
                    <p className="text-gray-400 text-sm font-medium">Portfolio Value</p>
                    <h3 className="text-4xl font-bold text-white">€12,450.85</h3>
                    <div className="flex items-center gap-2 text-[#00E599] text-sm font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        <span>+35.2% (+€3,240.20)</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <Wallet className="w-5 h-5 text-[#00E599] mb-2" />
                        <p className="text-gray-400 text-xs">Total Cost</p>
                        <p className="text-white font-semibold">€9,210.65</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <PieChartIcon className="w-5 h-5 text-[#00E599] mb-2" />
                        <p className="text-gray-400 text-xs">Total Items</p>
                        <p className="text-white font-semibold">142</p>
                    </div>
                </div>
            </div>

            {/* Right: Chart */}
            <div className="col-span-12 lg:col-span-8 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={landingPerformanceData}>
                        <defs>
                            <linearGradient id="colorValueLanding" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00E599" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#00E599" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="month" 
                            hide 
                        />
                        <YAxis 
                            hide 
                            domain={['dataMin - 1000', 'dataMax + 1000']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#00E599" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorValueLanding)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
