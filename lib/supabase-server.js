// lib/supabase-server.js
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Create Supabase client for API Routes
 * This function handles authentication via cookies
 */
export function createClient() {
  const cookieStore = cookies()
  
  // Get the auth token from cookies
  const authToken = cookieStore.get('sb-access-token')?.value || 
                    cookieStore.get('supabase-auth-token')?.value

  // Create Supabase client
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: authToken ? {
          Authorization: `Bearer ${authToken}`
        } : {}
      }
    }
  )

  return supabase
}

/**
 * Alternative: Create admin client with service role key
 * WARNING: This bypasses RLS policies - use with caution!
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  )
}