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
        </div>
    );
}
