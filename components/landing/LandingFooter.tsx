import React from 'react';
import { PremiumButton } from './PremiumButton';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from './ScrollReveal';

export const CTASection: React.FC = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-[#00E599]/10 rounded-full blur-[140px] pointer-events-none" />
            
            <div className="container mx-auto px-6 relative z-10 text-center">
                <div className="max-w-4xl mx-auto p-12 md:p-20 rounded-[3rem] bg-gradient-to-b from-[#151A21] to-black border border-white/10 shadow-2xl premium-glow">
                    <ScrollReveal delay={0.1}>
                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">
                            Ready to automate your <br />
                            <span className="text-[#00E599]">collection tracking?</span>
                        </h2>
                    </ScrollReveal>
                    
                    <ScrollReveal delay={0.2}>
                        <p className="text-xl text-gray-400 mb-12 max-w-xl mx-auto">
                            Stop updating spreadsheets manually. Let Nexfolio track your collection value automatically.
                        </p>
                    </ScrollReveal>
                    
                    <ScrollReveal delay={0.3}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <PremiumButton href="/register">
                                Start tracking now
                            </PremiumButton>
                            <Link href="#features" className="text-white hover:text-[#00E599] font-medium transition-colors">
                                Explore features {" >"}
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

export const LandingFooter: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="pt-16 pb-10 border-t border-white/5 bg-black/40">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

                    {/* Brand */}
                    <div>
                        <img src="/Logo.png" alt="Nexfolio Logo" className="h-10 w-auto max-w-[140px] object-contain shrink-0 mb-4" />
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Portfolio analytics for TCG collectors. Automated, accurate, and built for serious investors.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Platform</h4>
                        <ul className="space-y-3 text-gray-500 text-sm">
                            <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/market" className="hover:text-white transition-colors">Market</Link></li>
                            <li><Link href="/products" className="hover:text-white transition-colors">Products database</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Account</h4>
                        <ul className="space-y-3 text-gray-500 text-sm">
                            <li><Link href="/register" className="hover:text-white transition-colors">Create account</Link></li>
                            <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-xs text-center md:text-left">
                        © {currentYear} Nexfolio. All rights reserved.
                    </p>
                    <Link href="mailto:hello@nexfolio.com" className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors text-xs">
                        <Mail className="w-4 h-4" />
                        <span>hello@nexfolio.com</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
};
