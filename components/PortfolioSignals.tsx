import Link from 'next/link';
import {
    TrendingUp, TrendingDown, AlertTriangle,
    Star, PieChart, ArrowUpRight, Zap, CheckCircle2
} from 'lucide-react';

export type SignalKind = 'profit' | 'risk' | 'momentum' | 'warn' | 'info';

export interface PortfolioSignal {
    id: string;
    kind: SignalKind;
    priority: number;   // 1 = high, 2 = medium, 3 = low
    title: string;
    body: string;
    tag?: string;       // asset name chip
    href?: string;
}

const CONFIG: Record<SignalKind, {
    icon: React.ReactNode;
    border: string;
    badge: string;
    dot: string;
}> = {
    profit: {
        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        border: 'border-l-emerald-500/60',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-400',
    },
    risk: {
        icon: <TrendingDown className="w-4 h-4 text-red-400" />,
        border: 'border-l-red-500/60',
        badge: 'bg-red-500/10 text-red-400 border-red-500/20',
        dot: 'bg-red-400',
    },
    momentum: {
        icon: <Zap className="w-4 h-4 text-blue-400" />,
        border: 'border-l-blue-500/60',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dot: 'bg-blue-400',
    },
    warn: {
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        border: 'border-l-amber-500/60',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        dot: 'bg-amber-400',
    },
    info: {
        icon: <Star className="w-4 h-4 text-violet-400" />,
        border: 'border-l-violet-500/60',
        badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
        dot: 'bg-violet-400',
    },
};

interface Props {
    signals: PortfolioSignal[];
}

export function PortfolioSignals({ signals }: Props) {
    return (
        <div className="bg-[#0E1116] border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-tight">Portfolio Signals</h3>
                        <p className="text-[11px] text-gray-500 leading-none mt-0.5">Insights from your collection data</p>
                    </div>
                </div>
                {signals.length > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {signals.length} signal{signals.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Signals list */}
            {signals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">All clear</p>
                    <p className="text-xs text-gray-500">No signals detected — portfolio looks balanced.</p>
                </div>
            ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {signals.map((signal) => {
                        const cfg = CONFIG[signal.kind];
                        const inner = (
                            <div
                                className={`flex items-start gap-3.5 px-5 py-3.5 border-l-2 ${cfg.border} hover:bg-white/[0.02] transition-colors ${signal.href ? 'cursor-pointer group' : ''}`}
                            >
                                {/* Icon */}
                                <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-[#151A21] border border-white/5 flex items-center justify-center">
                                    {cfg.icon}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-white leading-tight">{signal.title}</span>
                                        {signal.priority === 1 && (
                                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 leading-none">
                                                High
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{signal.body}</p>
                                    {signal.tag && (
                                        <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded border ${cfg.badge}`}>
                                            {signal.tag}
                                        </span>
                                    )}
                                </div>

                                {/* Arrow for linked signals */}
                                {signal.href && (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-300 transition-colors shrink-0 mt-1" />
                                )}
                            </div>
                        );

                        return signal.href ? (
                            <Link key={signal.id} href={signal.href}>{inner}</Link>
                        ) : (
                            <div key={signal.id}>{inner}</div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
