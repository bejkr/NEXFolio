'use client';

import React from 'react';
import { LandingHeader } from './LandingHeader';
import { Hero } from './Hero';
import { ProblemSolution } from './ProblemSolution';
import { HowItWorks } from './HowItWorks';
import { FeaturesGrid } from './FeaturesGrid';
import { InsightsSection, SocialProof } from './SocialProof';
import { CTASection, LandingFooter } from './LandingFooter';
import { ScrollReveal } from './ScrollReveal';

export default function LandingPage() {
    return (
        <div className="bg-[#0E1116] min-h-screen text-[#f3f4f6] relative">
            {/* Soft global background glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00E599]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <LandingHeader />
            <main className="relative z-10">
                <Hero />
                <div id="how-it-works">
                    <HowItWorks />
                </div>
                <div id="problem-solution">
                    <ProblemSolution />
                </div>
                <FeaturesGrid />
                <InsightsSection />
                <SocialProof />
                <CTASection />
            </main>
            <LandingFooter />
        </div>
    );
}
