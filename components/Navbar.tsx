'use client';

import React from 'react';
import { Search, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { NotificationDropdown } from './NotificationDropdown';

export function Navbar() {
    return (
        <header className="h-16 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-6 bg-[#0E1116] shrink-0">
            <div className="flex items-center flex-1">
                <button className="lg:hidden text-gray-400 hover:text-white mr-4">
                    <PanelLeft className="h-5 w-5" />
                </button>
                <div className="max-w-md w-full relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full bg-[#151A21] border border-[rgba(255,255,255,0.06)] rounded-md pl-10 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <NotificationDropdown />
                
                <Link href="/dashboard/profile">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-[#008055] border border-[rgba(0,229,153,0.3)] shadow-[0_0_10px_rgba(0,229,153,0.2)] cursor-pointer hover:scale-110 active:scale-95 transition-all"></div>
                </Link>
            </div>
        </header>
    );
}
