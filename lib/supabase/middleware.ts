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
                        try {
                            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                            supabaseResponse = NextResponse.next({
                                request: {
                                    headers: request.headers,
                                },
                            })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            )
                        } catch (cookieError) {
                            console.error('Edge Middleware Cookie Error:', cookieError)
                        }
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const pathname = request.nextUrl.pathname;

        // Strict bypass for public assets, auth pages, tracking, api, etc.
        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
        const isHome = pathname === '/';
        const isApi = pathname.startsWith('/api');
        const isPublicFile = pathname.includes('.');

        if (!user && !isAuthRoute && !isHome && !isApi && !isPublicFile) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (e) {
        // CRITICAL FAILSAFE: If absolutely anything throws (network, edge runtime incompat, missing globals),
        // we log it and return a transparent response to prevent Vercel 500 INTERNAL_SERVER_ERROR.
        console.error('CRITICAL EDGE MIDDLEWARE EXCEPTION:', e);
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}
