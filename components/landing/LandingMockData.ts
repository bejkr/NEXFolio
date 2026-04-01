import { PortfolioSummary, PerformanceData } from '@/lib/mockData';

export const landingPortfolioSummary: PortfolioSummary = {
    totalValue: 12450.85,
    unrealizedGainLoss: {
        value: 3240.20,
        percentage: 35.2,
    },
    cagr12M: 24.5,
    volatilityIndex: 12.8,
};

export const landingPerformanceData: PerformanceData[] = [
    { month: '2023-10-01', value: 8000 },
    { month: '2023-11-01', value: 8500 },
    { month: '2023-12-01', value: 9200 },
    { month: '2024-01-01', value: 8900 },
    { month: '2024-02-01', value: 10500 },
    { month: '2024-03-01', value: 12450 },
];
