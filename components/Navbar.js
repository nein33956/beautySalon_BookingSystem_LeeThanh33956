'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Navbar() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    if (session?.user) {
      await fetchProfile(session.user.id)
    }
    setLoading(false)
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single()
    
    setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }
  
  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
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
            <a 
              href="#home" 
              onClick={(e) => handleNavClick(e, 'home')}
            >
              HomePage
            </a>
          </li>
          <li>
            <a 
              href="/services" 
              onClick={(e) => setIsMenuOpen(false)}
            >
              Service
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              onClick={() => handleNavClick(e, 'contact')}
            >
              Contact
            </a>
          </li>

          {!loading && (
            <>
              {user ? (
                <>
                  <li>
                    <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)}>
                      My Bookings
                    </Link>
                  </li>
                  
                  {profile?.role === 'admin' && (
                    <li>
                      <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
                        Admin
                      </Link>
                    </li>
                  )}
                  
                  <li>
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </li>
                  
                  <li className="user-info">
                    <span className="user-name">👤 {profile?.full_name || 'User'}</span>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                      <span className="register-btn-nav">Register</span>
                    </Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}