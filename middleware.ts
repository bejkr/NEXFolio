import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    return await updateSession(request)
}

export const config = {
    runtime: 'nodejs',
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
