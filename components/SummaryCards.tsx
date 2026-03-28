import { PortfolioSummary } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SummaryCardsProps {
    data: PortfolioSummary;
}

export function SummaryCards({ data }: SummaryCardsProps) {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 w-full">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Total Collection Value</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-white mb-1">{formatCurrency(data.totalValue)}</div>
                    <p className="text-xs text-gray-500">Updated today</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Unrealized Gain/Loss</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-white mb-1">
                        {data.unrealizedGainLoss.value > 0 ? '+' : ''}{formatCurrency(data.unrealizedGainLoss.value)}
                    </div>
                    <div className="flex items-center text-xs font-medium text-success-text">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {data.unrealizedGainLoss.percentage}%
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>12M CAGR</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-white mb-1">
                        {data.cagr12M > 0 ? '+' : ''}{data.cagr12M.toFixed(1)}%
                    </div>
                    <div className="flex items-center text-xs font-medium text-success-text">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        Trend positive
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>Portfolio Volatility</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-white mb-1">
                        {data.volatilityIndex.toFixed(1)}%
                    </div>
                    <p className="text-xs text-gray-500">Within acceptable range</p>
                </CardContent>
            </Card>
        </div>
    );
}
