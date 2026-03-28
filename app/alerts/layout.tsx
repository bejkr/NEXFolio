import { Bell, Search, PanelLeft } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';

export default function AlertsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#0E1116] font-sans antialiased text-gray-100 overflow-hidden">
            <Sidebar />

            {/* Main Container */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Bar */}
                <header className="h-16 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between px-6 bg-[#0E1116]">
                    <div className="flex items-center flex-1">
                        <button className="lg:hidden text-gray-400 hover:text-white mr-4">
                            <PanelLeft className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/alerts" className="text-primary hover:text-white transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-0 right-1 h-2 w-2 bg-primary rounded-full border border-[#0E1116] shadow-[0_0_8px_rgba(0,229,153,0.8)]"></span>
                        </Link>
                        <Link href="/dashboard/profile">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-[#008055] border border-[rgba(0,229,153,0.3)] shadow-[0_0_10px_rgba(0,229,153,0.2)] cursor-pointer hover:scale-110 active:scale-95 transition-all"></div>
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
