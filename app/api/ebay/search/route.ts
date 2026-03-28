import { NextRequest, NextResponse } from 'next/server';
import { EbayClient } from '@/lib/ebay';

const ebayClient = new EbayClient();

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const results = await ebayClient.searchItems(query);

        if (!results.itemSummaries || results.itemSummaries.length === 0) {
            // --- Sandbox Fallback ---
            // The eBay Sandbox often has very limited inventory and lacks images.
            // If we find nothing in the sandbox, we return a mock response so the UI can be tested.
            if (process.env.EBAY_SANDBOX === 'true') {
                return NextResponse.json({
                    title: query,
                    price: 54.99,
                    currency: "USD",
                    itemId: "v1|mock123|0",
                    itemWebUrl: "https://sandbox.ebay.com",
                    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=400&auto=format&fit=crop",
                    location: { country: "US" },
                    condition: "New"
                });
            }
            return NextResponse.json({ message: 'No items found', price: null });
        }

        const firstItem = results.itemSummaries[0];
        return NextResponse.json({
            title: firstItem.title,
            price: parseFloat(firstItem.price.value),
            currency: firstItem.price.currency,
            itemId: firstItem.itemId,
            itemWebUrl: firstItem.itemWebUrl,
            imageUrl: firstItem.image?.imageUrl || firstItem.thumbnailImages?.[0]?.imageUrl,
            location: firstItem.itemLocation,
            condition: firstItem.condition
        });
    } catch (error: any) {
        console.error('eBay API Error:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Failed to fetch from eBay' }, { status: 500 });
    }
}
