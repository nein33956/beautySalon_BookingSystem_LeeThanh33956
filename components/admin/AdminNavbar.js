'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Bell, User } from 'lucide-react'

export default function AdminNavbar() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()
        
        setUser({
          email: user.email,
          name: profile?.full_name || 'Admin',
          avatar: profile?.avatar_url
        })
      }
    }
    
    getUser()
  }, [])
  
  return (
    <header className="admin-navbar">
      <div className="navbar-content">
        {/* Search or Title */}
        <div className="navbar-left">
          <h2 
            className="navbar-title">Admin Dashboard
          </h2>
        </div>
        
        {/* Right side */}
        <div className="navbar-right">
          {/* Notifications */}
          <button className="navbar-icon-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
          
          {/* User Profile */}
          <div className="navbar-user">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                className="navbar-avatar"
              />
            ) : (
              <div className="navbar-avatar-placeholder">
                <User size={20} />
              </div>
            )}
            <div className="navbar-user-info">
              <p className="navbar-user-name">{user?.name || 'Loading...'}</p>
              <p className="navbar-user-role">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}