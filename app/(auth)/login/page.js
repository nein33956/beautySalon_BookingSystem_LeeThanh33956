'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('\n===== LOGIN START =====')
    console.log('Email:', email)
    setLoading(true)
    setError('')

    try {
      console.log('Calling signInWithPassword...')
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login result:', {
        success: !!data.session,
        userId: data.session?.user?.id,
        email: data.session?.user?.email,
        error: signInError?.message
      })

      if (signInError) {
        throw signInError
      }

      if (!data.session) {
        throw new Error('No session created')
      }

      console.log('Login success!')
      console.log('Session created, cookies should be set')
      

      const { data: sessionCheck } = await supabase.auth.getSession()
      console.log('Session check:', {
        exists: !!sessionCheck.session,
        userId: sessionCheck.session?.user?.id
      })

      if (!sessionCheck.session) {
        throw new Error('Session not persisted!')
      }

      console.log('Fetching user role...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

      const userRole = profile?.role || 'customer'
      console.log('User role:', userRole)
      console.log('User name:', profile?.full_name)

      await new Promise(resolve => setTimeout(resolve, 500))
      
      // ✅ REDIRECT BASED ON ROLE
      if (userRole === 'admin') {
        console.log('Admin detected → Redirecting to /admin')
        window.location.href = '/admin'
      } else if (userRole === 'staff') {
        console.log('Staff detected → Redirecting to /staff')
        window.location.href = '/staff'
      } else {
        console.log('Customer detected → Redirecting to /my-bookings')
        window.location.href = '/my-bookings'
      }
      
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back to Beauty Salon</p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}