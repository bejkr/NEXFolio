'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    LayoutDashboard, PieChart, TrendingUp,
    Bell, Settings, Search, LogOut, ShieldCheck, Globe, X
} from 'lucide-react';
import { useWatchlistHits } from '@/context/WatchlistHitsContext';

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [role, setRole] = useState<string | null>(null);
    const { totalAlerts } = useWatchlistHits();
    const [mobileOpen, setMobileOpen] = useState(false);

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

    useEffect(() => {
        const open = () => setMobileOpen(true);
        window.addEventListener('open-mobile-nav', open);
        return () => window.removeEventListener('open-mobile-nav', open);
    }, []);

    // Close drawer on route change
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    const renderLink = (href: string, icon: React.ReactNode, label: string) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
            <Link
                href={href}
                className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-white/[0.04] text-white'
                        : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'
                }`}
            >
                {icon}
                <span className="hidden lg:block ml-3">{label}</span>
            </Link>
        );
    };

    const renderMobileLink = (href: string, icon: React.ReactNode, label: string) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
            <Link
                href={href}
                className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-white/[0.04] text-white'
                        : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'
                }`}
            >
                {icon}
                <span className="ml-3">{label}</span>
            </Link>
        );
    };

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:w-64 border-r border-[rgba(255,255,255,0.06)] flex-col justify-between bg-[#0E1116] h-full overflow-y-auto custom-scrollbar">
                <div>
                    <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-[rgba(255,255,255,0.06)] shrink-0 sticky top-0 bg-[#0E1116] z-10">
                        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <img src="/Logo.png" alt="Nexfolio Logo" className="h-10 lg:h-12 w-auto max-w-[140px] object-contain shrink-0" />
                        </Link>
                    </div>

                    <nav className="p-4 space-y-6">
                        <div>
                            <h4 className="hidden lg:block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Primary</h4>
                            <div className="space-y-1">
                                {renderLink('/dashboard',  <LayoutDashboard className="h-5 w-5 shrink-0" />, 'Dashboard')}
                                {renderLink('/collection', <PieChart        className="h-5 w-5 shrink-0" />, 'Portfolio')}
                                {renderLink('/market',     <TrendingUp      className="h-5 w-5 shrink-0" />, 'Market')}
                            </div>
                        </div>

                        <div>
                            <h4 className="hidden lg:block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Research</h4>
                            <div className="space-y-1">
                                {renderLink('/products', <Search className="h-5 w-5 shrink-0" />, 'Products')}
                                <Link
                                    href="/alerts"
                                    className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                        pathname === '/alerts'
                                            ? 'bg-white/[0.04] text-white'
                                            : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        <Bell className="h-5 w-5" />
                                        {totalAlerts > 0 && (
                                            <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-0.5 leading-none">
                                                {totalAlerts > 9 ? '9+' : totalAlerts}
                                            </span>
                                        )}
                                    </div>
                                    <span className="hidden lg:block ml-3">Alerts</span>
                                    {totalAlerts > 0 && (
                                        <span className="hidden lg:flex ml-auto items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5">
                                            {totalAlerts}
                                        </span>
                                    )}
                                </Link>
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="p-4 border-t border-[rgba(255,255,255,0.06)] shrink-0 sticky bottom-0 bg-[#0E1116] space-y-1">
                    {renderLink('/', <Globe className="h-5 w-5 shrink-0" />, 'Back to Website')}
                    {role === 'admin' && renderLink('/admin/settings', <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />, 'Admin Settings')}
                    {renderLink('/dashboard/profile', <Settings className="h-5 w-5 shrink-0" />, 'Settings')}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors text-red-500 hover:bg-red-500/10 text-left"
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        <span className="hidden lg:block ml-3">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-64 bg-[#0E1116] border-r border-[rgba(255,255,255,0.06)] flex flex-col">
                        <div className="h-16 flex items-center justify-between px-5 border-b border-[rgba(255,255,255,0.06)] shrink-0">
                            <Link href="/" className="hover:opacity-80 transition-opacity">
                                <img src="/Logo.png" alt="Nexfolio" className="h-10 w-auto object-contain" />
                            </Link>
                            <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Primary</h4>
                                <div className="space-y-1">
                                    {renderMobileLink('/dashboard',  <LayoutDashboard className="h-5 w-5 shrink-0" />, 'Dashboard')}
                                    {renderMobileLink('/collection', <PieChart        className="h-5 w-5 shrink-0" />, 'Portfolio')}
                                    {renderMobileLink('/market',     <TrendingUp      className="h-5 w-5 shrink-0" />, 'Market')}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Research</h4>
                                <div className="space-y-1">
                                    {renderMobileLink('/products', <Search className="h-5 w-5 shrink-0" />, 'Products')}
                                    <Link
                                        href="/alerts"
                                        className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                            pathname === '/alerts'
                                                ? 'bg-white/[0.04] text-white'
                                                : 'text-gray-400 hover:bg-white/[0.02] hover:text-white'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <Bell className="h-5 w-5" />
                                            {totalAlerts > 0 && (
                                                <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-0.5 leading-none">
                                                    {totalAlerts > 9 ? '9+' : totalAlerts}
                                                </span>
                                            )}
                                        </div>
                                        <span className="ml-3">Alerts</span>
                                        {totalAlerts > 0 && (
                                            <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5">
                                                {totalAlerts}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        </nav>

                        <div className="p-4 border-t border-[rgba(255,255,255,0.06)] shrink-0 space-y-1">
                            {renderMobileLink('/', <Globe className="h-5 w-5 shrink-0" />, 'Back to Website')}
                            {role === 'admin' && renderMobileLink('/admin/settings', <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />, 'Admin Settings')}
                            {renderMobileLink('/dashboard/profile', <Settings className="h-5 w-5 shrink-0" />, 'Settings')}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-colors text-red-500 hover:bg-red-500/10 text-left"
                            >
                                <LogOut className="h-5 w-5 shrink-0" />
                                <span className="ml-3">Log Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
