import { EbayClient } from './ebay';
import axios from 'axios';

export interface StoreOffer {
    id: string;
    storeName: string;
    storeLogo?: string;
    url: string;
    price: number;
    currency: string;
    title: string;
    imageUrl?: string;
    condition?: string;
}

export const SUPPORTED_STORES = [
    { id: 'alza', name: 'Alza.sk', domain: 'alza.sk', logo: 'https://www.alza.sk/favicon.ico' },
    { id: 'sparky', name: 'Sparky.sk', domain: 'sparky.sk', logo: 'https://www.sparkys.sk/favicon.ico' },
    { id: 'megaknihy', name: 'Megaknihy.sk', domain: 'megaknihy.sk', logo: 'https://www.megaknihy.sk/favicon.ico' },
    { id: 'mall', name: 'Mall.sk', domain: 'mall.sk', logo: 'https://www.mall.sk/favicon.ico' },
    { id: 'ebay', name: 'eBay', domain: 'ebay.com', logo: 'https://www.ebay.com/favicon.ico' },
];

export class StoreDiscoveryService {
    private ebayClient: EbayClient;
    private serperApiKey: string;

    constructor() {
        this.ebayClient = new EbayClient();
        this.serperApiKey = process.env.SERPER_API_KEY || '';
    }

    async discoverOffers(productName: string, enabledStores: string[] = ['ebay', 'alza', 'sparky']): Promise<StoreOffer[]> {
        const offers: StoreOffer[] = [];

        // 1. eBay Integration
        if (enabledStores.includes('ebay')) {
            try {
                const ebayResults = await this.ebayClient.searchItems(productName);
                if (ebayResults.itemSummaries && ebayResults.itemSummaries.length > 0) {
                    const item = ebayResults.itemSummaries[0];
                    offers.push({
                        id: `ebay-${item.itemId}`,
                        storeName: 'eBay',
                        title: item.title,
                        url: item.itemWebUrl,
                        price: parseFloat(item.price.value),
                        currency: item.price.currency,
                        imageUrl: item.image?.imageUrl,
                        condition: item.condition,
                        storeLogo: 'https://www.ebay.com/favicon.ico'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch from eBay:', error);
            }
        }

        // 2. Google Hybrid Discovery via Serper.dev
        if (this.serperApiKey) {
            try {
                const serperOffers = await this.discoverSerperOffers(productName, enabledStores);
                offers.push(...serperOffers);
            } catch (error) {
                console.error('Failed to fetch from Serper:', error);
            }
        }

        // 3. Fallback/Mock only if no real items found and no API key
        if (offers.length === 0 && !this.serperApiKey) {
            const slovakStores = SUPPORTED_STORES.filter(s => enabledStores.includes(s.id) && s.id !== 'ebay');
            for (const store of slovakStores) {
                offers.push({
                    id: `${store.id}-mock-${Math.random().toString(36).substr(2, 9)}`,
                    storeName: store.name,
                    title: `${productName} on ${store.name}`,
                    url: `https://www.${store.domain}/search?q=${encodeURIComponent(productName)}`,
                    price: 49.99 + (Math.random() * 20),
                    currency: 'EUR',
                    imageUrl: undefined,
                    storeLogo: store.logo
                });
            }
        }

        return offers;
    }

    private async discoverSerperOffers(productName: string, enabledStores: string[]): Promise<StoreOffer[]> {
        if (!this.serperApiKey) return [];

        try {
            const [shoppingRes, organicRes] = await Promise.all([
                axios.post('https://google.serper.dev/shopping', {
                    q: productName,
                    gl: 'sk',
                    hl: 'sk',
                }, { headers: { 'X-API-KEY': this.serperApiKey, 'Content-Type': 'application/json' } }).catch(() => ({ data: { shopping: [] } })),

                axios.post('https://google.serper.dev/search', {
                    q: productName,
                    gl: 'sk',
                    hl: 'sk',
                    num: 20
                }, { headers: { 'X-API-KEY': this.serperApiKey, 'Content-Type': 'application/json' } }).catch(() => ({ data: { organic: [] } }))
            ]);

            const shoppingResults = shoppingRes.data.shopping || [];
            const organicResults = organicRes.data.organic || [];
            const mergedOffers = new Map<string, StoreOffer>();

            const getDomain = (url: string) => {
                try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; }
            };

            const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const majorStoreKeywords = ['alza', 'mall', 'smarty', 'brloh', 'ihrysko', 'funtastic', 'megaknihy', 'kaufland', 'czc', 'datart', 'shark', 'mironet', 'progamingshop'];

            // 1. Process Shopping Results
            for (const item of shoppingResults) {
                const productWords = normalizeStr(productName).split(/\s+/).filter(w => w.length > 2);
                const titleLower = normalizeStr(item.title);
                if (productWords.length > 0) {
                    const matchCount = productWords.filter(w => titleLower.includes(w)).length;
                    if (matchCount / productWords.length < 0.2) continue;
                }

                const candidateOffers = [{ link: item.link, merchant: item.source, price: item.price }];
                if (item.offers) {
                    for (const offer of item.offers) {
                        candidateOffers.push({ link: offer.link, merchant: offer.merchant, price: offer.price });
                    }
                }

                for (const candidate of candidateOffers) {
                    let directUrl = candidate.link;
                    if (!directUrl) continue;

                    try {
                        const urlObj = new URL(directUrl);
                        if (urlObj.hostname.includes('google')) {
                            const q = urlObj.searchParams.get('url') || urlObj.searchParams.get('q') || urlObj.searchParams.get('adurl');
                            if (q && q.startsWith('http')) directUrl = q;
                        }
                    } catch (e) { }

                    if (directUrl.includes('google.com/search') || directUrl.includes('google.com/shopping/product')) continue;

                    const domain = getDomain(directUrl);
                    if (!domain) continue;

                    let price = 0;
                    if (candidate.price) price = parseFloat((candidate.price as string).replace(/[^\d,. ]/g, '').replace(',', '.'));
                    else if (item.price) price = parseFloat((item.price as string).replace(/[^\d,. ]/g, '').replace(',', '.'));

                    if (!mergedOffers.has(domain)) {
                        mergedOffers.set(domain, {
                            id: `serper-${mergedOffers.size}-${candidate.merchant || domain}`,
                            storeName: candidate.merchant || domain.split('.')[0].toUpperCase(),
                            storeLogo: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                            url: directUrl,
                            price: price || 0,
                            currency: 'EUR',
                            title: item.title,
                            imageUrl: item.imageUrl
                        });
                    }
                }
            }

            // 2. Process Organic Results
            for (const item of organicResults) {
                const domain = getDomain(item.link);
                if (!domain ||
                    domain.includes('google.') ||
                    domain.includes('facebook.') ||
                    domain.includes('youtube.') ||
                    domain.includes('instagram.') ||
                    domain.includes('heureka.')) continue;

                // Category/Listing filter
                const isListing = /\/(c|category|kategoria|vypis|search|hladaj|find|list|tag)\//i.test(item.link) ||
                    item.link.includes('?sort=') ||
                    item.link.includes('?filter=') ||
                    (domain.includes('alza.') && !item.link.match(/-d\d+\.htm/i)) ||
                    (domain.includes('mall.') && item.link.includes('/kategoria/'));
                if (isListing) continue;

                let extractedPrice = 0;
                const priceMatch = ((item as any).attributes?.Cena || (item as any).attributes?.Price || item.snippet || "").match(/(\d+[,.]\d+)\s*(€|EUR|Ks|Kč)/i) ||
                    ((item as any).attributes?.Cena || (item as any).attributes?.Price || item.snippet || "").match(/(\d+[,.]\d+)/);
                if (priceMatch) extractedPrice = parseFloat(priceMatch[1].replace(',', '.'));

                if (mergedOffers.has(domain)) {
                    const existing = mergedOffers.get(domain)!;
                    existing.url = item.link;
                    if (existing.price === 0 && extractedPrice > 0) existing.price = extractedPrice;
                    mergedOffers.set(domain, existing);
                } else {
                    const isMajor = majorStoreKeywords.some(k => domain.includes(k));
                    const productWords = normalizeStr(productName).split(/\s+/).filter(w => w.length > 2);
                    const titleLower = normalizeStr(item.title);
                    const matchRatio = productWords.filter(w => titleLower.includes(w)).length / productWords.length;

                    if (matchRatio >= 0.75 && (extractedPrice > 0 || isMajor)) {
                        mergedOffers.set(domain, {
                            id: `organic-${mergedOffers.size}-${domain}`,
                            storeName: domain.split('.')[0].toUpperCase(),
                            storeLogo: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                            url: item.link,
                            price: extractedPrice,
                            currency: 'EUR',
                            title: item.title,
                            imageUrl: undefined
                        });
                    }
                }
            }

            // 3. TARGETED BOOSTER
            const missingMajors = majorStoreKeywords.filter(k =>
                enabledStores.some(es => es.toLowerCase().includes(k)) &&
                !Array.from(mergedOffers.keys()).some(d => d.includes(k))
            ).slice(0, 3);

            if (missingMajors.length > 0) {
                const boosterResults = await Promise.all(
                    missingMajors.map(k =>
                        axios.post('https://google.serper.dev/search', {
                            q: `"${productName}" ${k}`,
                            gl: 'sk',
                            hl: 'sk',
                            num: 8
                        }, { headers: { 'X-API-KEY': this.serperApiKey, 'Content-Type': 'application/json' } }).catch(() => ({ data: { organic: [] } }))
                    )
                );

                for (const res of boosterResults) {
                    const organic = res.data.organic || [];
                    for (const item of organic) {
                        const domain = getDomain(item.link);
                        if (!domain || mergedOffers.has(domain)) continue;

                        const isListing = /\/(c|category|kategoria|vypis|search|hladaj|list|tag)\//i.test(item.link) ||
                            item.link.includes('?sort=') ||
                            item.link.includes('?filter=') ||
                            (domain.includes('alza.') && !item.link.match(/-d\d+\.htm/i)) ||
                            (domain.includes('mall.') && item.link.includes('/kategoria/'));
                        if (isListing) continue;

                        if (majorStoreKeywords.some(k => domain.includes(k))) {
                            const productWords = normalizeStr(productName).split(/\s+/).filter(w => w.length > 2);
                            const titleLower = normalizeStr(item.title);
                            const matchRatio = productWords.filter(w => titleLower.includes(w)).length / productWords.length;

                            if (matchRatio < 0.75) continue;

                            const pm = (item.snippet || "").match(/(\d+[,.]\d+)\s*(€|EUR|Ks|Kč)/i) || (item.snippet || "").match(/(\d+[,.]\d+)/);
                            let price = pm ? parseFloat(pm[1].replace(',', '.')) : 0;

                            mergedOffers.set(domain, {
                                id: `booster-${mergedOffers.size}-${domain}`,
                                storeName: domain.split('.')[0].toUpperCase(),
                                storeLogo: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
                                url: item.link,
                                price: price,
                                currency: 'EUR',
                                title: item.title,
                                imageUrl: undefined
                            });
                        }
                    }
                }
            }

            return Array.from(mergedOffers.values())
                .filter(offer => {
                    if (offer.price > 0) return true;
                    const domain = getDomain(offer.url);
                    return majorStoreKeywords.some(k => domain.includes(k));
                })
                .slice(0, 15);

        } catch (error) {
            console.error('Serper API error:', error);
            return [];
        }
    }
}
