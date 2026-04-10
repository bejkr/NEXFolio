import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

const CACHE_DIR = path.join(process.cwd(), '.cache', 'scraper');
const MOCK_DATA_PATH = path.join(process.cwd(), 'lib', 'mockData.ts');

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function determineEra(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('base') || n.includes('jungle') || n.includes('fossil') || n.includes('team rocket')) return 'Base Era (1996 - 2002)';
    if (n.includes('ex ')) return 'EX Era (2003 - 2007)';
    return 'Modern (2018 - 2024)';
}

async function main() {
    console.log('Reading scraper cache...');
    const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.html'));

    let allProducts: { name: string, category: 'Sealed' | 'Raw' | 'Graded' }[] = [];

    for (const file of files) {
        if (allProducts.length > 200) break; // Don't need too many
        const html = fs.readFileSync(path.join(CACHE_DIR, file), 'utf-8');
        const $ = cheerio.load(html);

        $('.table-body .row').each((_, el) => {
            const nameNode = $(el).find('.col-name a');
            // sometimes it's different in cardmarket, fallback to col-name text
            let name = nameNode.text().trim();
            if (!name) name = $(el).find('.col-name').text().trim();

            if (name) {
                // Determine category
                let category: 'Sealed' | 'Raw' | 'Graded' = 'Raw';
                if (name.toLowerCase().includes('booster box') || name.toLowerCase().includes('elite trainer box') || name.toLowerCase().includes('pack')) {
                    category = 'Sealed';
                }

                // Only add if unique
                if (!allProducts.find(p => p.name === name)) {
                    allProducts.push({ name, category });
                }
            }
        });
    }

    // fallback if no products found (maybe DOM changed)
    if (allProducts.length === 0) {
        for (const file of files.slice(0, 50)) {
            try {
                const baseName = Buffer.from(file.replace('.html', ''), 'base64').toString('utf-8');
                const cleanName = baseName.split('/').pop()?.replace(/-/g, ' ') || 'Unknown Pokemon Item';
                if (cleanName.length > 5 && !cleanName.includes('http')) {
                    allProducts.push({
                        name: cleanName,
                        category: cleanName.toLowerCase().includes('box') || cleanName.toLowerCase().includes('pack') ? 'Sealed' : 'Raw'
                    });
                }
            } catch (e) {
                // Ignore base64 decode errors
            }
        }
    }

    if (allProducts.length === 0) {
        return;
    }

    // Select top 30 products for ProductResearch
    const selectedProducts = allProducts.slice(0, 30);

    let productResearchStr = 'export const mockProducts: ProductResearch[] = [\n';
    const generatedProducts: any[] = [];

    selectedProducts.forEach((p, i) => {
        const id = 'p' + (i + 1);
        const price = randomFloat(20, 1500);
        const change30D = randomFloat(-15, 25, 1);
        const change12M = randomFloat(-20, 60, 1);
        const liquidityScore = randomInt(40, 98);
        const volatility = randomFloat(5, 30, 1);
        const indexScore = randomInt(50, 95);
        const cz = randomInt(0, 20);
        const sk = randomInt(0, 10);
        const era = determineEra(p.name);

        let hist = [];
        let curPrice = price;
        for (let j = 5; j >= 0; j--) {
            hist.push("{ date: 'M" + j + "', price: " + curPrice.toFixed(2) + " }");
            curPrice = curPrice * (1 - (randomFloat(-5, 5) / 100)); // work backwards
        }
        hist.reverse();

        generatedProducts.push({ id, name: p.name, category: p.category, price, change30D, change12M, liquidityScore, cz, sk, era });

        productResearchStr += "    {\n";
        productResearchStr += "        id: '" + id + "',\n";
        productResearchStr += "        name: '" + p.name.replace(/'/g, "\\'") + "',\n";
        productResearchStr += "        category: '" + p.category + "',\n";
        productResearchStr += "        era: '" + era + "',\n";
        productResearchStr += "        price: " + price + ",\n";
        productResearchStr += "        change30D: " + change30D + ",\n";
        productResearchStr += "        change12M: " + change12M + ",\n";
        productResearchStr += "        liquidityScore: " + liquidityScore + ",\n";
        productResearchStr += "        volatility: " + volatility + ",\n";
        productResearchStr += "        indexScore: " + indexScore + ",\n";
        productResearchStr += "        marketAvailability: { cz: " + cz + ", sk: " + sk + " },\n";
        productResearchStr += "        trendCommentary: \"Generated from Cardmarket cache.\",\n";
        productResearchStr += "        historicalData: [" + hist.join(', ') + "]\n";
        productResearchStr += "    },\n";
    });
    productResearchStr += "];\n";

    // Generate other sections
    const totalValue = generatedProducts.reduce((acc, p) => acc + (p.price * randomInt(1, 10)), 0);

    const summaryStr = "export const mockPortfolioSummary: PortfolioSummary = {\n    totalValue: " + totalValue.toFixed(2) + ",\n    unrealizedGainLoss: { value: " + (totalValue * 0.15).toFixed(2) + ", percentage: 15.0 },\n    cagr12M: 12.5,\n    volatilityIndex: 14.2,\n    totalItems: " + generatedProducts.length + ",\n};\n";
    const riskStr = "export const mockRiskMetrics: RiskMetrics = {\n    volatility: 14.2,\n    liquidityScore: 82,\n    concentrationIndex: 35,\n    analyticalText: \"Portfolio generated from real Cardmarket expansions.\",\n};\n";

    let collectionStr = "export const mockCollectionData: CollectionItem[] = [\n";
    collectionStr += generatedProducts.slice(0, 10).map((p, i) => "    { id: 'c" + (i + 1) + "', name: '" + p.name.replace(/'/g, "\\'") + "', set: '" + p.era + "', category: '" + p.category + "', condition: 'NM', costBasis: " + (p.price * 0.8).toFixed(2) + ", currentValue: " + p.price + ", purchaseDate: '2023-0" + randomInt(1, 9) + "-15', imageUrl: '' }").join(',\n');
    collectionStr += "\n];\n";

    let moversStr = "export const mockTopMovers: TopMover[] = [\n";
    moversStr += generatedProducts.slice(10, 15).map(p => "    { id: '" + p.id + "', name: '" + p.name.replace(/'/g, "\\'") + "', category: '" + p.category + "', currentValue: " + p.price + ", change30D: " + p.change30D + ", change12M: " + p.change12M + ", liquidityScore: " + p.liquidityScore + " }").join(',\n');
    moversStr += "\n];\n";

    let gainersStr = "export const mockMarketGainers: MarketAsset[] = [\n";
    gainersStr += generatedProducts.slice(15, 18).map(p => "    { id: 'm_" + p.id + "', name: '" + p.name.replace(/'/g, "\\'") + "', category: '" + p.category + "', change30D: Math.abs(" + p.change30D + ") + 5, change12M: " + p.change12M + ", liquidityScore: " + p.liquidityScore + ", activeListings: " + (p.cz + p.sk) + ", sold7D: 5, sellThroughRate: 20 }").join(',\n');
    gainersStr += "\n];\n";

    let declinersStr = "export const mockMarketDecliners: MarketAsset[] = [\n";
    declinersStr += generatedProducts.slice(18, 21).map(p => "    { id: 'm_" + p.id + "', name: '" + p.name.replace(/'/g, "\\'") + "', category: '" + p.category + "', change30D: -Math.abs(" + p.change30D + ") - 5, change12M: " + p.change12M + ", liquidityScore: " + p.liquidityScore + ", activeListings: " + (p.cz + p.sk) + ", sold7D: 2, sellThroughRate: 5 }").join(',\n');
    declinersStr += "\n];\n";

    const liqStr = "export const mockLiquidityBoard: MarketAsset[] = [...mockMarketGainers, ...mockMarketDecliners].sort((a,b) => b.liquidityScore - a.liquidityScore);\n";

    let currentMockFile = fs.readFileSync(MOCK_DATA_PATH, 'utf-8');

    // Safe regexes with no flags
    currentMockFile = currentMockFile.replace(/export const mockProducts: ProductResearch\[\] = \[\];/, productResearchStr);
    currentMockFile = currentMockFile.replace(/export const mockCollectionData: CollectionItem\[\] = \[\];/, collectionStr);
    currentMockFile = currentMockFile.replace(/export const mockTopMovers: TopMover\[\] = \[\];/, moversStr);
    currentMockFile = currentMockFile.replace(/export const mockMarketGainers: MarketAsset\[\] = \[\];/, gainersStr);
    currentMockFile = currentMockFile.replace(/export const mockMarketDecliners: MarketAsset\[\] = \[\];/, declinersStr);
    currentMockFile = currentMockFile.replace(/export const mockLiquidityBoard: MarketAsset\[\] = \[\];/, liqStr);

    currentMockFile = currentMockFile.replace(/export const mockPortfolioSummary: PortfolioSummary = \{[\s\S]*?\};/, summaryStr.trim());
    currentMockFile = currentMockFile.replace(/export const mockRiskMetrics: RiskMetrics = \{[\s\S]*?\};/, riskStr.trim());
    currentMockFile = currentMockFile.replace(/export const mockMarketSnapshot: MarketSnapshotData = \{[\s\S]*?\};/, "export const mockMarketSnapshot: MarketSnapshotData = { sealedIndex12M: 15.4, gradedIndex12M: 10.2, marketLiquidityTrend: 'Stable' };");
    currentMockFile = currentMockFile.replace(/export const mockMarketOverview: MarketOverviewData = \{[\s\S]*?\};/, "export const mockMarketOverview: MarketOverviewData = { sealedIndex12M: 15.4, gradedIndex12M: 10.2, averageLiquidity: 75, marketVolatility: 14.5 };");
    currentMockFile = currentMockFile.replace(/export const mockAllocationData: AllocationData\[\] = \[\];/, "export const mockAllocationData: AllocationData[] = [{ name: 'Sealed', value: 60 }, { name: 'Graded', value: 30 }, { name: 'Raw', value: 10 }];");
    currentMockFile = currentMockFile.replace(/export const mockEraPerformance: EraPerformance\[\] = \[\];/, "export const mockEraPerformance: EraPerformance[] = [{ era: 'Modern', perf3M: 5, perf12M: 15, trend: 'up' }, { era: 'Base', perf3M: 2, perf12M: 10, trend: 'up' }];");

    fs.writeFileSync(MOCK_DATA_PATH, currentMockFile, 'utf-8');
    console.log('Successfully updated lib/mockData.ts!');
}

main().catch(console.error);
