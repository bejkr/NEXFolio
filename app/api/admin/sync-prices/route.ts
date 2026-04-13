import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { PriceSyncService } from '@/lib/price-sync';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const denied = await requireAdmin(req);
    if (denied) return denied;

    try {
        const result = await PriceSyncService.syncPrices();
        return NextResponse.json({
            message: 'Price sync completed',
            ...result
        });
    } catch (error: any) {
        console.error('Price Sync Error:', error);
        return NextResponse.json({ error: 'Failed to sync prices' }, { status: 500 });
    }
}
