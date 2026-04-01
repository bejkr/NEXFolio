'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard, PieChart, TrendingUp, Lightbulb,
    ShoppingCart, Bell, Lock, Settings,
    Search, LogOut, ShieldCheck, Globe
} from 'lucide-react';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setRole(profile?.role || 'user');
            }
        };
        fetchRole();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const renderLink = (href: string, icon: React.ReactNode, label: string) => {
        const isActive = pathname === href;
        return (
            <Link
                href={href}
                className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-white/[0.04] text-white'
                    : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'
                    }`}
            >
                {icon}
                <span className="hidden lg:block ml-3">{label}</span>
            </Link>
        );
    };

    return (
        <aside className="w-16 lg:w-64 border-r border-[rgba(255,255,255,0.06)] flex flex-col justify-between bg-[#0E1116] h-full overflow-y-auto custom-scrollbar">
            <div>
                <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[rgba(255,255,255,0.06)] shrink-0 sticky top-0 bg-[#0E1116] z-10 transition-transform duration-300">
                    <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                        <img src="/Logo.png" alt="Nexfolio Logo" className="h-10 lg:h-12 w-auto max-w-[140px] object-contain shrink-0" />
                    </Link>
                </div>

                <nav className="p-4 space-y-6">
                    {/* PRIMARY (core navigácia) */}
                    <div>
                        <h4 className="hidden lg:block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Primary</h4>
                        <div className="space-y-1">
                            {renderLink('/dashboard', <LayoutDashboard className="h-5 w-5 shrink-0" />, 'Dashboard')}
                            {renderLink('/collection', <PieChart className="h-5 w-5 shrink-0" />, 'Portfolio')}
                            {renderLink('/market', <TrendingUp className="h-5 w-5 shrink-0" />, 'Market')}
                        </div>
                    </div>

                    {/* INTELLIGENCE LAYER */}
                    <div>
                        <h4 className="hidden lg:block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Intelligence</h4>
                        <div className="space-y-1">
                            {renderLink('/products', <Search className="h-5 w-5 shrink-0" />, 'Products')}
                            {renderLink('/insights', <Lightbulb className="h-5 w-5 shrink-0" />, 'Insights')}
                        </div>
                    </div>

                    {/* TRANSACTION / ACTION LAYER */}
                    <div>
                        <h4 className="hidden lg:block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Action</h4>
                        <div className="space-y-2 lg:space-y-1 mt-4 lg:mt-0">
                            {renderLink('/availability', <ShoppingCart className="h-5 w-5 shrink-0" />, 'Availability')}
                        </div>
                    </div>

                    {/* SECONDARY */}
                    <div>
                        <h4 className="hidden lg:block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Secondary</h4>
                        <div className="space-y-2 lg:space-y-1 mt-4 lg:mt-0">
                            {renderLink('/alerts', <Bell className="h-5 w-5 shrink-0" />, 'Alerts')}
                            {renderLink('#reports', <Lock className="h-5 w-5 shrink-0" />, 'Reports')}
                        </div>
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t border-[rgba(255,255,255,0.06)] shrink-0 sticky bottom-0 bg-[#0E1116] space-y-2 lg:space-y-1">
                {renderLink('/', <Globe className="h-5 w-5 shrink-0" />, 'Back to Website')}
                {role === 'admin' && renderLink('/admin/settings', <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />, 'Admin Settings')}
                {renderLink('#settings', <Settings className="h-5 w-5 shrink-0" />, 'Settings')}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors text-red-500 hover:bg-red-500/10 text-left"
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    <span className="hidden lg:block ml-3">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
