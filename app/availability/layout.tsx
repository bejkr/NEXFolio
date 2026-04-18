import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';

export default function AvailabilityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#0E1116] font-sans antialiased text-gray-100 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
