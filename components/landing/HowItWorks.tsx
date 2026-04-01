import React from 'react';
import { Search, PlusCircle, LayoutDashboard } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Search",
      description: "Find any product from our massive database across global markets."
    },
    {
      icon: <PlusCircle className="w-8 h-8" />,
      title: "Add",
      description: "Instantly add items to your digital vault with cost basis and condition."
    },
    {
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: "Track",
      description: "Watch your portfolio value evolve in real-time with beautiful charts."
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
        {/* Background mesh glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00E599]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <ScrollReveal delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-16">
            How it works
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={0.2 + (i * 0.15)} direction={i === 0 ? "right" : i === 2 ? "left" : "up"}>
              <div className="relative group">
                {/* Connector line for desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-[#00E599]/40 to-transparent z-0" />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#00E599] mb-6 group-hover:scale-110 group-hover:bg-[#00E599]/10 transition-all duration-300 premium-glow">
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400 max-w-xs">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
