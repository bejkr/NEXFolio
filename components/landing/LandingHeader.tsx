'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { PremiumButton } from './PremiumButton';

export const LandingHeader: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#' },
        { name: 'About', href: '#' },
    ];

    return (
        <header 
            className={`
                fixed top-0 left-0 right-0 z-50 transition-all duration-300
                ${isScrolled ? 'py-4 bg-black/60 backdrop-blur-xl border-b border-white/10' : 'py-6 bg-transparent'}
            `}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00E599] flex items-center justify-center text-black font-bold text-xl">
                        N
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tighter">NexFolio</span>
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
                    <Link href="/login" className="text-white hover:text-[#00E599] font-medium transition-colors px-4">
                        Log in
                    </Link>
                    <PremiumButton href="/register" className="!px-6 !py-2.5 !text-base !min-w-0" showSparkles={false}>
                        Get Started
                    </PremiumButton>
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
                    <div className="flex flex-col gap-4">
                        <Link href="/login" className="text-center text-white py-4 font-bold border border-white/10 rounded-xl">
                            Log in
                        </Link>
                        <PremiumButton href="/register" className="w-full">
                            Get Started
                        </PremiumButton>
                    </div>
                </div>
            )}
        </header>
    );
};
