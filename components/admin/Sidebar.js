'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
export default function Sidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin'
    },
    {
      name: 'Services',
      path: '/admin/services'
    },
    {
      name: 'Staff',
      path: '/admin/staff'
    },
    {
      name: 'Customers',
      path: '/admin/customers'
    },
    {
      name: 'Bookings',
      path: '/admin/bookings'
    }
  ]
  
  const isActive = (path) => {
    if (path === '/admin') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <span style={{ fontSize: '1.5rem' }}>✂️</span>
          <span>Beauty Salon</span>
        </h1>
        <p className="sidebar-subtitle">Admin Panel</p>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-item logout" onClick={handleLogout}>
          <span style={{ fontSize: '1.25rem' }}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}