import { createServerClient } from '@supabase/ssr'

export async function createClient(cookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          const cookies = await cookieStore.getAll()
          return cookies
        },
        async setAll(cookiesToSet) {
          try {
            for (const cookie of cookiesToSet) {
              await cookieStore.set(cookie.name, cookie.value, cookie.options)
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
} 