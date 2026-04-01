'use client';

import { useState } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';

interface DashboardHeaderProps {
    lastSync?: Date;
}

export function DashboardHeader({ lastSync }: DashboardHeaderProps) {
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const res = await fetch('/api/admin/sync-prices', { method: 'POST' });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Collection Overview</h1>
                {lastSync && (
                    <p className="text-xs text-emerald-400 mt-1 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
                        Live Market Data Synced {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
            <div className="flex items-center space-x-3">
                <button className="bg-[#151A21] text-gray-300 border border-[rgba(255,255,255,0.06)] hover:bg-white/[0.02] hover:text-white transition-colors rounded-md px-4 py-2 text-sm font-medium">
                    Export
                </button>
                <button
                    disabled={syncing}
                    onClick={handleSync}
                    className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors rounded-md px-4 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    Sync Now
                </button>
            </div>
        </div>
    );
}
