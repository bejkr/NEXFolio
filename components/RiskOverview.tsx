import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VolatilityData } from '@/lib/mockData';

interface RiskOverviewProps {
    data: VolatilityData[];
}

export function RiskOverview({ data }: RiskOverviewProps) {
    // Find highest value for relative bar sizing
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Risk Overview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        Portfolio volatility distribution remains stable. The majority of assets fall within the 5-15% variance range, indicating a balanced risk-adjusted return profile typical of an institutional-grade collection.
                    </p>

                    <div className="space-y-3">
                        {data.map((item, i) => {
                            const width = `${(item.value / maxValue) * 100}%`;
                            // Gradient-like colors manually picked
                            const barColors = ['bg-[#1E3A2F]', 'bg-[#254236]', 'bg-[#2B4B3D]', 'bg-[#325344]', 'bg-[#385B4B]'];
                            const colorClass = barColors[i % barColors.length];

                            return (
                                <div key={item.range} className="flex items-center text-sm">
                                    <div className="w-16 font-medium text-gray-400">{item.range}</div>
                                    <div className="flex-1 ml-4 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${colorClass} rounded-full`}
                                            style={{ width }}
                                        />
                                    </div>
                                    <div className="w-10 text-right text-gray-300 ml-4 font-medium">{item.value}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
