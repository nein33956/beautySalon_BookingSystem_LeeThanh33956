'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  UserCog, 
  Calendar,
  LogOut 
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard
    },
    {
      name: 'Services',
      path: '/admin/services',
      icon: Scissors
    },
    {
      name: 'Staff',
      path: '/admin/staff',
      icon: UserCog
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: Users
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: Calendar
    }
  ]
  
  const isActive = (path) => {
    if (path === '/admin') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }
  
  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <h1 className="sidebar-logo">
          <Scissors size={24} />
          <span>Beauty Salon</span>
        </h1>
        <p className="sidebar-subtitle">Admin Panel</p>
      </div>
      
      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
      
      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-item logout">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}