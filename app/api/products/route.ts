import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { calculateNexfolioScore, calculatePriceChange } from '@/lib/scoring';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const expansion = searchParams.get('expansion') || '';
    const releaseYearStr = searchParams.get('year');
    const sortStr = searchParams.get('sort') || 'name_asc';

    try {
        const where: Prisma.ProductWhereInput = {};

        if (query) {
            where.name = { contains: query, mode: 'insensitive' };
        }

        if (expansion && expansion !== 'all') {
            where.expansion = { equals: expansion, mode: 'insensitive' };
        }

        if (releaseYearStr && releaseYearStr !== 'all') {
            const year = parseInt(releaseYearStr, 10);
            if (!isNaN(year)) {
                where.releaseYear = year;
            }
        }

        let orderBy: Prisma.ProductOrderByWithRelationInput = {};
        if (sortStr === 'name_asc') {
            orderBy = { name: 'asc' };
        } else if (sortStr === 'name_desc') {
            orderBy = { name: 'desc' };
        } else if (sortStr === 'year_desc') {
            orderBy = { releaseYear: 'desc' };
        } else if (sortStr === 'year_asc') {
            orderBy = { releaseYear: 'asc' };
        }

        const products = await prisma.product.findMany({
            where,
            orderBy,
            take: 50,
            include: {
                priceHistory: {
                    orderBy: {
                        date: 'desc'
                    },
                    take: 60
                }
            }
        });

        // Calculate real metrics for each product with safety
        const productsWithMetrics = products.map(p => {
            try {
                return {
                    ...p,
                    nexfolioScore: calculateNexfolioScore(p, p.priceHistory || []),
                    change30D: calculatePriceChange(p.priceHistory || [], 30)
                };
            } catch (err) {
                console.error(`Scoring error for product ${p.id}:`, err);
                return {
                    ...p,
                    nexfolioScore: 50,
                    change30D: 0
                };
            }
        });

        // Also fetch unique sets and years for the filter dropdowns
        const uniqueSets = await prisma.product.groupBy({
            by: ['expansion'],
            _count: {
                _all: true
            },
            orderBy: {
                _count: {
                    expansion: 'desc'
                }
            }
        });

        const uniqueYears = await prisma.product.findMany({
            where: { releaseYear: { not: null } },
            select: { releaseYear: true },
            distinct: ['releaseYear'],
            orderBy: { releaseYear: 'desc' }
        });

        const mainSets: string[] = [];
        const otherSets: string[] = [];

        uniqueSets.forEach((s: any) => {
            if (s._count._all >= 10) {
                mainSets.push(s.expansion);
            } else {
                otherSets.push(s.expansion);
            }
        });

        return NextResponse.json({
            products: productsWithMetrics,
            filters: {
                expansions: { main: mainSets, other: otherSets },
                years: uniqueYears.map(y => y.releaseYear).filter(Boolean) as number[]
            }
        });

    } catch (error: any) {
        console.error('API /api/products Error:', error);
        return NextResponse.json({ error: 'Failed to fetch products from database', details: error.message }, { status: 500 });
    }
}
