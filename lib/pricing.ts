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
        description: 'For casual collectors.',
        monthlyPrice: 0,
        annualPrice: 0,
        cta: 'Get started free',
        href: '/register',
        highlighted: false,
        features: [
            { text: '10 portfolio items', included: true },
            { text: '6M history', included: true },
            { text: 'Basic dashboard', included: true },
            { text: 'Product database preview', included: true },
            { text: 'Watchlist', included: false },
            { text: 'Price alerts', included: false },
            { text: 'Portfolio Signals', included: false },
            { text: 'P&L Reports', included: false },
            { text: 'Export tools', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        badge: 'Bestseller',
        description: 'For active collectors & investors.',
        monthlyPrice: 8,
        annualPrice: 6,
        cta: 'Start Pro',
        href: '/register?plan=pro',
        highlighted: true,
        features: [
            { text: 'Unlimited portfolio items', included: true },
            { text: 'Live prices', included: true },
            { text: '12M history', included: true },
            { text: 'Full analytics dashboard', included: true },
            { text: 'Watchlist', included: true },
            { text: 'Price alerts', included: true },
            { text: 'Portfolio Signals', included: true },
            { text: 'P&L Reports', included: true },
            { text: 'Export tools', included: false },
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        description: 'For serious investors.',
        monthlyPrice: 18,
        annualPrice: 14,
        cta: 'Start Premium',
        href: '/register?plan=premium',
        highlighted: false,
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Unlimited watchlists', included: true },
            { text: 'Advanced market insights', included: true },
            { text: 'Reprint alerts', included: true },
            { text: 'Export tools', included: true },
            { text: 'Priority support', included: true },
            { text: 'Early access features', included: true },
        ],
    },
];

export const comparisonRows: { category: string; features: { label: string; free: string; pro: string; premium: string }[] }[] = [
    {
        category: 'Portfolio',
        features: [
            { label: 'Portfolio items', free: 'Up to 10', pro: 'Unlimited', premium: 'Unlimited' },
            { label: 'Price history', free: '30 days', pro: '12 months', premium: '12 months' },
            { label: 'Live prices', free: '—', pro: '✓', premium: '✓' },
            { label: 'Auto price sync', free: 'Daily', pro: 'Daily', premium: 'Daily' },
        ],
    },
    {
        category: 'Analytics',
        features: [
            { label: 'Dashboard', free: 'Basic', pro: 'Full', premium: 'Full' },
            { label: 'P&L Reports', free: '—', pro: '✓', premium: '✓' },
            { label: 'Portfolio Signals', free: '—', pro: '✓', premium: '✓' },
            { label: 'Advanced market insights', free: '—', pro: '—', premium: '✓' },
        ],
    },
    {
        category: 'Alerts & Watchlist',
        features: [
            { label: 'Watchlist', free: '—', pro: '✓', premium: 'Unlimited' },
            { label: 'Price alerts', free: '—', pro: '✓', premium: '✓' },
            { label: 'Reprint alerts', free: '—', pro: '—', premium: '✓' },
        ],
    },
    {
        category: 'Tools & Support',
        features: [
            { label: 'Export tools', free: '—', pro: '—', premium: '✓' },
            { label: 'Priority support', free: '—', pro: '—', premium: '✓' },
            { label: 'Early access features', free: '—', pro: '—', premium: '✓' },
        ],
    },
];
