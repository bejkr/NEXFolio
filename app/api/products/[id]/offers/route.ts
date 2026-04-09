import { NextRequest, NextResponse } from 'next/server';
import { StoreDiscoveryService } from '@/lib/store-discovery';
import prisma from '@/lib/prisma';

const discoveryService = new StoreDiscoveryService();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // 1. Fetch the product name from the database
        const product = await prisma.product.findUnique({
            where: { id },
            select: { name: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // 2. Discover offers automatically reading from settings
        let enabledStores = ['ebay', 'alza', 'sparky'];
        const fs = require('fs');
        const path = require('path');
        const settingsPath = path.join(process.cwd(), 'lib', 'settings.json');

        try {
            const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            if (settings.activeStoreIds) {
                enabledStores = settings.activeStoreIds;
            }
        } catch (e) {
            console.warn('Settings not found, using defaults.');
        }

        const offers = await discoveryService.discoverOffers(product.name, enabledStores);

        return NextResponse.json({ offers });
    } catch (error: any) {
        console.error('Offers API Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch offers' }, { status: 500 });
    }
}
