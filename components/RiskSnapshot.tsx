import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskMetrics } from '@/lib/mockData';

interface RiskSnapshotProps {
    data: RiskMetrics;
}

export function RiskSnapshot({ data }: RiskSnapshotProps) {
    return (
        <Card className="h-full flex flex-col justify-between">
            <CardHeader>
                <CardTitle>Collection Risk Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-400">Price Volatility</span>
                            <span className="text-gray-300 font-medium">{data.volatility}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0E1116] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00E599] to-[#00B377] rounded-full shadow-[0_0_8px_rgba(0,229,153,0.3)]" style={{ width: `${data.volatility * 3}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-400">Demand Score</span>
                            <span className="text-gray-300 font-medium">{data.liquidityScore}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0E1116] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00B377] to-[#008055] rounded-full shadow-[0_0_8px_rgba(0,179,119,0.3)]" style={{ width: `${data.liquidityScore}%` }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-gray-400">Condition Concentration</span>
                            <span className="text-gray-300 font-medium">{data.concentrationIndex}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#0E1116] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#00E599] to-[#008055] rounded-full shadow-[0_0_8px_rgba(0,229,153,0.3)]" style={{ width: `${data.concentrationIndex}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    <p className="text-[13px] text-gray-500 leading-relaxed italic">
                        "{data.analyticalText}"
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
