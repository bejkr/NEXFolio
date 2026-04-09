'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockAlerts, Alert } from '@/lib/mockData';

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
        // Initialize with mock data
        setAlerts(mockAlerts);
    }, []);

    const unreadCount = alerts.filter(a => !a.read).length;

    const markAsRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const markAllAsRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
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
