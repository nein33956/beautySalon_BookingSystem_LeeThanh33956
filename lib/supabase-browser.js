import { createBrowserClient } from '@supabase/ssr'

// Singleton instance
let supabaseInstance = null

export function createClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return supabaseInstance
}

// For backward compatibility
export const supabase = createClient()