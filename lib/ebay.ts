import axios from 'axios';

interface EbayTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface EbaySearchResponse {
    itemSummaries?: Array<{
        itemId: string;
        title: string;
        price: {
            value: string;
            currency: string;
        };
        image?: { imageUrl: string };
        thumbnailImages?: Array<{ imageUrl: string }>;
        itemWebUrl: string;
        itemLocation?: {
            country: string;
            city?: string;
            postalCode?: string;
        };
        condition?: string;
        categories?: Array<{ categoryId: string, categoryName: string }>;
    }>;
    total: number;
}

export class EbayClient {
    private clientId: string;
    private clientSecret: string;
    public isSandbox: boolean;
    private accessToken: string | null = null;
    private tokenExpiry: number | null = null;

    constructor() {
        this.clientId = process.env.EBAY_CLIENT_ID || '';
        this.clientSecret = process.env.EBAY_CLIENT_SECRET || '';
        this.isSandbox = process.env.EBAY_SANDBOX === 'true';

        if (!this.clientId || !this.clientSecret) {
            console.warn('eBay credentials not found in environment variables.');
        }
    }

    private get baseUrl() {
        return this.isSandbox ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com';
    }

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        const response = await axios.post<EbayTokenResponse>(
            `${this.baseUrl}/identity/v1/oauth2/token`,
            'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
        return this.accessToken;
    }

    async searchItems(q: string): Promise<EbaySearchResponse> {
        const token = await this.getAccessToken();
        const response = await axios.get<EbaySearchResponse>(
            `${this.baseUrl}/buy/browse/v1/item_summary/search`,
            {
                params: { q, limit: 1 },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Language': 'en-US',
                },
            }
        );
        return response.data;
    }

    async getItem(itemId: string): Promise<any> {
        const token = await this.getAccessToken();
        const response = await axios.get(
            `${this.baseUrl}/buy/browse/v1/item/${itemId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Language': 'en-US',
                },
            }
        );
        return response.data;
    }

    async getItemPrice(itemId: string): Promise<{ value: number, currency: string }> {
        const item = await this.getItem(itemId);
        return {
            value: parseFloat(item.price.value),
            currency: item.price.currency
        };
    }
}
