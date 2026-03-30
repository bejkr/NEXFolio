import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Explicitly allow all _next and static assets
    if (pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next()
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        '/dashboard',
        '/dashboard/:path*',
        '/collection',
        '/collection/:path*',
        '/market',
        '/market/:path*',
        '/insights',
        '/insights/:path*',
        '/products',
        '/products/:path*',
        '/availability',
        '/availability/:path*',
        '/alerts',
        '/alerts/:path*',
        '/admin',
        '/admin/:path*',
        '/profile',
        '/profile/:path*',
    ],
}


