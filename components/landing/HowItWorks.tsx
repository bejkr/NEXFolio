import React from 'react';
import { Search, PlusCircle, LayoutDashboard, ArrowRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import Link from 'next/link';

const steps = [
    {
        number: '01',
        icon: <Search className="w-6 h-6" />,
        title: 'Find your product',
        description: 'Search our database of 500+ TCG products. Filter by set, category, or price range to find exactly what you own.',
        chips: ['Sealed products', 'Graded cards', 'Raw singles'],
        color: 'from-[#00E599]/20 to-[#00E599]/5',
        border: 'border-[#00E599]/30',
        iconBg: 'bg-[#00E599]/10 text-[#00E599]',
        numColor: 'text-[#00E599]/10',
    },
    {
        number: '02',
        icon: <PlusCircle className="w-6 h-6" />,
        title: 'Add to your portfolio',
        description: 'Log your purchase price, quantity, and date. Nexfolio links your item to live market data automatically.',
        chips: ['Cost basis tracking', 'Quantity support', 'Auto price sync'],
        color: 'from-blue-500/20 to-blue-500/5',
        border: 'border-blue-500/30',
        iconBg: 'bg-blue-500/10 text-blue-400',
        numColor: 'text-blue-500/10',
    },
    {
        number: '03',
        icon: <LayoutDashboard className="w-6 h-6" />,
        title: 'Track & act on insights',
        description: 'Watch your portfolio value update in real time. Get signals when to take profit, spot concentration risks, and monitor price targets.',
        chips: ['P&L reports', 'Portfolio signals', 'Price alerts'],
        color: 'from-violet-500/20 to-violet-500/5',
        border: 'border-violet-500/30',
        iconBg: 'bg-violet-500/10 text-violet-400',
        numColor: 'text-violet-500/10',
    },
];

export const HowItWorks: React.FC = () => {
    return (
        <section className="py-28 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00E599]/4 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-20">
                    <ScrollReveal delay={0.1}>
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5">
                            Simple by design
                        </span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Up and running <span className="text-[#00E599]">in minutes</span>
                        </h2>
                    </ScrollReveal>
                </div>

                {/* Steps */}
                <div className="relative max-w-5xl mx-auto">

                    {/* Connector line (desktop) */}
                    <div className="hidden md:block absolute top-[3.25rem] left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px bg-gradient-to-r from-[#00E599]/30 via-blue-500/30 to-violet-500/30 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <ScrollReveal
                                key={i}
                                delay={0.2 + i * 0.15}
                                direction="up"
                                height="100%"
                            >
                                <div className="relative flex flex-col h-full group">

                                    {/* Step number — background decoration */}
                                    <span className={`absolute -top-2 right-4 text-[7rem] font-black leading-none select-none pointer-events-none ${step.numColor} transition-all duration-500 group-hover:scale-110`}>
                                        {step.number}
                                    </span>

                                    {/* Icon circle */}
                                    <div className={`relative z-10 w-14 h-14 rounded-2xl ${step.iconBg} border ${step.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        {step.icon}
                                    </div>

                                    {/* Card */}
                                    <div className={`relative z-10 flex-1 p-6 rounded-2xl bg-gradient-to-b ${step.color} border ${step.border} backdrop-blur-sm`}>
                                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-5">{step.description}</p>

                                        {/* Feature chips */}
                                        <div className="flex flex-wrap gap-2">
                                            {step.chips.map(chip => (
                                                <span
                                                    key={chip}
                                                    className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400"
                                                >
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>

                {/* CTA under steps */}
                <ScrollReveal delay={0.7} direction="up">
                    <div className="text-center mt-14">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#00E599] text-[#0E1116] font-bold hover:bg-[#00c885] transition-colors text-sm group"
                        >
                            Start tracking for free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};
