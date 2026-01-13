// lib/supabase-server.js
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'


export function createClient() {
  const cookieStore = cookies()
  

  const authToken = cookieStore.get('sb-access-token')?.value || 
                    cookieStore.get('supabase-auth-token')?.value


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