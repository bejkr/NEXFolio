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

    try {
        // This will refresh session if expired - essential for Server Components
        // to have a valid session.
        const {
            data: { user },
        } = await supabase.auth.getUser()

        const pathname = request.nextUrl.pathname;
        const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
        const isApiRoute = pathname.startsWith('/api');
        const isPublicAsset = pathname.includes('.') || pathname.startsWith('/_next');
        const isHome = pathname === '/';

        if (
            !user &&
            !isAuthRoute &&
            !isApiRoute &&
            !isPublicAsset &&
            !isHome
        ) {
            // no user, potentially respond by redirecting the user to the login page
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    } catch (error) {
        // If anything fails, return the original response to avoid crashing the middleware
        console.error('Middleware session refresh error:', error);
    }

    return supabaseResponse
}
