import React from 'react';
import { PremiumButton } from './PremiumButton';
import { Mail, Github, Twitter, Instagram } from 'lucide-react';
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
                            Join 12,000+ collectors who are already saving time and making smarter decisions with NexFolio.
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
        <footer className="pt-24 pb-12 border-t border-white/5 bg-black/40">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#00E599] flex items-center justify-center text-black font-bold text-xl">
                                N
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tighter">NexFolio</span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            The professional standard for collectible tracking. Automated, accurate, and powerful.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#00E599] transition-all">
                                <Twitter className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#00E599] transition-all">
                                <Instagram className="w-5 h-5" />
                            </Link>
                            <Link href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#00E599] transition-all">
                                <Github className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">API</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Resources</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Market Reports</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Guides</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-500 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Consent</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-600 text-xs text-center md:text-left">
                        © {currentYear} NexFolio. All rights reserved. Built with ❤️ for the collecting community.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="mailto:hello@nexfolio.com" className="flex items-center gap-2 text-gray-600 hover:text-white transition-colors text-xs">
                            <Mail className="w-4 h-4" />
                            <span>hello@nexfolio.com</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
