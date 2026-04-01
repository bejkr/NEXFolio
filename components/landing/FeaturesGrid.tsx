import { Target, TrendingUp, Bell, Zap, BarChart3, Globe } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const FeaturesGrid: React.FC = () => {
    const features = [
        {
            title: "Portfolio Tracking",
            description: "Real-time value of your entire collection across raw, graded, and sealed products.",
            icon: <Target className="w-6 h-6 text-[#00E599]" />,
            className: "md:col-span-2 md:row-span-2 bg-[#151A21]/50 backdrop-blur-sm",
            image: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=400&h=300&auto=format&fit=crop"
        },
        {
            title: "Price History",
            description: "Detailed charts showing historical performance and market trends.",
            icon: <TrendingUp className="w-6 h-6 text-[#00E599]" />,
            className: "md:col-span-1 md:row-span-1 bg-[#1A1F26]/50 backdrop-blur-sm",
        },
        {
            title: "Smart Alerts",
            description: "Get notified when prices hit your target or new items appear.",
            icon: <Bell className="w-6 h-6 text-[#00E599]" />,
            className: "md:col-span-1 md:row-span-1 bg-[#1A1F26]/50 backdrop-blur-sm",
        },
        {
            title: "Trending Markets",
            description: "See what's rising in the market and uncover hidden gems before they explode.",
            icon: <Zap className="w-6 h-6 text-[#00E599]" />,
            className: "md:col-span-2 md:row-span-1 bg-[#00E599]/5",
        }
    ];

    return (
        <section id="features" className="py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <ScrollReveal delay={0.1}>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Powerful features for <br />
                            <span className="text-[#00E599]">serious collectors.</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Everything you need to manage your inventory and maximize your portfolio's growth.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 max-w-7xl mx-auto">
                    {features.map((feature, i) => (
                        <ScrollReveal 
                            key={i} 
                            delay={0.3 + (i * 0.1)} 
                            direction="up" 
                            className={feature.className}
                            height="100%"
                        >
                            <div 
                                className={`
                                    p-8 rounded-3xl border border-white/5 
                                    group hover:border-[#00E599]/30 transition-all duration-500 
                                    shine-effect flex flex-col justify-between overflow-hidden h-full
                                `}
                            >
                                <div>
                                    <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>

                                {feature.image && (
                                    <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
                                        <img src={feature.image} alt={feature.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-700" />
                                    </div>
                                )}
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
