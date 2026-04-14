'use client';

import { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, Search, Layers, Database, BarChart3, Package } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import Link from 'next/link';

export const InsightsSection: React.FC = () => {
    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <ScrollReveal delay={0.1} direction="up" height="100%">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00E599]/30 transition-all h-full">
                            <Lightbulb className="w-10 h-10 text-[#00E599] mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">See what's rising</h3>
                            <p className="text-gray-400">Our market pulse tracks price trends across thousands of items. Spot the next big mover before it peaks.</p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2} direction="up" height="100%">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00E599]/30 transition-all h-full">
                            <TrendingUp className="w-10 h-10 text-[#00E599] mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">Make better decisions</h3>
                            <p className="text-gray-400">Buy low, sell high. Use historical data and market liquidity scores to time your entries and exits.</p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.3} direction="up" height="100%">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00E599]/30 transition-all h-full">
                            <Search className="w-10 h-10 text-[#00E599] mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">Understand value</h3>
                            <p className="text-gray-400">Nexfolio calculates your true net worth based on real-time market data, not just MSRP.</p>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

interface Stats {
    products: number;
    pricePoints: number;
    expansions: number;
}

function fmt(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
    return `${n}+`;
}

export const SocialProof: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch('/api/public/stats')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setStats(data); })
            .catch(() => {});
    }, []);

    const statItems = [
        {
            icon: <Package className="w-5 h-5" />,
            value: stats ? fmt(stats.products) : '—',
            label: 'Products tracked',
        },
        {
            icon: <Layers className="w-5 h-5" />,
            value: stats ? fmt(stats.expansions) : '—',
            label: 'Sets & expansions',
        },
        {
            icon: <Database className="w-5 h-5" />,
            value: stats ? fmt(stats.pricePoints) : '—',
            label: 'Price data points',
        },
        {
            icon: <BarChart3 className="w-5 h-5" />,
            value: '30D + 12M',
            label: 'History per product',
        },
    ];

    return (
        <section className="py-24">
            <div className="container mx-auto px-6">

                {/* Stats row */}
                <ScrollReveal delay={0.1}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
                        {statItems.map((s, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5"
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center mb-4">
                                    {s.icon}
                                </div>
                                <p className="text-3xl md:text-4xl font-extrabold text-white mb-1 tabular-nums">
                                    {s.value}
                                </p>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">
                                    {s.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>

                {/* Early access block instead of fake testimonials */}
                <ScrollReveal delay={0.2} direction="up">
                    <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-[#151A21] to-[#0E1116] border border-[#00E599]/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,229,153,0.06),transparent_70%)] pointer-events-none" />

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#00E599]/10 border border-[#00E599]/20 text-[#00E599] text-xs font-bold uppercase tracking-wider mb-6">
                                Early Access
                            </span>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Be among the first.
                            </h3>
                            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                                Nexfolio is actively growing its database and feature set. Early users shape the product — your feedback directly influences what gets built next.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/register"
                                    className="px-8 py-3.5 rounded-full bg-[#00E599] text-[#0E1116] font-bold hover:bg-[#00c885] transition-colors"
                                >
                                    Get early access
                                </Link>
                                <Link
                                    href="#features"
                                    className="px-8 py-3.5 rounded-full border border-white/10 text-gray-300 font-medium hover:border-white/30 hover:text-white transition-colors"
                                >
                                    See what's included
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

            </div>
        </section>
    );
};
