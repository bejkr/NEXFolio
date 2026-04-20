"use client"

export const dynamic = 'force-dynamic';

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    Mail, Lock, User, Loader2, Eye, EyeOff,
    CheckCircle2, TrendingUp, Bell, BarChart2, Shield
} from "lucide-react"
import Link from "next/link"

const PLAN_META: Record<string, { label: string; price: string; features: string[] }> = {
    pro: {
        label: "Pro",
        price: "€8/mo",
        features: ["Unlimited portfolio items", "Live prices & 12M history", "Watchlist & Price alerts", "Portfolio Signals & P&L Reports"],
    },
    premium: {
        label: "Premium",
        price: "€18/mo",
        features: ["Everything in Pro", "Unlimited watchlists", "Advanced market insights", "Reprint alerts & Export tools"],
    },
}

const LEFT_FEATURES = [
    { icon: TrendingUp, text: "Track real portfolio performance" },
    { icon: Bell,       text: "Get alerted before the market moves" },
    { icon: BarChart2,  text: "Full P&L reports & analytics" },
    { icon: Shield,     text: "Avoid bad buys with market signals" },
]

function InputField({
    label, type = "text", value, onChange, placeholder, icon: Icon,
    right,
}: {
    label: string
    type?: string
    value: string
    onChange: (v: string) => void
    placeholder: string
    icon: React.ElementType
    right?: React.ReactNode
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                    type={type}
                    required
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[#0E1116] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00E599]/30 focus:border-[#00E599]/40 transition-all text-sm"
                />
                {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
            </div>
        </div>
    )
}

function ToggleEye({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
        <button type="button" onClick={onToggle} className="text-gray-500 hover:text-gray-300 transition-colors">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
    )
}

function RegisterForm() {
    const searchParams = useSearchParams()
    const plan = searchParams.get("plan") ?? "free"
    const planMeta = PLAN_META[plan] ?? null

    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPw, setShowPw] = useState(false)
    const [showCPw, setShowCPw] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [done, setDone] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (password !== confirmPassword) { setError("Passwords do not match."); return }
        if (password.length < 8) { setError("Password must be at least 8 characters."); return }

        setIsLoading(true)
        const { error } = await supabase.auth.signUp({
            email, password,
            options: { data: { full_name: fullName } },
        })
        setIsLoading(false)
        if (error) setError(error.message)
        else setDone(true)
    }

    /* ── Success state ── */
    if (done) {
        return (
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-sm text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8 text-[#00E599]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            We sent a confirmation link to{" "}
                            <span className="text-white font-medium">{email}</span>.
                            Click it to activate your account.
                        </p>
                    </div>
                    <Link href="/login" className="inline-block text-sm text-[#00E599] hover:opacity-80 font-medium transition-opacity">
                        Back to sign in →
                    </Link>
                </div>
            </div>
        )
    }

    /* ── Form ── */
    return (
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
            <div className="w-full max-w-sm">

                {/* Plan badge */}
                {planMeta && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00E599] bg-[#00E599]/10 border border-[#00E599]/20 px-3 py-1 rounded-full mb-5">
                        {planMeta.label} — {planMeta.price}
                    </div>
                )}

                <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
                <p className="text-gray-500 text-sm mb-7">
                    {planMeta ? "Start free, upgrade after email confirmation." : "Free forever. No credit card required."}
                </p>

                {/* Plan features */}
                {planMeta && (
                    <div className="mb-6 space-y-2">
                        {planMeta.features.map(f => (
                            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E599] shrink-0" />
                                {f}
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="mb-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Full name" value={fullName} onChange={setFullName}
                        placeholder="John Doe" icon={User} />
                    <InputField label="Email" type="email" value={email} onChange={setEmail}
                        placeholder="you@example.com" icon={Mail} />
                    <InputField label="Password" type={showPw ? "text" : "password"} value={password}
                        onChange={setPassword} placeholder="Min. 8 characters" icon={Lock}
                        right={<ToggleEye show={showPw} onToggle={() => setShowPw(v => !v)} />} />
                    <InputField label="Confirm password" type={showCPw ? "text" : "password"} value={confirmPassword}
                        onChange={setConfirmPassword} placeholder="••••••••" icon={Lock}
                        right={<ToggleEye show={showCPw} onToggle={() => setShowCPw(v => !v)} />} />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#00E599] hover:bg-[#00cc88] text-black font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-60 text-sm"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[#00E599] hover:opacity-80 font-medium transition-opacity">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

/* ── Left branding panel ── */
function LeftPanel() {
    return (
        <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#0E1116] border-r border-white/6 p-12 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#00E599]/6 blur-[100px] rounded-full pointer-events-none" />

            {/* Logo */}
            <Link href="/" className="text-xl font-extrabold tracking-tight">
                <span className="text-[#00E599]">NEX</span>
                <span className="text-white">folio</span>
            </Link>

            {/* Main copy */}
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                        Your TCG portfolio,<br />
                        <span className="text-[#00E599]">professionally tracked.</span>
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Stop guessing. Start making data-driven decisions on your collection.
                    </p>
                </div>

                <div className="space-y-4">
                    {LEFT_FEATURES.map(({ icon: Icon, text }) => (
                        <div key={text} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#00E599]/10 border border-[#00E599]/15 flex items-center justify-center shrink-0">
                                <Icon className="w-4 h-4 text-[#00E599]" />
                            </div>
                            <span className="text-sm text-gray-300">{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social proof */}
            <div className="text-xs text-gray-600">
                Trusted by collectors across Europe
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-[#151A21] flex">
            <LeftPanel />
            <div className="flex-1 flex flex-col bg-[#151A21] relative">
                {/* Top bar */}
                <div className="flex items-center justify-between p-6">
                    <Link href="/" className="lg:hidden text-xl font-extrabold tracking-tight">
                        <span className="text-[#00E599]">NEX</span>
                        <span className="text-white">folio</span>
                    </Link>
                    <Link href="/" className="ml-auto text-sm text-gray-500 hover:text-[#00E599] transition-colors">
                        ← Back to website
                    </Link>
                </div>
                <Suspense>
                    <RegisterForm />
                </Suspense>
            </div>
        </div>
    )
}
