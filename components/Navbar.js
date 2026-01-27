

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🚀 Navbar mounted')
    loadUserData()
  }, [])

  async function loadUserData() {
    const startTime = Date.now()
    console.log('⏳ loadUserData START')
    
    try {
      // Step 1: Get session
      console.log('Step 1: Getting session...')
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Session result:', {
        hasSession: !!session,
        email: session?.user?.email,
        error: sessionError?.message
      })
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      if (!session || !session.user) {
        console.log('✅ No session - user logged out')
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      // Step 2: Set user
      console.log('Step 2: Setting user...')
      setUser(session.user)

      // Step 3: Get profile
      console.log('Step 3: Getting profile for:', session.user.id)
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', session.user.id)
        .single()

      console.log('Profile result:', {
        data: profileData,
        error: profileError?.message
      })

      if (profileError) {
        console.error('Profile error:', profileError)
        // Use email as fallback
        setProfile({ full_name: session.user.email.split('@')[0], role: 'customer' })
      } else {
        setProfile(profileData)
      }

      const duration = Date.now() - startTime
      console.log(`✅ loadUserData COMPLETE in ${duration}ms`)
      
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setUser(null)
      setProfile(null)
    } finally {
      console.log('🏁 Setting loading to FALSE')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    console.log('👋 Logout clicked')
    setLoading(true)
    setUser(null)
    setProfile(null)
    
    await supabase.auth.signOut()
    
    setLoading(false)
    router.push('/')
    router.refresh()
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  console.log('🎨 Navbar render:', { loading, hasUser: !!user, hasProfile: !!profile })

  return (
    <>
      <header>
        <nav>
          <Link href="/">
            <h1 style={{ cursor: 'pointer' }}>Beauty Salon</h1>
          </Link>
          
          <button 
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <ul className={isMenuOpen ? 'active' : ''}>
            <li>
              <Link href="/">HomePage</Link>
            </li>
            <li>
              <Link href="/services">Service</Link>
            </li>
            <li>
              <Link href="#contact">Contact</Link>
            </li>

            {loading ? (
              <li style={{ color: '#fff', opacity: 0.7 }}>Loading...</li>
            ) : user ? (
              <>
                <li>
                  <Link href="/my-bookings">My Bookings</Link>
                </li>
                
                {profile?.role === 'admin' && (
                  <li>
                    <Link href="/admin">Admin</Link>
                  </li>
                )}
                
                <li>
                  <button 
                    onClick={handleLogout} 
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </li>
                
                <li className="user-info">
                  <span className="user-name">
                    👤 {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login">Login</Link>
                </li>
                <li>
                  <Link href="/register">
                    <span className="register-btn-nav">Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>


    </>
  )
}
