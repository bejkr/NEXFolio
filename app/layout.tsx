import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { NotificationProvider } from '@/context/NotificationContext';
import { WatchlistHitsProvider } from '@/context/WatchlistHitsContext';
import { LanguageProvider } from '@/context/LanguageContext';

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
                <LanguageProvider>
                    <NotificationProvider>
                        <WatchlistHitsProvider>
                            {children}
                        </WatchlistHitsProvider>
                    </NotificationProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
