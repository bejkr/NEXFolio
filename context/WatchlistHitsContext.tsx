'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface WatchlistItem {
    id: string;
    productId: string;
    name: string;
    price: number | null;
    targetPrice: number | null;
    change30D: number | null;
    imageUrl: string | null;
    expansion: string | null;
    nexfolioScore: number;
}

interface WatchlistHitsCtx {
    hits: WatchlistItem[];       // price ≤ targetPrice
    near: WatchlistItem[];       // price ≤ targetPrice * 1.10 (within 10%)
    totalAlerts: number;
    loading: boolean;
    refresh: () => void;
}

const WatchlistHitsContext = createContext<WatchlistHitsCtx>({
    hits: [], near: [], totalAlerts: 0, loading: false, refresh: () => {},
});

export function WatchlistHitsProvider({ children }: { children: React.ReactNode }) {
    const [hits, setHits] = useState<WatchlistItem[]>([]);
    const [near, setNear] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(() => {
        setLoading(true);
        fetch('/api/watchlist')
            .then(r => r.ok ? r.json() : [])
            .then((items: WatchlistItem[]) => {
                if (!Array.isArray(items)) return;
                const newHits: WatchlistItem[] = [];
                const newNear: WatchlistItem[] = [];
                for (const item of items) {
                    if (item.targetPrice == null || item.price == null) continue;
                    if (item.price <= item.targetPrice) {
                        newHits.push(item);
                    } else if (item.price <= item.targetPrice * 1.10) {
                        newNear.push(item);
                    }
                }
                setHits(newHits);
                setNear(newNear);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return (
        <WatchlistHitsContext.Provider value={{ hits, near, totalAlerts: hits.length + near.length, loading, refresh }}>
            {children}
        </WatchlistHitsContext.Provider>
    );
}

export const useWatchlistHits = () => useContext(WatchlistHitsContext);
