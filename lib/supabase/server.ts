import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    // Mobile clients send a Bearer token instead of cookies
    const headerStore = headers()
    const authorization = headerStore.get('authorization')
    const bearerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

    if (bearerToken) {
        return createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: { get: () => undefined, set: () => {}, remove: () => {} },
            global: { headers: { Authorization: `Bearer ${bearerToken}` } },
        })
    }

    const cookieStore = cookies()
    return createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // Ignored in Server Components — middleware handles refresh.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // Ignored in Server Components — middleware handles refresh.
                    }
                },
            },
        }
    )
}
