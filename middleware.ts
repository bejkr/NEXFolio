import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Use explicit matchers to avoid Vercel Edge regex catastrophic backtracking
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/collection/:path*',
        '/market/:path*',
        '/insights/:path*',
        '/products/:path*',
        '/availability/:path*',
        '/alerts/:path*',
        '/admin/:path*',
        '/profile/:path*',
    ],
}

export async function middleware(request: NextRequest) {
    try {
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
                        try {
                            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                            supabaseResponse = NextResponse.next({ request })
                            cookiesToSet.forEach(({ name, value, options }) =>
                                supabaseResponse.cookies.set(name, value, options)
                            )
                        } catch (cookieError) {
                            console.error('Middleware cookie error:', cookieError)
                        }
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        return supabaseResponse
    } catch (e) {
        console.error('CRITICAL MIDDLEWARE EXCEPTION:', e);
        return NextResponse.next();
    }
}
