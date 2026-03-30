import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    try {
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

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // This will refresh session if expired - required for Server Components
        // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const pathname = request.nextUrl.pathname;

        // Strict bypass for public assets already handled in root middleware,
        // but adding a safety check here for explicit auth redirection.
        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
        const isHome = pathname === '/';
        const isApi = pathname.startsWith('/api');

        if (!user && !isAuthRoute && !isHome && !isApi) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (e) {
        console.error('CRITICAL EDGE MIDDLEWARE EXCEPTION:', e);
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}

