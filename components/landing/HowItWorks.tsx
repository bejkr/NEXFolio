'use client';

import React from 'react';
import { Search, PlusCircle, LayoutDashboard, ArrowRight, ChevronRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export const HowItWorks: React.FC = () => {
    const { t } = useLanguage();

    const steps = [
        {
            number: '01',
            icon: <Search className="w-6 h-6" />,
            title: t('hiw_step1_title'),
            description: t('hiw_step1_desc'),
            chips: [t('hiw_step1_chip1'), t('hiw_step1_chip2'), t('hiw_step1_chip3')],
            color: 'from-[#00E599]/20 to-[#00E599]/5',
            border: 'border-[#00E599]/30',
            iconBg: 'bg-[#00E599]/10 text-[#00E599]',
            numColor: 'text-[#00E599]/10',
        },
        {
            number: '02',
            icon: <PlusCircle className="w-6 h-6" />,
            title: t('hiw_step2_title'),
            description: t('hiw_step2_desc'),
            chips: [t('hiw_step2_chip1'), t('hiw_step2_chip2'), t('hiw_step2_chip3')],
            color: 'from-blue-500/20 to-blue-500/5',
            border: 'border-blue-500/30',
            iconBg: 'bg-blue-500/10 text-blue-400',
            numColor: 'text-blue-500/10',
        },
        {
            number: '03',
            icon: <LayoutDashboard className="w-6 h-6" />,
            title: t('hiw_step3_title'),
            description: t('hiw_step3_desc'),
            chips: [t('hiw_step3_chip1'), t('hiw_step3_chip2'), t('hiw_step3_chip3')],
            color: 'from-violet-500/20 to-violet-500/5',
            border: 'border-violet-500/30',
            iconBg: 'bg-violet-500/10 text-violet-400',
            numColor: 'text-violet-500/10',
        },
    ];

    return (
        <section className="py-28 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00E599]/4 rounded-full blur-[140px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-20">
                    <ScrollReveal delay={0.1}>
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5">
                            {t('hiw_badge')}
                        </span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            {t('hiw_title1')} <span className="text-[#00E599]">{t('hiw_title2')}</span>
                        </h2>
                    </ScrollReveal>
                </div>

                {/* Steps */}
                <div className="relative max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-start">
                    {steps.map((step, i) => (
                        <React.Fragment key={i}>
                            <ScrollReveal delay={0.2 + i * 0.15} direction="up" height="100%">
                                <div className="relative flex flex-col h-full group px-2">
                                    <span className={`absolute -top-2 right-4 text-[7rem] font-black leading-none select-none pointer-events-none ${step.numColor} transition-all duration-500 group-hover:scale-110`}>
                                        {step.number}
                                    </span>
                                    <div className={`relative z-10 w-14 h-14 rounded-2xl ${step.iconBg} border ${step.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        {step.icon}
                                    </div>
                                    <div className={`relative z-10 flex-1 p-6 rounded-2xl bg-gradient-to-b ${step.color} border ${step.border} backdrop-blur-sm`}>
                                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-5">{step.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {step.chips.map(chip => (
                                                <span key={chip} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                                                    {chip}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>

                            {i < steps.length - 1 && (
                                <div className="hidden md:flex items-start justify-center pt-[1.625rem] px-1">
                                    <ChevronRight className="w-5 h-5 text-white/15" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    </div>
                </div>

                <ScrollReveal delay={0.7} direction="up">
                    <div className="text-center mt-14">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#00E599] text-[#0E1116] font-bold hover:bg-[#00c885] transition-colors text-sm group"
                        >
                            {t('hiw_cta')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};
