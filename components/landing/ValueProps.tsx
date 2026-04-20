'use client';

import React from 'react';
import { ShieldAlert, RefreshCw, BarChart2, Compass } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const items = [
    {
        icon: ShieldAlert,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        glow: 'rgba(239,68,68,0.06)',
        title: 'Avoid bad buys',
        desc: 'Identify overpriced assets and weak market trends before purchasing.',
    },
    {
        icon: RefreshCw,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        glow: 'rgba(245,158,11,0.06)',
        title: 'Detect reprint risk',
        desc: 'Stay ahead of restocks and market dilution signals.',
        soon: true,
    },
    {
        icon: BarChart2,
        color: 'text-[#00E599]',
        bg: 'bg-[#00E599]/10',
        border: 'border-[#00E599]/20',
        glow: 'rgba(0,229,153,0.06)',
        title: 'Track real portfolio performance',
        desc: 'Measure returns, allocation and long-term growth.',
    },
    {
        icon: Compass,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        glow: 'rgba(96,165,250,0.06)',
        title: 'Discover stronger assets',
        desc: 'Find products with better momentum, liquidity and upside.',
    },
];

export const ValueProps: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">

                {/* Headline */}
                <div className="text-center mb-16">
                    <ScrollReveal delay={0.05}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                            More than tracking.{' '}
                            <span className="text-[#00E599]">Better decisions.</span>
                        </h2>
                    </ScrollReveal>
                </div>

                {/* 4-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                    {items.map(({ icon: Icon, color, bg, border, glow, title, desc, soon }, i) => (
                        <ScrollReveal key={title} delay={0.1 + i * 0.08} direction="up">
                            <div className="h-full rounded-2xl bg-gradient-to-b from-[#151A21] to-[#0E1116] p-6 flex flex-col gap-4 group transition-all duration-300 relative overflow-hidden">
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at top left, ${glow}, transparent 65%)` }}
                                />
                                <div className="flex items-start justify-between">
                                    <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 scale-110`}>
                                        <Icon className={`w-5 h-5 ${color}`} />
                                    </div>
                                    {soon && (
                                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                                            Coming soon
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-white mb-1.5">{title}</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

            </div>
        </section>
    );
};
