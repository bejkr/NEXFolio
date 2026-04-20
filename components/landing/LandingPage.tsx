'use client';

import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { LandingHeader } from './LandingHeader';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { FeaturesGrid } from './FeaturesGrid';
import { SocialProof } from './SocialProof';
import { Pricing } from './Pricing';
import { ProductMarquee } from './ProductMarquee';
import { CTASection, LandingFooter } from './LandingFooter';
import { ScrollReveal } from './ScrollReveal';
import { ValueProps } from './ValueProps';

export default function LandingPage() {
    return (
        <LanguageProvider>
        <div className="bg-[#0E1116] min-h-screen text-[#f3f4f6] relative">
            {/* Soft global background glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00E599]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <LandingHeader />
            <main className="relative z-10">
                <Hero />
                <ProductMarquee />
                <div id="how-it-works">
                    <HowItWorks />
                </div>
                <FeaturesGrid />
                <ValueProps />
                <div id="pricing">
                    <Pricing />
                </div>
                <SocialProof />
                <CTASection />
            </main>
            <LandingFooter />
        </div>
        </LanguageProvider>
    );
}
