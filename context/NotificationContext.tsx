'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAlerts, Alert } from '@/lib/mockData';

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
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteAlert: (id: string) => void;
    addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        // Merge mockAlerts with persisted read state from localStorage
        const readIds = getReadIds();
        setAlerts(mockAlerts.map(a => ({ ...a, read: readIds.has(a.id) ? true : a.read })));
    }, []);

    const unreadCount = alerts.filter(a => !a.read).length;

    const markAsRead = (id: string) => {
        setAlerts(prev => {
            const next = prev.map(a => a.id === id ? { ...a, read: true } : a);
            saveReadIds(new Set(next.filter(a => a.read).map(a => a.id)));
            return next;
        });
    };

    const markAllAsRead = () => {
        setAlerts(prev => {
            const next = prev.map(a => ({ ...a, read: true }));
            saveReadIds(new Set(next.map(a => a.id)));
            return next;
        });
    };

    const deleteAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const addAlert = (newAlert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => {
        const alert: Alert = {
            ...newAlert,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
        };
        setAlerts(prev => [alert, ...prev]);
    };

    return (
        <NotificationContext.Provider value={{
            alerts,
            unreadCount,
            markAsRead,
            markAllAsRead,
            deleteAlert,
            addAlert,
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
