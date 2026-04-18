import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { NotificationProvider } from '@/context/NotificationContext';
import { WatchlistHitsProvider } from '@/context/WatchlistHitsContext';

export const metadata: Metadata = {
    title: 'Nexfolio',
    description: 'Portfolio analytics dashboard',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={GeistSans.variable}>
            <body className="font-sans">
                <NotificationProvider>
                    <WatchlistHitsProvider>
                        {children}
                    </WatchlistHitsProvider>
                </NotificationProvider>
            </body>
        </html>
    );
}
