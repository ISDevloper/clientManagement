import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    // eslint-disable-next-line no-undef
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    // eslint-disable-next-line no-undef
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
} 