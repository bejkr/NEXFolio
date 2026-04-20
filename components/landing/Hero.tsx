'use client';

import React, { useEffect, useState } from 'react';
import { PremiumButton } from './PremiumButton';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

interface Product {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
}

function ProductCard({ p }: { p: Product | null }) {
    return (
        <div className="w-full h-[138px] rounded-xl bg-[#151A21] border border-[rgba(255,255,255,0.06)] overflow-hidden flex items-center justify-center p-2 relative group hover:border-white/20 transition-colors duration-300">
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
        <div className="relative h-[480px] overflow-hidden w-full">

            {/* Columns */}
            <div className="flex gap-4 h-full items-start pt-4 px-2 w-full">
                {columns.map((col, ci) => (
                    <div
                        key={ci}
                        className={`flex flex-col gap-4 flex-1 min-w-0 ${col.yOffset}`}
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
    const { t } = useLanguage();
    return (
        <section className="relative pt-28 pb-12 overflow-hidden">
            {/* Background radial gradient */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,153,0.07)_0%,transparent_60%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                {/* Two-column: text left, grid right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

                    {/* Left — text */}
                    <div className="flex flex-col items-start">


                        <ScrollReveal delay={0.2}>
                            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.08]">
                                {t('hero_title1')}{' '}
                                <span className="text-[#00E599]">{t('hero_title2')}</span>
                            </h1>
                        </ScrollReveal>

                        <ScrollReveal delay={0.3}>
                            <p className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed">
                                {t('hero_subtitle')}
                            </p>
                        </ScrollReveal>

                        <ScrollReveal delay={0.4}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <PremiumButton href="/register">
                                    {t('hero_cta')}
                                </PremiumButton>
                                <p className="text-gray-500 text-sm font-medium">
                                    {t('hero_noCreditCard')}
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right — floating product grid */}
                    <ScrollReveal delay={0.3} direction="left">
                        <FloatingProductGrid />
                    </ScrollReveal>
                </div>

            </div>

            {/* Dashboard screenshot preview */}
            <ScrollReveal delay={0.5} direction="up">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.06)] shadow-[0_0_80px_rgba(0,229,153,0.08)]">
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1F28] border-b border-white/8">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <div className="flex-1 mx-4 bg-white/5 rounded-md px-3 py-1 text-[11px] text-gray-500 font-mono">
                                app.nexfolio.io/dashboard
                            </div>
                        </div>
                        <img
                            src="/dashboard-preview.jpg"
                            alt="Nexfolio dashboard preview"
                            className="w-full block"
                        />
                    </div>
                </div>
            </ScrollReveal>
        </section>
    );
};
