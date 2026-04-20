export interface PortfolioSummary {
    totalValue: number;
    unrealizedGainLoss: {
        value: number;
        percentage: number;
    };
    cagr12M: number;
    volatilityIndex: number;
    totalItems: number;
}

export interface RiskMetrics {
    volatility: number;
    liquidityScore: number;
    concentrationIndex: number;
    analyticalText: string;
}

export interface MarketSnapshotData {
    sealedIndex12M: number;
    gradedIndex12M?: number;
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

export interface VolatilityData {
    range: string;
    value: number;
}

export interface TopMover {
    id: string;
    name: string;
    category: string;
    currentValue: number;
    change30D: number | null;
    change12M: number | null;
    liquidityScore: number;
    imageUrl?: string;
    productId?: string;
}

export const mockPortfolioSummary: PortfolioSummary = {
    totalValue: 0,
    unrealizedGainLoss: {
        value: 0,
        percentage: 0,
    },
    cagr12M: 0,
    volatilityIndex: 0,
    totalItems: 0,
};

export const mockRiskMetrics: RiskMetrics = {
    volatility: 0,
    liquidityScore: 0,
    concentrationIndex: 0,
    analyticalText: "No data available. Start adding assets to your portfolio.",
};

export const mockMarketSnapshot: MarketSnapshotData = {
    sealedIndex12M: 0,
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
    category: string;
    condition: string;
    costBasis: number;
    currentValue: number;
    purchaseDate: string;
    imageUrl: string;
    quantity: number;
    productId?: string | null;
    product?: any | null;
}

export const mockCollectionData: CollectionItem[] = [];

export interface MarketOverviewData {
    sealedAvgPrice?: number;   // avg current price across all tracked products (optional)
    sealedIndex12M: number;
    sealedIndex30D?: number;
    averageLiquidity: number;
    marketVolatility: number;  // daily volatility %
}

export const mockMarketOverview: MarketOverviewData = {
    sealedAvgPrice: 0,
    sealedIndex12M: 0,
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
    category: string;
    change30D: number | null;
    change12M: number | null;
    liquidityScore: number;
    activeListings: number;
    price?: number | null;
    sold7D?: number;          // optional — not available from Cardmarket scrape
    sellThroughRate?: number; // optional — not available from Cardmarket scrape
}

export interface DiscoverAsset {
    id: string;
    name: string;
    category: string;
    price: number | null;
    momentum30D: number | null;
    momentum12M: number | null;
    liquidityScore: number;
    activeListings: number;
    nexfolioScore: number;
    discoverScore: number;
    imageUrl?: string | null;
}

export const mockMarketGainers: MarketAsset[] = [];

export const mockMarketDecliners: MarketAsset[] = [];

export const mockLiquidityBoard: MarketAsset[] = [];

export interface MarketTrendData {
    date: string;
    sealedIndex: number;
    gradedIndex?: number; // optional — only available when graded data exists
}

export const mockMarketTrend: MarketTrendData[] = [];

export interface PriceBreakout {
    id: string;
    name: string;
    category: string;
    price: number | null;
    change7D: number;
    change30D: number | null;
    activeListings: number;
    imageUrl?: string | null;
}

export interface TrendingSet {
    expansion: string;
    releaseYear?: number;
    productCount: number;
    avgChange30D: number;
    avgChange12M: number | null;
    avgPrice: number | null;
}

export interface ProductResearch {
    id: string;
    name: string;
    category: string;
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
export interface Alert {
    id: string;
    type: 'price' | 'system' | 'availability';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    timestamp: string;
    read: boolean;
}

export const mockAlerts: Alert[] = [];
