'use client';

import React from 'react';
import { PremiumButton } from './PremiumButton';
import { LandingDashboardPreview } from './LandingDashboardPreview';
import { ScrollReveal } from './ScrollReveal';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,153,0.08)_0%,transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <ScrollReveal delay={0.1}>
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-[#00E599]/10 border border-[#00E599]/20 text-[#00E599] text-sm font-semibold tracking-wide uppercase">
              Track Your Collection Like a Pro
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.25}>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
              Master your <br /> 
              <span className="text-[#00E599]">Portfolio Value</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Automated tracking for your TCG, sealed products, and graded cards. 
              Stop manual spreadsheets and start making data-driven decisions.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.55}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <PremiumButton href="/register">
                Start Now
              </PremiumButton>
              <p className="text-gray-500 text-sm font-medium italic">
                Free to start • No credit card required
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Dashboard Preview Component */}
        <ScrollReveal delay={0.7} direction="up">
            <LandingDashboardPreview />
        </ScrollReveal>
      </div>
    </section>
  );
};
