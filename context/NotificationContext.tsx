'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from '@/lib/mockData';

const READ_KEY = 'nexfolio_read_notifications';

function getReadIds(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const stored = localStorage.getItem(READ_KEY);
        return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
        return new Set();
    }
}

function saveReadIds(ids: Set<string>) {
    try {
        localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
    } catch {}
}

interface NotificationContextType {
    alerts: Alert[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteAlert: (id: string) => void;
    addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
    refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch('/api/alerts');
            if (!res.ok) return;
            const data: Alert[] = await res.json();
            setAlerts(data);
        } catch {
            // user not logged in or network error — silently ignore
        } finally {
            setLoading(false);
        }
    }, []);

    const generateAndFetch = useCallback(async () => {
        try {
            // Generate new alerts from price history (idempotent / deduplicated server-side)
            await fetch('/api/alerts/generate', { method: 'POST' });
        } catch {
            // silently ignore
        }
        await fetchAlerts();
    }, [fetchAlerts]);

    useEffect(() => {
        generateAndFetch();
    }, [generateAndFetch]);

    const unreadCount = alerts.filter(a => !a.read).length;

    const markAsRead = async (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
        try {
            const res = await fetch(`/api/alerts/${id}`, { method: 'PATCH' });
            if (!res.ok) await fetchAlerts();
        } catch {
            await fetchAlerts();
        }
    };

    const markAllAsRead = async () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
        try {
            const res = await fetch('/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark-all-read' }),
            });
            if (!res.ok) await fetchAlerts();
        } catch {
            await fetchAlerts();
        }
    };

    const deleteAlert = async (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
        try {
            await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
        } catch {
            await fetchAlerts();
        }
    };

    // addAlert: used for manual/system alerts (no DB persist needed for now)
    const addAlert = (newAlert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
        const alert: Alert = {
            ...newAlert,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
        };
        setAlerts(prev => [alert, ...prev]);
    };

    const refresh = useCallback(() => {
        generateAndFetch();
    }, [generateAndFetch]);

    return (
        <NotificationContext.Provider value={{
            alerts,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            deleteAlert,
            addAlert,
            refresh,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
