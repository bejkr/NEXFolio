'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUPPORTED_STORES } from '@/lib/store-discovery';
import { Settings, Save, CheckCircle2, AlertCircle, ShoppingBag } from "lucide-react";

export default function AdminSettingsPage() {
    const [activeStoreIds, setActiveStoreIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/stores');
                const data = await res.json();
                if (data.activeStoreIds) {
                    setActiveStoreIds(data.activeStoreIds);
                }
            } catch (error) {
                console.error("Failed to fetch store settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleStore = (id: string) => {
        setActiveStoreIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activeStoreIds })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Store settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save settings.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (loading) {
        return <div className="p-8 text-gray-400">Loading settings...</div>;
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <Settings className="w-8 h-8 mr-3 text-primary" /> Admin Settings
                    </h1>
                    <p className="text-gray-400 mt-2">Manage global configurations for Nexfolio.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-6 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-lg font-semibold text-white flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2 text-primary" /> Automatic Store Discovery
                    </CardTitle>
                    <p className="text-sm text-gray-500">Configure which stores should be searched automatically for relevant products.</p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {SUPPORTED_STORES.map((store) => (
                            <div
                                key={store.id}
                                onClick={() => toggleStore(store.id)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${activeStoreIds.includes(store.id)
                                    ? 'bg-primary/5 border-primary/30'
                                    : 'bg-white/5 border-white/10 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-2">
                                        <img src={store.logo} alt={store.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{store.name}</h4>
                                        <p className="text-xs text-gray-500">{store.domain}</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${activeStoreIds.includes(store.id) ? 'bg-primary' : 'bg-gray-700'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${activeStoreIds.includes(store.id) ? 'left-7' : 'left-1'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                    <h4 className="text-amber-500 font-bold text-sm">Caution: API Limits</h4>
                    <p className="text-xs text-gray-400 mt-1">
                        Enabling too many stores at once may increase page load times for users and may trigger rate limits on external APIs (like eBay).
                        It is recommended to keep only the most relevant stores active.
                    </p>
                </div>
            </div>
        </div>
    );
}
