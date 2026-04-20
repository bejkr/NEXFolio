'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { PremiumButton } from './PremiumButton';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/context/LanguageContext';

export const LandingHeader: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { lang, setLang, t } = useLanguage();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav_features'), href: '#features' },
        { name: t('nav_howItWorks'), href: '#how-it-works' },
        { name: t('nav_pricing'), href: '/pricing' },
        { name: t('nav_market'), href: '/market' },
    ];

    return (
        <header
            className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${isScrolled ? 'py-4 bg-black/60 backdrop-blur-xl border-b border-white/10' : 'py-6 bg-transparent'}
            `}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src="/Logo.png" alt="Nexfolio Logo" className="h-10 lg:h-12 w-auto max-w-[140px] object-contain shrink-0" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-gray-400 hover:text-[#00E599] font-medium transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    {/* Language toggle */}
                    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full p-0.5">
                        <button
                            onClick={() => setLang('en')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === 'en' ? 'bg-white text-[#0E1116]' : 'text-gray-400 hover:text-white'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLang('sk')}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === 'sk' ? 'bg-white text-[#0E1116]' : 'text-gray-400 hover:text-white'}`}
                        >
                            SK
                        </button>
                    </div>

                    {!loading && (
                        user ? (
                            <PremiumButton href="/dashboard" className="!px-6 !py-2.5 !text-base !min-w-0" showSparkles={true}>
                                {t('nav_goToDashboard')}
                            </PremiumButton>
                        ) : (
                            <>
                                <Link href="/login" className="text-white hover:text-[#00E599] font-medium transition-colors px-4">
                                    {t('nav_logIn')}
                                </Link>
                                <PremiumButton href="/register" className="!px-6 !py-2.5 !text-base !min-w-0" showSparkles={false}>
                                    {t('nav_getStarted')}
                                </PremiumButton>
                            </>
                        )
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-b border-white/10 p-6 animate-fade-in-up">
                    <nav className="flex flex-col gap-6 mb-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-xl text-gray-300 hover:text-[#00E599]"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile language toggle */}
                    <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-full p-0.5 w-fit mb-6">
                        <button
                            onClick={() => setLang('en')}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${lang === 'en' ? 'bg-white text-[#0E1116]' : 'text-gray-400'}`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => setLang('sk')}
                            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${lang === 'sk' ? 'bg-white text-[#0E1116]' : 'text-gray-400'}`}
                        >
                            SK
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        {!loading && (
                            user ? (
                                <PremiumButton href="/dashboard" className="w-full">
                                    {t('nav_goToDashboard')}
                                </PremiumButton>
                            ) : (
                                <>
                                    <Link href="/login" className="text-center text-white py-4 font-bold border border-white/10 rounded-xl">
                                        {t('nav_logIn')}
                                    </Link>
                                    <PremiumButton href="/register" className="w-full">
                                        {t('nav_getStarted')}
                                    </PremiumButton>
                                </>
                            )
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};
