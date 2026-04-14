export interface PricingFeature {
    text: string;
    included: boolean;
    note?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    badge?: string;
    description: string;
    monthlyPrice: number;      // EUR, per month billed monthly
    annualPrice: number;       // EUR, per month billed annually
    cta: string;
    href: string;
    highlighted: boolean;
    features: PricingFeature[];
}

export const plans: PricingPlan[] = [
    {
        id: 'free',
        name: 'Free',
        description: 'For casual collectors who want to get started.',
        monthlyPrice: 0,
        annualPrice: 0,
        cta: 'Get started free',
        href: '/register',
        highlighted: false,
        features: [
            { text: 'Up to 25 portfolio items', included: true },
            { text: 'Live market prices', included: true },
            { text: '30-day price history', included: true },
            { text: 'Basic dashboard', included: true },
            { text: 'Products database access', included: true },
            { text: 'Watchlist', included: false },
            { text: 'Price alerts', included: false },
            { text: 'Portfolio Signals', included: false },
            { text: 'P&L Reports', included: false },
            { text: 'CSV export', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        badge: 'Most popular',
        description: 'For serious collectors who track their investment.',
        monthlyPrice: 8,
        annualPrice: 6,
        cta: 'Start Pro',
        href: '/register?plan=pro',
        highlighted: true,
        features: [
            { text: 'Unlimited portfolio items', included: true },
            { text: 'Live market prices', included: true },
            { text: '30-day + 12-month price history', included: true },
            { text: 'Full analytics dashboard', included: true },
            { text: 'Products database access', included: true },
            { text: 'Watchlist (up to 100 items)', included: true },
            { text: 'Price alerts', included: true },
            { text: 'Portfolio Signals', included: true },
            { text: 'P&L Reports', included: true },
            { text: 'CSV export', included: false },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'For power users and professional investors.',
        monthlyPrice: 18,
        annualPrice: 14,
        cta: 'Start Premium',
        href: '/register?plan=premium',
        highlighted: false,
        features: [
            { text: 'Unlimited portfolio items', included: true },
            { text: 'Live market prices', included: true },
            { text: '30-day + 12-month price history', included: true },
            { text: 'Full analytics dashboard', included: true },
            { text: 'Products database access', included: true },
            { text: 'Unlimited watchlist', included: true },
            { text: 'Price alerts', included: true },
            { text: 'Portfolio Signals', included: true },
            { text: 'P&L Reports', included: true },
            { text: 'CSV export', included: true, note: 'Coming soon' },
        ],
    },
];

export const comparisonRows: { category: string; features: { label: string; free: string; pro: string; premium: string }[] }[] = [
    {
        category: 'Portfolio',
        features: [
            { label: 'Portfolio items', free: 'Up to 25', pro: 'Unlimited', premium: 'Unlimited' },
            { label: 'Price history', free: '30 days', pro: '30D + 12M', premium: '30D + 12M' },
            { label: 'Auto price sync', free: 'Daily', pro: 'Daily', premium: 'Daily' },
        ],
    },
    {
        category: 'Analytics',
        features: [
            { label: 'Dashboard', free: 'Basic', pro: 'Full', premium: 'Full' },
            { label: 'P&L Reports', free: '—', pro: '✓', premium: '✓' },
            { label: 'Portfolio Signals', free: '—', pro: '✓', premium: '✓' },
            { label: 'CSV Export', free: '—', pro: '—', premium: 'Soon' },
        ],
    },
    {
        category: 'Alerts',
        features: [
            { label: 'Watchlist', free: '—', pro: 'Up to 100', premium: 'Unlimited' },
            { label: 'Price alerts', free: '—', pro: '✓', premium: '✓' },
        ],
    },
];
