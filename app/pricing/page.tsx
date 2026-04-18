'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Zap, ArrowLeft, HelpCircle } from 'lucide-react';
import { plans, comparisonRows } from '@/lib/pricing';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter, CTASection } from '@/components/landing/LandingFooter';

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="bg-[#0E1116] min-h-screen text-[#f3f4f6]">
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#00E599]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <LandingHeader />

            <main className="relative z-10 pt-32 pb-24">
                <div className="container mx-auto px-6">

                    {/* Back link */}
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm mb-12 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to home
                    </Link>

                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5">
                            Pricing
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-5">
                            Choose your plan
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Start tracking for free. Upgrade when your collection grows.
                            No hidden fees, cancel anytime.
                        </p>
                    </div>

                    {/* Billing toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1">
                            <button
                                onClick={() => setAnnual(false)}
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-white text-[#0E1116]' : 'text-gray-400 hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setAnnual(true)}
                                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-white text-[#0E1116]' : 'text-gray-400 hover:text-white'}`}
                            >
                                Annual billing
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${annual ? 'bg-[#00E599] text-[#0E1116]' : 'bg-[#00E599]/20 text-[#00E599]'}`}>
                                    Save 25%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Plan cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-24">
                        {plans.map((plan) => {
                            const price = annual ? plan.annualPrice : plan.monthlyPrice;
                            return (
                                <div
                                    key={plan.id}
                                    className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                                        plan.highlighted
                                            ? 'bg-[#00E599]/5 border-[#00E599]/40 shadow-[0_0_60px_rgba(0,229,153,0.08)]'
                                            : 'bg-white/[0.02] border-white/8'
                                    }`}
                                >
                                    {plan.badge && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E599] text-[#0E1116] text-[11px] font-bold uppercase tracking-wide">
                                                <Zap className="w-3 h-3" />
                                                {plan.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-5">
                                        <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                                        <p className="text-sm text-gray-500">{plan.description}</p>
                                    </div>

                                    <div className="mb-6 pb-6 border-b border-white/5">
                                        <div className="flex items-end gap-1">
                                            <span className="text-5xl font-extrabold text-white tracking-tight">
                                                {price === 0 ? 'Free' : `€${price}`}
                                            </span>
                                            {price > 0 && (
                                                <span className="text-gray-500 text-sm mb-2">/mo</span>
                                            )}
                                        </div>
                                        {price > 0 && (
                                            <p className="text-xs text-gray-500 mt-1.5">
                                                {annual
                                                    ? `Billed €${plan.annualPrice * 12}/year`
                                                    : `€${plan.monthlyPrice}/month, billed monthly`}
                                            </p>
                                        )}
                                        {!annual && price > 0 && (
                                            <p className="text-xs text-[#00E599] mt-1">
                                                Save €{(plan.monthlyPrice - plan.annualPrice) * 12} per year with annual
                                            </p>
                                        )}
                                    </div>

                                    <Link
                                        href={plan.href}
                                        className={`w-full py-3.5 rounded-xl text-sm font-bold text-center transition-all mb-8 ${
                                            plan.highlighted
                                                ? 'bg-[#00E599] text-[#0E1116] hover:bg-[#00c885] shadow-[0_0_20px_rgba(0,229,153,0.3)]'
                                                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        {plan.cta}
                                    </Link>

                                    <ul className="space-y-3.5 flex-1">
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
                            );
                        })}
                    </div>

                    {/* Comparison table */}
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-8 text-center">Full feature comparison</h2>

                        <div className="rounded-2xl border border-white/8 overflow-hidden">
                            {/* Table header */}
                            <div className="grid grid-cols-4 bg-[#151A21] border-b border-white/8">
                                <div className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Feature</div>
                                {plans.map(p => (
                                    <div key={p.id} className={`px-6 py-4 text-sm font-bold text-center ${p.highlighted ? 'text-[#00E599]' : 'text-white'}`}>
                                        {p.name}
                                    </div>
                                ))}
                            </div>

                            {comparisonRows.map((group, gi) => (
                                <div key={gi}>
                                    {/* Category row */}
                                    <div className="grid grid-cols-4 bg-white/[0.015] border-b border-white/5">
                                        <div className="px-6 py-3 col-span-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {group.category}
                                        </div>
                                    </div>
                                    {/* Feature rows */}
                                    {group.features.map((row, ri) => (
                                        <div
                                            key={ri}
                                            className={`grid grid-cols-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors ${ri === group.features.length - 1 && gi === comparisonRows.length - 1 ? 'border-none' : ''}`}
                                        >
                                            <div className="px-6 py-4 text-sm text-gray-400">{row.label}</div>
                                            {[row.free, row.pro, row.premium].map((val, vi) => (
                                                <div key={vi} className="px-6 py-4 text-sm text-center">
                                                    {val === '✓' ? (
                                                        <Check className="w-4 h-4 text-[#00E599] mx-auto" />
                                                    ) : val === '—' ? (
                                                        <span className="text-white/15">—</span>
                                                    ) : (
                                                        <span className={vi === 1 && plans[1].highlighted ? 'text-[#00E599] font-medium' : 'text-gray-300'}>
                                                            {val}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FAQ teaser */}
                    <div className="max-w-2xl mx-auto mt-16 text-center">
                        <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                            <HelpCircle className="w-4 h-4" />
                            <span>Questions? Reach us at </span>
                            <Link href="mailto:hello@nexfolio.com" className="text-[#00E599] hover:underline">
                                hello@nexfolio.com
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <CTASection />
            <LandingFooter />
        </div>
    );
}
