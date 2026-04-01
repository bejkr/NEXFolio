'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PremiumButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showSparkles?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  href, 
  children, 
  className = '', 
  showSparkles = true 
}) => {
  return (
    <Link 
      href={href}
      className={`
        premium-button inline-flex items-center justify-center gap-2 px-8 py-4 
        bg-black/40 backdrop-blur-md border border-white/10 rounded-full 
        text-white font-medium text-lg min-w-[200px]
        hover:bg-black/60 transition-all duration-300
        ${className}
      `}
    >
      {showSparkles && <Sparkles className="w-5 h-5 text-[#00E599]" />}
      <span>{children}</span>
    </Link>
  );
};
