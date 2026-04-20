'use client';

import { Target, TrendingUp, Bell, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useLanguage } from '@/context/LanguageContext';

/* ── Mini mock components ── */

function PortfolioMock() {
    const bars = [40, 55, 45, 70, 60, 85, 75, 90, 80, 100];
    return (
        <div className="mt-6 rounded-2xl bg-black/40 border border-white/5 p-4 select-none">
            <div className="flex items-end justify-between mb-3">
                <div>
                    <p className="text-[11px] text-gray-500">Total value</p>
                    <p className="text-xl font-bold text-white">€24,850</p>
                </div>
                <span className="flex items-center gap-1 text-[#00E599] text-xs font-semibold bg-[#00E599]/10 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> +12.4%
                </span>
            </div>
            <div className="flex items-end gap-1 h-14">
                {bars.map((h, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                            height: `${h}%`,
                            background: i === bars.length - 1
                                ? '#00E599'
                                : `rgba(0,229,153,${0.15 + i * 0.07})`,
                        }}
                    />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                    { label: 'Booster Box', pct: '48%', color: '#00E599' },
                    { label: 'Elite Trainer', pct: '32%', color: '#60a5fa' },
                    { label: 'Display', pct: '20%', color: '#a78bfa' },
                ].map(({ label, pct, color }) => (
                    <div key={label} className="flex flex-col gap-1">
                        <div className="h-1 rounded-full" style={{ background: color }} />
                        <p className="text-[10px] text-gray-500">{label}</p>
                        <p className="text-xs font-semibold text-white">{pct}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PriceHistoryMock() {
    const points = [30, 45, 38, 55, 50, 70, 65, 82, 78, 95];
    const w = 100, h = 60;
    const max = Math.max(...points), min = Math.min(...points);
    const xs = points.map((_, i) => (i / (points.length - 1)) * w);
    const ys = points.map(v => h - ((v - min) / (max - min)) * h * 0.8 - h * 0.1);
    const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
    const fill = `${d} L${w},${h} L0,${h} Z`;

    return (
        <div className="mt-4 rounded-xl bg-black/40 border border-white/5 p-3 select-none">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500">Evolving Skies Box</span>
                <span className="text-[10px] text-[#00E599] font-semibold">+38% / 12M</span>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E599" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00E599" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={fill} fill="url(#chartFill)" />
                <path d={d} fill="none" stroke="#00E599" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

function AlertsMock() {
    const alerts = [
        { name: 'Legends of Arceus', msg: 'Hit target €340', up: true },
        { name: 'Base Set Booster', msg: 'Down 5% today', up: false },
    ];
    return (
        <div className="mt-4 space-y-2 select-none">
            {alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-xl bg-black/40 border border-white/5 px-3 py-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${a.up ? 'bg-[#00E599]/15' : 'bg-red-500/15'}`}>
                        {a.up
                            ? <ArrowUpRight className="w-3.5 h-3.5 text-[#00E599]" />
                            : <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-white truncate">{a.name}</p>
                        <p className="text-[10px] text-gray-500">{a.msg}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TrendingMock() {
    const items = [
        { name: 'Scarlet & Violet 151', chg: '+24%', hot: true },
        { name: 'Evolving Skies Case', chg: '+18%', hot: true },
        { name: 'Hidden Fates ETB', chg: '+11%', hot: false },
        { name: 'Celebrations Bundle', chg: '+9%', hot: false },
    ];
    return (
        <div className="mt-4 grid grid-cols-2 gap-2 select-none">
            {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-black/40 border border-white/5 px-3 py-2">
                    <p className="text-[10px] text-gray-400 truncate mr-2">{item.name}</p>
                    <span className={`text-[10px] font-bold shrink-0 ${item.hot ? 'text-[#00E599]' : 'text-gray-400'}`}>{item.chg}</span>
                </div>
            ))}
        </div>
    );
}

/* ── Main component ── */

export const FeaturesGrid: React.FC = () => {
    const { t } = useLanguage();

    return (
        <section id="features" className="py-28 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#00E599]/4 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <ScrollReveal delay={0.05}>
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-5">
                            {t('nav_features')}
                        </span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            {t('feat_title1')} <br />
                            <span className="text-[#00E599]">{t('feat_title2')}</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            {t('feat_subtitle')}
                        </p>
                    </ScrollReveal>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">

                    {/* 1 — Portfolio Tracking (tall, spans 2 rows on lg) */}
                    <ScrollReveal delay={0.15} direction="up" className="lg:row-span-2" height="100%">
                        <div className="h-full rounded-3xl border border-[#00E599]/30 bg-gradient-to-b from-[#151A21] to-[#0E1116] p-7 flex flex-col group transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,229,153,0.06),transparent_60%)] pointer-events-none" />
                            <div className="w-11 h-11 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Target className="w-5 h-5 text-[#00E599]" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('feat1_title')}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{t('feat1_desc')}</p>
                            <PortfolioMock />
                        </div>
                    </ScrollReveal>

                    {/* 2 — Price History */}
                    <ScrollReveal delay={0.2} direction="up" height="100%">
                        <div className="h-full rounded-3xl border border-blue-500/30 bg-gradient-to-b from-[#151A21] to-[#0E1116] p-7 flex flex-col group transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.05),transparent_60%)] pointer-events-none" />
                            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('feat2_title')}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{t('feat2_desc')}</p>
                            <PriceHistoryMock />
                        </div>
                    </ScrollReveal>

                    {/* 3 — Smart Alerts */}
                    <ScrollReveal delay={0.25} direction="up" height="100%">
                        <div className="h-full rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#151A21] to-[#0E1116] p-7 flex flex-col group transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />
                            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <Bell className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('feat3_title')}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{t('feat3_desc')}</p>
                            <AlertsMock />
                        </div>
                    </ScrollReveal>

                    {/* 4 — Trending Markets (wide, spans 2 cols on lg) */}
                    <ScrollReveal delay={0.3} direction="up" className="lg:col-span-2" height="100%">
                        <div className="h-full rounded-3xl border border-violet-500/30 bg-gradient-to-r from-[#151A21] to-[#0E1116] p-7 flex flex-col group transition-all duration-500 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.06),transparent_60%)] pointer-events-none" />
                            <div className="flex items-start justify-between mb-5">
                                <div className="w-11 h-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Zap className="w-5 h-5 text-violet-400" />
                                </div>
                                <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full uppercase tracking-wide">Live</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{t('feat4_title')}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{t('feat4_desc')}</p>
                            <TrendingMock />
                        </div>
                    </ScrollReveal>

                </div>
            </div>
        </section>
    );
};
