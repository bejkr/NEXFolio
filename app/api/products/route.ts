import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { calculateNexfolioScore, calculatePriceChange } from '@/lib/scoring';

const PAGE_SIZE = 25;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const expansion = searchParams.get('expansion') || '';
    const releaseYearStr = searchParams.get('year');
    const sortStr = searchParams.get('sort') || 'name_asc';
    const pageRaw = parseInt(searchParams.get('page') || '1', 10);
    const page = Math.max(1, isNaN(pageRaw) ? 1 : pageRaw);

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

        const [total, products] = await Promise.all([
            prisma.product.count({ where }),
            prisma.product.findMany({
                where,
                orderBy,
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE,
                include: {
                    priceHistory: {
                        orderBy: { date: 'desc' },
                        take: 60
                    }
                }
            })
        ]);

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
                    change30D: null
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

        const totalNum = Number(total);
        return NextResponse.json({
            products: productsWithMetrics,
            total: totalNum,
            page,
            pageSize: PAGE_SIZE,
            totalPages: Math.ceil(totalNum / PAGE_SIZE),
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
