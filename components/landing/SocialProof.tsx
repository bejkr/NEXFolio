'use client';

import { useEffect, useState } from 'react';
import { Layers, Database, BarChart3, Package } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

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
    const { t } = useLanguage();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        fetch('/api/public/stats')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setStats(data); })
            .catch(() => {});
    }, []);

    const statItems = [
        { icon: Package,  value: stats ? fmt(stats.products)    : '—',        label: t('stat_products') },
        { icon: Layers,   value: stats ? fmt(stats.expansions)  : '—',        label: t('stat_expansions') },
        { icon: Database, value: stats ? fmt(stats.pricePoints) : '—',        label: t('stat_pricePoints') },
        { icon: BarChart3,value: '30D + 12M',                                 label: t('stat_history') },
    ];

    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(0,229,153,0.04),transparent_70%)] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Stats bar */}
                <ScrollReveal delay={0.1}>
                    <div className="mb-20 rounded-3xl border border-[rgba(255,255,255,0.06)] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[rgba(255,255,255,0.06)]">
                            {statItems.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <div key={i} className="flex flex-col items-center text-center px-8 py-10 group hover:bg-white/[0.02] transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums tracking-tight leading-none">
                                            {s.value}
                                        </p>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">
                                            {s.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Early access block */}
                <ScrollReveal delay={0.2} direction="up">
                    <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-b from-[#151A21] to-[#0E1116] border border-[#00E599]/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,229,153,0.07),transparent_65%)] pointer-events-none" />
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-[#00E599]/10 border border-[#00E599]/20 text-[#00E599] text-xs font-bold uppercase tracking-wider mb-6">
                                {t('early_badge')}
                            </span>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('early_title')}</h3>
                            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto leading-relaxed">{t('early_desc')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/register" className="px-8 py-3.5 rounded-full bg-[#00E599] text-[#0E1116] font-bold hover:bg-[#00c885] transition-colors">
                                    {t('early_cta1')}
                                </Link>
                                <Link href="#features" className="px-8 py-3.5 rounded-full border border-white/10 text-gray-300 font-medium hover:border-white/30 hover:text-white transition-colors">
                                    {t('early_cta2')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

            </div>
        </section>
    );
};
