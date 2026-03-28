"use client"

export const dynamic = 'force-dynamic';

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [successMsg, setSuccessMsg] = useState<string | null>(null)

    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMsg(null)

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setError(error.message)
            } else {
                // Fetch user role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', (await supabase.auth.getUser()).data.user?.id)
                    .single()

                if (profile?.role === 'admin') {
                    router.push("/admin/settings")
                } else {
                    router.push("/dashboard")
                }
                router.refresh()
            }
        } else {
            // Overenie totožnosti hesiel pri registrácii
            if (password !== confirmPassword) {
                setError("Heslá sa nezhodujú.")
                setIsLoading(false)
                return
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })
            if (error) {
                setError(error.message)
            } else {
                setSuccessMsg("Registrácia bola úspešná! Skontrolujte si email na potvrdenie účtu.")
                setIsLogin(true)
            }
        }
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 font-sans text-zinc-100">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
                        Nexfolio
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        {isLogin ? "Prihláste sa do svojho účtu" : "Vytvorte si nový účet"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm p-3 rounded-lg mb-4">
                        {successMsg}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Celé meno</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    placeholder="Jozef Mak"
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="jozef@priklad.sk"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Heslo</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                                title="Zobraziť/skryť heslo"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Potvrdenie hesla</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-500" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-10 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                                    title="Zobraziť/skryť heslo"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center mt-6 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isLogin ? (
                            "Prihlásiť sa"
                        ) : (
                            "Zaregistrovať sa"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    {isLogin ? "Nemáte ešte účet?" : "Už máte účet?"}{" "}
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError(null)
                        }}
                        className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                    >
                        {isLogin ? "Zaregistrujte sa" : "Prihláste sa"}
                    </button>
                </div>
            </div>
        </div>
    )
}
