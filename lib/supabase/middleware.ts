import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return supabaseResponse;
    }

    try {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        supabaseResponse = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        supabaseResponse.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        supabaseResponse = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        supabaseResponse.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Chránené routy. Ak je to /dashboard, /collection atď, musíme kontrolovať login
        const isAuthRoute = request.nextUrl.pathname.startsWith('/login')
        const isApiRoute = request.nextUrl.pathname.startsWith('/api')
        const isPublicAsset = request.nextUrl.pathname.match(/\.(.*)$/)
        const isHome = request.nextUrl.pathname === '/'

        if (
            !user &&
            !isAuthRoute &&
            !isApiRoute &&
            !isPublicAsset &&
            !isHome
        ) {
            // Používateľ nie je prihlásený a nesnaží sa ísť na verejne dostupné stránky.
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    } catch (e) {
        // Ak zlyhá authentifikácia (napr. zlá URL v env), len pokračujeme ďalej 
        // a necháme Server Componenty aby si s tým poradili (zobrazia login prompt)
        console.error('Middleware error:', e);
    }

    return supabaseResponse
}
