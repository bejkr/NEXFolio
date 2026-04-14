'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { PortfolioSignals, PortfolioSignal } from '@/components/PortfolioSignals';

export function PortfolioSignalsTab() {
    const [signals, setSignals] = useState<PortfolioSignal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/signals')
            .then(r => r.ok ? r.json() : [])
            .then(data => { if (Array.isArray(data)) setSignals(data); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return <PortfolioSignals signals={signals} />;
}
