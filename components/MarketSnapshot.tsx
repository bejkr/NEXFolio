import { Card, CardContent } from '@/components/ui/card';
import { MarketSnapshotData } from '@/lib/mockData';
import { Activity } from 'lucide-react';

interface MarketSnapshotProps {
    data: MarketSnapshotData;
}

export function MarketSnapshot({ data }: MarketSnapshotProps) {
    return (
        <Card className="col-span-12 mt-8 bg-[#0E1116] border-t border-[rgba(255,255,255,0.06)] rounded-none shadow-none text-xs">
            <CardContent className="flex items-center justify-between py-4 px-0">
                <div className="flex space-x-8">
                    <div className="flex items-center space-x-2 text-gray-400">
                        <span className="font-medium text-gray-500 uppercase tracking-wider">Sealed Index:</span>
                        <span className={data.sealedIndex12M >= 0 ? 'text-success-text' : 'text-danger-text'}>
                            {data.sealedIndex12M >= 0 ? '+' : ''}{data.sealedIndex12M}% 12M
                        </span>
                    </div>
                </div>
                <div className="flex items-center text-gray-400">
                    <Activity className="h-4 w-4 mr-2" />
                    <span className="font-medium text-gray-500 uppercase tracking-wider mr-2">TCG Market Demand:</span>
                    <span>{data.marketLiquidityTrend}</span>
                </div>
            </CardContent>
        </Card>
    );
}
