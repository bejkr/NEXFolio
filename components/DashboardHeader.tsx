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

    return null;
}
