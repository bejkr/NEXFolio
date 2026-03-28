'use client';

import { Bell, TrendingUp, Info, AlertTriangle, Check, Clock, Trash2 } from 'lucide-react';
import { mockAlerts, Alert } from '@/lib/mockData';
import { useState } from 'react';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
    const [activeTab, setActiveTab] = useState<'all' | 'price' | 'system' | 'availability'>('all');

    const filteredAlerts = alerts.filter(alert =>
        activeTab === 'all' ? true : alert.type === activeTab
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'price': return <TrendingUp className="h-5 w-5 text-[#00E599]" />;
            case 'system': return <Info className="h-5 w-5 text-blue-400" />;
            case 'availability': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
            default: return <Bell className="h-5 w-5 text-gray-400" />;
        }
    };

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'critical': return 'border-l-4 border-red-500 bg-red-500/5';
            case 'warning': return 'border-l-4 border-orange-500 bg-orange-500/5';
            case 'info': return 'border-l-4 border-[#00E599] bg-[#00E599]/5';
            default: return 'border-l-4 border-gray-600';
        }
    };

    const markAsRead = (id: string) => {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    };

    const deleteAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-IE', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Alerts & Notifications</h1>
                    <p className="text-sm text-gray-400">Stay updated on price changes, stock availability, and system updates.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setAlerts(prev => prev.map(a => ({ ...a, read: true })))}
                        className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 mb-6 border-b border-[rgba(255,255,255,0.06)] overflow-x-auto pb-px scrollbar-hide">
                {(['all', 'price', 'availability', 'system'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-all relative capitalize ${activeTab === tab ? 'text-[#00E599]' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00E599] shadow-[0_0_8px_rgba(0,229,153,0.5)]"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert.id}
                            className={`group rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#151A21]/50 backdrop-blur-sm transition-all hover:bg-[#151A21] overflow-hidden ${getSeverityStyles(alert.severity)} ${!alert.read ? 'ring-1 ring-[#00E599]/20 shadow-[0_0_15px_rgba(0,229,153,0.05)]' : 'opacity-80'}`}
                        >
                            <div className="p-4 flex items-start">
                                <div className={`p-2 rounded-lg bg-[#0E1116] border border-[rgba(255,255,255,0.06)] mr-4 mt-0.5 group-hover:scale-110 transition-transform`}>
                                    {getIcon(alert.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold truncate pr-4 ${!alert.read ? 'text-white' : 'text-gray-300'}`}>
                                            {alert.title}
                                            {!alert.read && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-[#00E599] animate-pulse"></span>}
                                        </h3>
                                        <div className="flex items-center space-x-1 shrink-0">
                                            <span className="text-[11px] font-medium text-gray-500 flex items-center mr-2">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatTime(alert.timestamp)}
                                            </span>
                                            <button
                                                onClick={() => markAsRead(alert.id)}
                                                disabled={alert.read}
                                                className={`p-1.5 rounded-md transition-colors ${alert.read ? 'text-gray-700 cursor-not-allowed' : 'text-gray-500 hover:text-[#00E599] hover:bg-[#00E599]/10'}`}
                                                title="Mark as read"
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteAlert(alert.id)}
                                                className="p-1.5 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
                                        {alert.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-[rgba(255,255,255,0.06)] rounded-2xl bg-[#151A21]/30">
                        <div className="h-16 w-16 rounded-full bg-[#151A21] flex items-center justify-center mb-6 border border-[rgba(255,255,255,0.08)]">
                            <Bell className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No alerts found</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto">
                            You're all caught up! When new alerts arrive, they'll appear here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
