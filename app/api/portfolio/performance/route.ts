import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '1M';

    try {
        const now = new Date();
        let startDate = new Date();
        let intervalDays = 1;

        switch (range) {
            case '1D':
                startDate.setDate(now.getDate() - 1);
                intervalDays = 1 / 24; // Hourly
                break;
            case '7D':
                startDate.setDate(now.getDate() - 7);
                intervalDays = 1;
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                intervalDays = 1;
                break;
            case '3M':
                startDate.setMonth(now.getMonth() - 3);
                intervalDays = 3;
                break;
            case '6M':
                startDate.setMonth(now.getMonth() - 6);
                intervalDays = 7;
                break;
            case 'MAX':
                // Find oldest purchase date
                const oldestAsset = await (prisma as any).userAsset.findFirst({
                    where: { userId: user.id },
                    orderBy: { purchaseDate: 'asc' }
                });
                startDate = oldestAsset ? new Date(oldestAsset.purchaseDate) : new Date(now.getFullYear(), 0, 1);
                const diffMs = now.getTime() - startDate.getTime();
                const diffDays = diffMs / (1000 * 60 * 60 * 24);
                intervalDays = Math.max(1, Math.ceil(diffDays / 30));
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
                intervalDays = 1;
        }

        // Fetch user assets
        const assets = await (prisma as any).userAsset.findMany({
            where: { userId: user.id },
            include: {
                product: {
                    include: {
                        priceHistory: {
                            orderBy: { date: 'asc' }
                        }
                    }
                }
            }
        });

        if (assets.length === 0) {
            return NextResponse.json([]);
        }

        const dataPoints: { month: string; value: number }[] = [];
        let currentPointDate = new Date(startDate);

        while (currentPointDate <= now) {
            let totalValue = 0;

            for (const asset of assets) {
                // If asset was purchased after this point, it adds no value
                if (new Date(asset.purchaseDate) > currentPointDate) {
                    continue;
                }

                // Find the latest price history for this product at or before currentPointDate
                const history = asset.product?.priceHistory || [];
                const latestPriceBefore = history
                    .filter((h: any) => new Date(h.date) <= currentPointDate)
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                if (latestPriceBefore) {
                    totalValue += latestPriceBefore.price;
                } else if (asset.product?.price) {
                    // Fallback to current price if no history yet (though slightly inaccurate for past)
                    totalValue += asset.product.price;
                } else {
                    totalValue += asset.currentValue || asset.costBasis;
                }
            }

            dataPoints.push({
                month: currentPointDate.toISOString(), // Component will format this
                value: Number(totalValue.toFixed(2))
            });

            // Advance date
            currentPointDate = new Date(currentPointDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);
        }

        // Add the very last point (current value) if not already close
        const lastPoint = dataPoints[dataPoints.length - 1];
        if (lastPoint && new Date(lastPoint.month).getTime() < now.getTime() - (intervalDays / 2) * 24 * 60 * 60 * 1000) {
           let totalValueNow = assets.reduce((sum: number, asset: any) => sum + (asset.product?.price ?? asset.currentValue), 0);
             dataPoints.push({
                month: now.toISOString(),
                value: Number(totalValueNow.toFixed(2))
            });
        }

        return NextResponse.json(dataPoints);

    } catch (error: any) {
        console.error('Portfolio Performance API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch performance data' }, { status: 500 });
    }
}
