'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AllocationData } from '@/lib/mockData';

interface PortfolioAllocationProps {
    data: AllocationData[];
}

const COLORS = ['#00E599', '#00B377', '#008055'];

export function PortfolioAllocation({ data }: PortfolioAllocationProps) {
    return (
        <Card className="flex flex-col h-full bg-[#151A21] border-[rgba(255,255,255,0.06)] rounded-xl">
            <CardHeader>
                <CardTitle>Collection Allocation</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                stroke="none"
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#151A21',
                                    borderColor: 'rgba(255,255,255,0.06)',
                                    color: '#E2E8F0',
                                    borderRadius: '8px'
                                }}
                                itemStyle={{ color: '#E2E8F0' }}
                                formatter={(value: number) => [`${value}%`, 'Allocation']}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value: string) => <span className="text-gray-400 ml-1 text-sm">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
