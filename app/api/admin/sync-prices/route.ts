import { NextRequest, NextResponse } from 'next/server';
import { PriceSyncService } from '@/lib/price-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // In a real app we'd add authentication here (e.g. check for admin role)
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
