'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield, Calendar, Loader2 } from "lucide-react";

interface Profile {
    id: string;
    email: string | null;
    full_name: string | null;
    role: string | null;
    created_at: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 text-center text-gray-400">
                User profile not found.
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                        <User className="w-8 h-8 mr-3 text-primary" /> User Profile
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your personal information and account settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/5">
                        <CardTitle className="text-lg font-semibold text-white flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-primary" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                            <p className="text-white font-medium mt-1">{profile.full_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                            <p className="text-white font-medium mt-1">{profile.email || 'Not provided'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#0E1116] border-[rgba(255,255,255,0.06)] overflow-hidden">
                    <CardHeader className="bg-white/5 border-b border-white/5">
                        <CardTitle className="text-lg font-semibold text-white flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-primary" /> Account Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account Role</label>
                                <div className="mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${profile.role === 'admin'
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-white/10 text-white border border-white/10'
                                        }`}>
                                        {profile.role || 'User'}
                                    </span>
                                </div>
                            </div>
                            <Shield className={`w-8 h-8 ${profile.role === 'admin' ? 'text-primary opacity-20' : 'text-gray-600 opacity-20'}`} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</label>
                                <p className="text-white font-medium mt-1">
                                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <Calendar className="w-8 h-8 text-gray-600 opacity-20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-6 text-center">
                <p className="text-gray-400 text-sm italic">
                    More profile settings like password reset and account deletion are coming soon.
                </p>
            </div>
        </div>
    );
}
