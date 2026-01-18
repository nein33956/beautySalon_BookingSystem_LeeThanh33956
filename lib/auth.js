// lib/auth.js
import { createClient } from '@/lib/supabase-browser'

/**
 * Get current user and role
 */
export async function getCurrentUser() {
  const supabase = createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, profile: null, role: null }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return {
    user,
    profile,
    role: profile?.role || 'customer'
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin() {
  const { role } = await getCurrentUser()
  return role === 'admin'
}

/**
 * Require admin access (for client components)
 */
export async function requireAdmin(router) {
  const admin = await isAdmin()
  
  if (!admin) {
    router.push('/my-bookings')
    return false
  }
  
  return true
}

/**
 * Require authentication (for client components)
 */
export async function requireAuth(router) {
  const { user } = await getCurrentUser()
  
  if (!user) {
    router.push('/login')
    return false
  }
  
  return true
}