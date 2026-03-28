import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    runtime: 'nodejs',
    matcher: [
        '/dashboard', '/dashboard/:path*',
        '/collection', '/collection/:path*',
        '/market', '/market/:path*',
        '/insights', '/insights/:path*',
        '/products', '/products/:path*',
        '/availability', '/availability/:path*',
        '/alerts', '/alerts/:path*',
        '/admin', '/admin/:path*',
        '/profile', '/profile/:path*',
        // Trailing slashes
        '/dashboard/',
        '/collection/',
        '/market/',
        '/insights/',
        '/products/',
        '/availability/',
        '/alerts/',
        '/admin/',
        '/profile/',
    ],
}
