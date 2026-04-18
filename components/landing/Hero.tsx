'use client';

import React, { useEffect, useState } from 'react';
import { PremiumButton } from './PremiumButton';
import { LandingDashboardPreview } from './LandingDashboardPreview';
import { ScrollReveal } from './ScrollReveal';

interface Product {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
}

function ProductCard({ p }: { p: Product | null }) {
    return (
        <div className="w-[108px] h-[138px] rounded-xl bg-[#151A21] border border-white/8 overflow-hidden flex items-center justify-center p-2 relative group hover:border-white/20 transition-colors duration-300">
            {p ? (
                <>
                    <img
                        src={`/api/proxy-image?url=${encodeURIComponent(p.imageUrl)}`}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                    <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-bold text-[#00E599] leading-none">
                        €{p.price >= 1000 ? `${(p.price / 1000).toFixed(1)}k` : p.price.toFixed(0)}
                    </div>
                </>
            ) : (
                <div className="w-full h-full rounded-lg bg-white/5 animate-pulse" />
            )}
        </div>
    );
}

function FloatingProductGrid() {
    const [products, setProducts] = useState<(Product | null)[]>(Array(9).fill(null));

    useEffect(() => {
        fetch('/api/public/featured-products')
            .then(r => r.ok ? r.json() : [])
            .then((data: Product[]) => {
                if (Array.isArray(data) && data.length >= 9) {
                    setProducts(data.slice(0, 9));
                }
            })
            .catch(() => {});
    }, []);

    const columns = [
        { items: products.slice(0, 3), yOffset: 'translate-y-6',  animDelay: '0s',    dur: '4.2s' },
        { items: products.slice(3, 6), yOffset: 'translate-y-0',  animDelay: '1.1s',  dur: '3.8s' },
        { items: products.slice(6, 9), yOffset: 'translate-y-12', animDelay: '0.5s',  dur: '4.6s' },
    ];

    return (
        <div className="relative h-[480px] overflow-hidden">
            {/* Fade masks */}
            <div className="absolute inset-0 bg-gradient-to-r  from-transparent to-[#0E1116]    z-10 pointer-events-none w-1/3 left-auto" style={{ left: 'auto', right: 0, width: '30%' }} />
            <div className="absolute inset-0 bg-gradient-to-b  from-[#0E1116]   to-transparent  z-10 pointer-events-none h-16  top-0" />
            <div className="absolute inset-0 bg-gradient-to-t  from-[#0E1116]   to-transparent  z-10 pointer-events-none h-28  bottom-0 top-auto" />

            {/* Columns */}
            <div className="flex gap-4 h-full items-start pt-4 px-2">
                {columns.map((col, ci) => (
                    <div
                        key={ci}
                        className={`flex flex-col gap-4 flex-shrink-0 ${col.yOffset}`}
                        style={{
                            animation: `heroFloat ${col.dur} ease-in-out infinite`,
                            animationDelay: col.animDelay,
                        }}
                    >
                        {col.items.map((p, i) => (
                            <ProductCard key={p?.id ?? `sk-${ci}-${i}`} p={p} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export const Hero: React.FC = () => {
    return (
        <section className="relative pt-28 pb-12 overflow-hidden">
            {/* Background radial gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,153,0.07)_0%,transparent_60%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Two-column: text left, grid right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

                    {/* Left — text */}
                    <div className="flex flex-col items-start">
                        <ScrollReveal delay={0.1}>
                            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#00E599]/10 border border-[#00E599]/20 text-[#00E599] text-sm font-semibold tracking-wide uppercase">
                                Track Your Collection Like a Pro
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.2}>
                            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.08]">
                                Master your{' '}
                                <span className="text-[#00E599]">Portfolio Value</span>
                            </h1>
                        </ScrollReveal>

                        <ScrollReveal delay={0.3}>
                            <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                                Automated tracking for your TCG, sealed products, and graded cards.
                                Stop manual spreadsheets and start making data-driven decisions.
                            </p>
                        </ScrollReveal>

                        <ScrollReveal delay={0.4}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <PremiumButton href="/register">
                                    Start for free
                                </PremiumButton>
                                <p className="text-gray-500 text-sm font-medium">
                                    No credit card required
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right — floating product grid */}
                    <ScrollReveal delay={0.3} direction="left">
                        <FloatingProductGrid />
                    </ScrollReveal>
                </div>

                {/* Dashboard preview below */}
                <ScrollReveal delay={0.5} direction="up">
                    <LandingDashboardPreview />
                </ScrollReveal>
            </div>
        </section>
    );
};
