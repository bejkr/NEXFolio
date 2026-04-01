import React from 'react';

export const ProductPreview: React.FC = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-transparent via-[#00E599]/5 to-transparent">
            <div className="container mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
                    See your collection in <br />
                    <span className="text-[#00E599]">high definition.</span>
                </h2>

                <div className="relative max-w-6xl mx-auto">
                    {/* Shadow/Glow effect behind image */}
                    <div className="absolute -inset-4 bg-[#00E599]/20 blur-[60px] rounded-full opacity-50 pulse" />
                    
                    <div className="relative rounded-3xl border border-white/10 overflow-hidden shadow-2xl premium-glow animate-fade-in-up">
                        <img 
                            src="/landing-preview.png" 
                            alt="NexFolio Dashboard" 
                            className="w-full h-auto"
                        />
                    </div>

                    {/* Floating Info Cards */}
                    <div className="absolute -right-8 -bottom-8 hidden lg:block p-6 rounded-2xl bg-black/80 backdrop-blur-xl border border-[#00E599]/30 shadow-2xl max-w-xs text-left animate-float">
                        <p className="text-[#00E599] font-bold mb-2">🔥 Trending up</p>
                        <p className="text-white text-sm">Base Set Charizard Holo 1st Ed. increased by 12% this week.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
