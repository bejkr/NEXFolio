import { Lightbulb, TrendingUp, Search, Quote } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const InsightsSection: React.FC = () => {
    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <ScrollReveal delay={0.1} direction="up" height="100%">
                        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00E599]/30 transition-all h-full">
                            <Lightbulb className="w-10 h-10 text-[#00E599] mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">See what’s rising</h3>
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
                            <p className="text-gray-400">NexFolio calculates your true net worth based on real-time market data, not just MSRP.</p>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

export const SocialProof: React.FC = () => {
    const stats = [
        { label: "Portfolios Tracked", value: "12,400+" },
        { label: "Items in Database", value: "850k+" },
        { label: "Monthly Value Tracked", value: "€45M+" },
        { label: "Market Accuracy", value: "99.8%" }
    ];

    const testimonials = [
        { name: "Marek S.", role: "TCG Collector", quote: "NexFolio completely changed how I track my Pokémon collection. No more messy spreadsheets!" },
        { name: "Jakub K.", role: "Market Analyst", quote: "The price sync and historical data are game-changers for any serious investor." }
    ];

    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 text-center">
                    {stats.map((stat, i) => (
                        <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                            <p className="text-4xl md:text-5xl font-extrabold text-[#00E599] mb-2">{stat.value}</p>
                            <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {testimonials.map((t, i) => (
                        <ScrollReveal key={i} delay={0.4 + (i * 0.2)} direction={i === 0 ? "right" : "left"} height="100%">
                            <div className="p-10 rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/5 relative overflow-hidden group h-full">
                                <Quote className="absolute -top-4 -right-4 w-24 h-24 text-[#00E599]/5 group-hover:text-[#00E599]/10 transition-all" />
                                <p className="text-xl text-gray-300 italic mb-8 relative z-10 leading-relaxed">"{t.quote}"</p>
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-full bg-[#00E599]/20 flex items-center justify-center text-[#00E599] font-bold text-lg">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{t.name}</p>
                                        <p className="text-gray-500 text-sm whitespace-nowrap">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
