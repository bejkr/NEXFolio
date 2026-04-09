'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, TrendingUp, Info, AlertTriangle, Check, Clock, ExternalLink } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function NotificationDropdown() {
    const { alerts, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'price': return <TrendingUp className="h-4 w-4 text-[#00E599]" />;
            case 'system': return <Info className="h-4 w-4 text-blue-400" />;
            case 'availability': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
            default: return <Bell className="h-4 w-4 text-gray-400" />;
        }
    };

    const recentAlerts = alerts.slice(0, 5);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-gray-400 hover:text-white transition-all relative p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] ${isOpen ? 'text-white bg-[rgba(255,255,255,0.05)]' : ''}`}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 min-w-[1rem] px-1 bg-primary text-[#0E1116] text-[10px] font-bold rounded-full border border-[#0E1116] flex items-center justify-center shadow-[0_0_8px_rgba(0,229,153,0.5)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-[#151A21] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[11px] font-semibold text-primary hover:text-white transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {recentAlerts.length > 0 ? (
                            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                                {recentAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors cursor-default group ${!alert.read ? 'bg-[#00E599]/[0.02]' : ''}`}
                                    >
                                        <div className="flex items-start">
                                            <div className={`p-1.5 rounded-lg bg-[#0E1116] border border-[rgba(255,255,255,0.06)] mr-3 mt-0.5`}>
                                                {getIcon(alert.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <p className={`text-sm font-semibold truncate ${!alert.read ? 'text-white' : 'text-gray-400'}`}>
                                                        {alert.title}
                                                    </p>
                                                    {!alert.read && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                markAsRead(alert.id);
                                                            }}
                                                            className="p-1 rounded-md text-gray-500 hover:text-primary transition-colors hover:bg-primary/10 opacity-0 group-hover:opacity-100"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                                                    {alert.description}
                                                </p>
                                                <div className="flex items-center text-[10px] text-gray-500">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 px-4 text-center">
                                <div className="h-12 w-12 rounded-full bg-[#0E1116] flex items-center justify-center mb-4 mx-auto border border-[rgba(255,255,255,0.06)]">
                                    <Bell className="h-6 w-6 text-gray-600" />
                                </div>
                                <p className="text-sm text-gray-400">No notifications yet</p>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/alerts"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-xs font-bold text-gray-400 hover:text-white border-t border-[rgba(255,255,255,0.06)] bg-[#0E1116]/50 hover:bg-[#0E1116] transition-all"
                    >
                        See all notifications
                        <ExternalLink className="h-3 w-3 inline-block ml-1 opacity-50" />
                    </Link>
                </div>
            )}
        </div>
    );
}
