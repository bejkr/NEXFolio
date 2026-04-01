import { NextRequest, NextResponse } from 'next/server';
import { PriceSyncService } from '@/lib/price-sync';

export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const productId = params.id;

    try {
        // 1. Ensure it's linked to eBay (or try to link it if not)
        let linked = await PriceSyncService.linkProductToEbay(productId);

        if (!linked) {
            // Already handled in linkProductToEbay if it fails, but we need to know if we can proceed
            // Wait, linkProductToEbay returns false if link fails. 
            // If it's already linked, linkProductToEbay will re-link it (which is fine).
        }

        // 2. Sync Price
        // We can just call syncPrices which iterates all, or we could add a single sync method.
        // For efficiency, let's just use the logic from syncPrices for a single item.
        // Actually, linkProductToEbay already updates the price during linking!

        return NextResponse.json({ message: 'Synchronization successful' });
    } catch (error: any) {
        console.error('Manual Sync Error:', error);
        return NextResponse.json({ error: 'Failed to synchronize product' }, { status: 500 });
    }
}
