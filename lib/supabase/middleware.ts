import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
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
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        const pathname = request.nextUrl.pathname;

        // Avoid redirecting if the user is already on a public/auth route
        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
        const isHome = pathname === '/';
        const isApi = pathname.startsWith('/api');
        const isPublicFile = pathname.includes('.');

        if (!user && !isAuthRoute && !isHome && !isApi && !isPublicFile) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    } catch (error) {
        console.error('Middleware session error:', error);
    }

    return supabaseResponse
}
