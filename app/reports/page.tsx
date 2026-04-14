import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, BarChart3, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculatePriceChange } from '@/lib/scoring';

export const metadata: Metadata = { title: 'Reports | Nexfolio' };
export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const assets = await (prisma as any).userAsset.findMany({
        where: { userId: user.id },
        include: { product: { include: { priceHistory: { orderBy: { date: 'desc' }, take: 60 } } } },
        orderBy: { createdAt: 'desc' },
    });

    // Per-asset metrics
    const rows = assets.map((a: any) => {
        const price = a.product?.price ?? a.currentValue;
        const qty = a.quantity || 1;
        const costBasis = a.costBasis * qty;
        const currentValue = price * qty;
        const pnl = currentValue - costBasis;
        const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        const history = a.product?.priceHistory || [];
        const change30D = calculatePriceChange(history, 30);
        const change12M = calculatePriceChange(history, 365);

        return { a, price, qty, costBasis, currentValue, pnl, pnlPct, change30D, change12M };
    });

    // Summary totals
    const totalCost    = rows.reduce((s: number, r: any) => s + r.costBasis, 0);
    const totalValue   = rows.reduce((s: number, r: any) => s + r.currentValue, 0);
    const totalPnl     = totalValue - totalCost;
    const totalPnlPct  = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

    const winners  = rows.filter((r: any) => r.pnl > 0);
    const losers   = rows.filter((r: any) => r.pnl < 0);
    const bestItem = [...rows].sort((a: any, b: any) => b.pnlPct - a.pnlPct)[0];
    const worstItem = [...rows].sort((a: any, b: any) => a.pnlPct - b.pnlPct)[0];

    const fmt = (v: number) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);
    const fmtPct = (v: number | null) => v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
    const clr = (v: number | null) => v == null ? 'text-gray-500' : v >= 0 ? 'text-emerald-400' : 'text-red-400';

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Reports</h1>
                <p className="text-gray-400 mt-1 text-sm">Portfolio P&L summary based on your collection and live market prices.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invested', value: fmt(totalCost), sub: `${assets.length} assets`, icon: Wallet, color: 'text-blue-400' },
                    { label: 'Current Value', value: fmt(totalValue), sub: 'at market price', icon: BarChart3, color: 'text-primary' },
                    { label: 'Unrealized P&L', value: fmt(totalPnl), sub: fmtPct(totalPnlPct), icon: totalPnl >= 0 ? ArrowUpRight : ArrowDownRight, color: totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400', pnl: true },
                    { label: 'Win Rate', value: `${rows.length > 0 ? Math.round((winners.length / rows.length) * 100) : 0}%`, sub: `${winners.length}W / ${losers.length}L`, icon: TrendingUp, color: 'text-amber-400' },
                ].map(({ label, value, sub, icon: Icon, color, pnl }) => (
                    <Card key={label} className="bg-[#0E1116] border-[rgba(255,255,255,0.06)]">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
                                <Icon className={`w-4 h-4 ${color}`} />
                            </div>
                            <p className={`text-2xl font-bold tracking-tight ${pnl ? (totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-white'}`}>{value}</p>
                            <p className={`text-xs mt-1 ${pnl ? (totalPnl >= 0 ? 'text-emerald-400/70' : 'text-red-400/70') : 'text-gray-500'}`}>{sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Best / Worst */}
            {(bestItem || worstItem) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {bestItem && (
                        <Card className="bg-[#0E1116] border-emerald-500/20">
                            <CardContent className="p-5">
                                <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2 font-semibold">Best Performer</p>
                                <p className="text-white font-semibold truncate">{bestItem.a.name}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-400">{fmt(bestItem.costBasis)} → {fmt(bestItem.currentValue)}</span>
                                    <span className="text-emerald-400 font-bold">{fmtPct(bestItem.pnlPct)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {worstItem && (
                        <Card className="bg-[#0E1116] border-red-500/20">
                            <CardContent className="p-5">
                                <p className="text-xs text-red-400 uppercase tracking-wider mb-2 font-semibold">Worst Performer</p>
                                <p className="text-white font-semibold truncate">{worstItem.a.name}</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-400">{fmt(worstItem.costBasis)} → {fmt(worstItem.currentValue)}</span>
                                    <span className="text-red-400 font-bold">{fmtPct(worstItem.pnlPct)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* P&L Table */}
            <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)]">
                <CardHeader className="border-b border-[rgba(255,255,255,0.06)] pb-4">
                    <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">Asset Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {rows.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <Package className="w-10 h-10 mb-3 opacity-40" />
                            <p className="text-sm">No assets in your collection yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[rgba(255,255,255,0.06)]">
                                        {['Asset', 'Category', 'Qty', 'Cost Basis', 'Current Value', 'P&L', 'P&L %', '30D', '12M'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                                    {rows.map(({ a, qty, costBasis, currentValue, pnl, pnlPct, change30D, change12M }: any) => (
                                        <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-[#151A21] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                        {a.product?.imageUrl ? (
                                                            <img src={`/api/proxy-image?url=${encodeURIComponent(a.product.imageUrl)}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <span className="text-gray-200 font-medium max-w-[200px] truncate">{a.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">{a.category}</span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">{qty}</td>
                                            <td className="px-4 py-3 text-gray-300">{fmt(costBasis)}</td>
                                            <td className="px-4 py-3 text-gray-200 font-medium">{fmt(currentValue)}</td>
                                            <td className={`px-4 py-3 font-semibold ${clr(pnl)}`}>{pnl >= 0 ? '+' : ''}{fmt(pnl)}</td>
                                            <td className={`px-4 py-3 font-semibold ${clr(pnlPct)}`}>{fmtPct(pnlPct)}</td>
                                            <td className={`px-4 py-3 ${clr(change30D)}`}>{fmtPct(change30D)}</td>
                                            <td className={`px-4 py-3 ${clr(change12M)}`}>{fmtPct(change12M)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t border-[rgba(255,255,255,0.08)]">
                                    <tr className="bg-[#151A21]/40">
                                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</td>
                                        <td className="px-4 py-3 text-gray-300 font-medium">{fmt(totalCost)}</td>
                                        <td className="px-4 py-3 text-gray-200 font-semibold">{fmt(totalValue)}</td>
                                        <td className={`px-4 py-3 font-bold ${clr(totalPnl)}`}>{totalPnl >= 0 ? '+' : ''}{fmt(totalPnl)}</td>
                                        <td className={`px-4 py-3 font-bold ${clr(totalPnlPct)}`}>{fmtPct(totalPnlPct)}</td>
                                        <td colSpan={2} />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
