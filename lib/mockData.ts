export interface PortfolioSummary {
    totalValue: number;
    unrealizedGainLoss: {
        value: number;
        percentage: number;
    };
    cagr12M: number;
    volatilityIndex: number;
}

export interface RiskMetrics {
    volatility: number;
    liquidityScore: number;
    concentrationIndex: number;
    analyticalText: string;
}

export interface MarketSnapshotData {
    sealedIndex12M: number;
    gradedIndex12M: number;
    marketLiquidityTrend: 'Increasing' | 'Stable' | 'Decreasing';
}

export interface AllocationData {
    name: string;
    value: number;
}

export interface PerformanceData {
    month: string;
    value: number;
}

export interface TopMover {
    id: string;
    name: string;
    category: 'Sealed' | 'Graded' | 'Raw';
    currentValue: number;
    change30D: number;
    change12M: number;
    liquidityScore: number;
}

export const mockPortfolioSummary: PortfolioSummary = {
    totalValue: 0,
    unrealizedGainLoss: {
        value: 0,
        percentage: 0,
    },
    cagr12M: 0,
    volatilityIndex: 0,
};

export const mockRiskMetrics: RiskMetrics = {
    volatility: 0,
    liquidityScore: 0,
    concentrationIndex: 0,
    analyticalText: "No data available. Start adding assets to your portfolio.",
};

export const mockMarketSnapshot: MarketSnapshotData = {
    sealedIndex12M: 0,
    gradedIndex12M: 0,
    marketLiquidityTrend: 'Stable',
};

export const mockAllocationData: AllocationData[] = [];

export const mockPerformanceData: PerformanceData[] = [];

export const mockTopMovers: TopMover[] = [];

export interface CollectionItem {
    id: string;
    userId: string;
    name: string;
    set: string;
    category: 'Sealed' | 'Graded' | 'Raw';
    condition: string;
    costBasis: number;
    currentValue: number;
    purchaseDate: string;
    imageUrl: string;
    productId?: string | null;
}

export const mockCollectionData: CollectionItem[] = [];

export interface MarketOverviewData {
    sealedIndex12M: number;
    gradedIndex12M: number;
    averageLiquidity: number;
    marketVolatility: number;
}

export const mockMarketOverview: MarketOverviewData = {
    sealedIndex12M: 0,
    gradedIndex12M: 0,
    averageLiquidity: 0,
    marketVolatility: 0,
};

export interface EraPerformance {
    era: string;
    perf3M: number;
    perf12M: number;
    trend: 'up' | 'down' | 'flat';
}

export const mockEraPerformance: EraPerformance[] = [];

export interface MarketAsset {
    id: string;
    name: string;
    category: 'Sealed' | 'Graded' | 'Raw';
    change30D: number;
    change12M: number;
    liquidityScore: number;
    activeListings: number;
    sold7D: number;
    sellThroughRate: number;
}

export const mockMarketGainers: MarketAsset[] = [];

export const mockMarketDecliners: MarketAsset[] = [];

export const mockLiquidityBoard: MarketAsset[] = [];

export interface MarketTrendData {
    date: string;
    sealedIndex: number;
    gradedIndex: number;
}

export const mockMarketTrend: MarketTrendData[] = [];

export interface ProductResearch {
    id: string;
    name: string;
    category: 'Sealed' | 'Graded' | 'Raw';
    era: string;
    price: number;
    change30D: number;
    change12M: number;
    liquidityScore: number;
    volatility: number;
    indexScore: number;
    marketAvailability: {
        cz: number;
        sk: number;
    };
    imageUrl?: string;
    location?: { country: string; city?: string };
    condition?: string;
    trendCommentary: string;
    historicalData: { date: string; price: number }[];
}

export const mockProducts: ProductResearch[] = [];
