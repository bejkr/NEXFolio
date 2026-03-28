import { cardmarketService } from '../services/cardmarketService';
import { productService } from '../services/productService';
import { ProductData } from '../services/productService';
import { logger } from '../utils/logger';
import pLimit from 'p-limit';

// Concurrency control: 1 request at a time to prevent blocking.
const limit = pLimit(1);
const REQUEST_DELAY_MS = 3000;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function fetchWithRetry(operation: () => Promise<any>, url: string, retries = 3): Promise<any> {
    try {
        await delay(REQUEST_DELAY_MS);
        return await operation();
    } catch (error: any) {
        if (retries > 0) {
            logger.warn(`Retrying fetch for ${url}. Attempts left: ${retries - 1}. Waiting 10 seconds before retry...`);
            await delay(10000);
            return fetchWithRetry(operation, url, retries - 1);
        }
        logger.error(`Max retries reached for ${url}`);
        throw error;
    }
}

// Keep the year extraction function for approximate dating
function extractYear(expansionName: string): number {
    const years: { [key: string]: number } = {
        'Scarlet & Violet': 2023, 'Paldea Evolved': 2023, 'Obsidian Flames': 2023,
        '151': 2023, 'Paradox Rift': 2023, 'Temporal Forces': 2024,
        'Twilight Masquerade': 2024, 'Shrouded Fable': 2024, 'Surging Sparks': 2024,
        'Prismatic Evolutions': 2025, 'Sword & Shield': 2020, 'Rebel Clash': 2020,
        'Darkness Ablaze': 2020, 'Champion\'s Path': 2020, 'Vivid Voltage': 2020,
        'Shining Fates': 2021, 'Battle Styles': 2021, 'Chilling Reign': 2021,
        'Evolving Skies': 2021, 'Celebrations': 2021, 'Fusion Strike': 2021,
        'Brilliant Stars': 2022, 'Astral Radiance': 2022, 'Pokémon GO': 2022,
        'Lost Origin': 2022, 'Silver Tempest': 2022, 'Crown Zenith': 2023,
        'Sun & Moon': 2017, 'Guardians Rising': 2017, 'Burning Shadows': 2017,
        'Shining Legends': 2017, 'Crimson Invasion': 2017, 'Ultra Prism': 2018,
        'Forbidden Light': 2018, 'Celestial Storm': 2018, 'Dragon Majesty': 2018,
        'Lost Thunder': 2018, 'Team Up': 2019, 'Detective Pikachu': 2019,
        'Unbroken Bonds': 2019, 'Unified Minds': 2019, 'Hidden Fates': 2019,
        'Cosmic Eclipse': 2019, 'XY': 2014, 'Flashfire': 2014, 'Furious Fists': 2014,
        'Phantom Forces': 2014, 'Primal Clash': 2015, 'Roaring Skies': 2015,
        'Ancient Origins': 2015, 'BREAKthrough': 2015, 'BREAKpoint': 2016,
        'Generations': 2016, 'Fates Collide': 2016, 'Steam Siege': 2016,
        'Evolutions': 2016, 'Black & White': 2011, 'HeartGold & SoulSilver': 2010
    };

    // Find first potential year exact or partial match
    for (const [key, value] of Object.entries(years)) {
        if (expansionName.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    // Default to a modern year if we can't tell, user will have to adjust manually
    return 2024;
}

const TARGET_CATEGORIES = [
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Booster-Boxes', name: 'Booster Boxes' },
    { url: 'https://www.cardmarket.com/en/Pokemon/Products/Elite-Trainer-Boxes', name: 'Elite Trainer Boxes' }
];

async function syncCategory(categoryUrl: string, categoryName: string) {
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const url = currentPage === 1 ? categoryUrl : `${categoryUrl}?site=${currentPage}`;
        logger.info(`Fetching ${categoryName} - Page ${currentPage}`);

        const rawResult = await limit(() => fetchWithRetry(
            () => cardmarketService.fetchCategoryGridPage(url),
            url
        ));

        const products = rawResult.products;
        hasNextPage = rawResult.hasNextPage;

        if (products.length === 0) {
            logger.warn(`No products found on ${categoryName} page ${currentPage}. Finishing category.`);
            break;
        }

        logger.info(`Found ${products.length} products on ${categoryName} page ${currentPage}. Upserting to DB...`);

        for (const sp of products) {
            const expName = sp.expansionName || 'Unknown Expansion';
            const year = extractYear(expName);

            const productData: ProductData = {
                externalId: sp.externalId,
                name: sp.name,
                expansion: expName,
                category: 'Sealed',
                releaseYear: year,
                imageUrl: sp.imageUrl || '/placeholder-image.png',
                source: 'cardmarket',
            };

            await productService.upsertProduct(productData);
        }

        currentPage++;
    }
}

async function main() {
    logger.info('Starting Simplified Direct Category Cardmarket Sync...');

    try {
        for (const category of TARGET_CATEGORIES) {
            logger.info(`Starting sync for category: ${category.name}`);
            await syncCategory(category.url, category.name);
        }

        logger.info('Category Sync completed successfully!');

    } catch (error) {
        logger.error('Fatal error during sync process', error);
    } finally {
        await productService.disconnect();
        await cardmarketService.closeBrowser();
    }
}

// Execute
main();
