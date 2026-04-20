"use client"

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError(error.message)
        } else {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', (await supabase.auth.getUser()).data.user?.id)
                .single()

            router.push(profile?.role === 'admin' ? "/admin/settings" : "/dashboard")
            router.refresh()
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#151A21] p-4 font-sans text-zinc-100">
            <div className="w-full max-w-md mb-4">
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00E599] transition-colors">
                    ← Back to website
                </Link>
            </div>
            <div className="w-full max-w-md bg-[#0E1116] border border-white/10 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-extrabold tracking-tight">
                        <span className="text-[#00E599]">NEX</span>
                        <span className="text-white">folio</span>
                    </Link>
                    <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-5">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-[#0E1116] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00E599]/30 focus:border-[#00E599]/40 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-[#0E1116] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00E599]/30 focus:border-[#00E599]/40 transition-all text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00E599] hover:bg-[#00cc88] text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 text-sm"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[#00E599] hover:opacity-80 font-medium transition-opacity">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}
