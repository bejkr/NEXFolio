'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Zap } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { plans } from '@/lib/pricing';
import { useLanguage } from '@/context/LanguageContext';

export const Pricing: React.FC = () => {
    const [annual, setAnnual] = useState(false);
    const { t } = useLanguage();

    return (
        <section id="pricing" className="py-28 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E599]/4 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                <div className="text-center mb-16">
                    <ScrollReveal delay={0.1}>
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5">
                            {t('pricing_badge')}
                        </span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.15}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t('pricing_title1')} <span className="text-[#00E599]">{t('pricing_title2')}</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-8">
                            {t('pricing_subtitle')}
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={0.25}>
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1">
                            <button
                                onClick={() => setAnnual(false)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? 'bg-white text-[#0E1116]' : 'text-gray-400 hover:text-white'}`}
                            >
                                {t('pricing_monthly')}
                            </button>
                            <button
                                onClick={() => setAnnual(true)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${annual ? 'bg-white text-[#0E1116]' : 'text-gray-400 hover:text-white'}`}
                            >
                                {t('pricing_annual')}
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${annual ? 'bg-[#00E599] text-[#0E1116]' : 'bg-[#00E599]/20 text-[#00E599]'}`}>
                                    −25%
                                </span>
                            </button>
                        </div>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
                    {plans.map((plan, i) => {
                        const price = annual ? plan.annualPrice : plan.monthlyPrice;
                        return (
                            <ScrollReveal key={plan.id} delay={0.3 + i * 0.1} direction="up" height="100%">
                                <div className={`relative flex flex-col h-full rounded-2xl border p-8 transition-all duration-300 ${
                                    plan.highlighted
                                        ? 'bg-[#00E599]/5 border-[#00E599]/40 shadow-[0_0_40px_rgba(0,229,153,0.08)]'
                                        : 'bg-white/[0.02] border-[rgba(255,255,255,0.06)] hover:border-white/15'
                                }`}>
                                    {plan.badge && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E599] text-[#0E1116] text-[11px] font-bold uppercase tracking-wide">
                                                <Zap className="w-3 h-3" />
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">{plan.description}</p>
                                    </div>

                                    <div className="mb-8">
                                        <div className="flex items-end gap-1">
                                            <span className="text-4xl font-extrabold text-white">
                                                {price === 0 ? 'Free' : `€${price}`}
                                            </span>
                                            {price > 0 && <span className="text-gray-500 text-sm mb-1.5">/mo</span>}
                                        </div>
                                        {price > 0 && annual && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('pricing_billed').replace('{amount}', String(plan.annualPrice * 12))}
                                            </p>
                                        )}
                                        {price > 0 && !annual && (
                                            <p className="text-xs text-[#00E599] mt-1">
                                                {t('pricing_save').replace('{amount}', String((plan.monthlyPrice - plan.annualPrice) * 12))}
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href={plan.href}
                                        className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all mb-8 ${
                                            plan.highlighted
                                                ? 'bg-[#00E599] text-[#0E1116] hover:bg-[#00c885]'
                                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>

                                    <ul className="space-y-3 flex-1">
                                        {plan.features.map((f, fi) => (
                                            <li key={fi} className="flex items-start gap-3 text-sm">
                                                {f.included ? (
                                                    <Check className="w-4 h-4 text-[#00E599] shrink-0 mt-0.5" />
                                                ) : (
                                                    <X className="w-4 h-4 text-white/15 shrink-0 mt-0.5" />
                                                )}
                                                <span className={f.included ? 'text-gray-300' : 'text-gray-600'}>
                                                    {f.text}
                                                    {f.note && (
                                                        <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                            {f.note}
                                                        </span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </ScrollReveal>
                        );
                    })}
                </div>

                <ScrollReveal delay={0.6}>
                    <p className="text-center text-sm text-gray-500">
                        {t('pricing_comparison')}{' '}
                        <Link href="/pricing" className="text-[#00E599] hover:underline font-medium">
                            {t('pricing_detailedLink')}
                        </Link>
                    </p>
                </ScrollReveal>
            </div>
        </section>
    );
};
