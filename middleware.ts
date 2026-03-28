import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
    // Pure bypass to test Vercel Edge Runtime stability
    // If this fails, the issue is Vercel project config or Next.js version limits,
    // not Supabase client code.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, png, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
