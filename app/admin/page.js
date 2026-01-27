//app/admin/page.js
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    activeServices: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()
  
  useEffect(() => { fetchDashboardData() }, [])
  
  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Fetching dashboard data...')
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0]
      console.log('📅 Today:', today)
      
      // Get year & month for revenue
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const firstDayOfMonth = `${year}-${month}-01`
      
      // 1. TODAY'S BOOKINGS (Count all active bookings)
      const { data: todayBookings, error: todayError } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', today)
        .neq('status', 'cancelled')  // ✅ Count tất cả trừ cancelled
      
      console.log('📊 Today bookings:', {
        count: todayBookings?.length || 0,
        data: todayBookings,
        error: todayError?.message
      })
      
      // 2. TOTAL CUSTOMERS
      const { count: totalCustomers, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      console.log('👥 Customers:', {
        count: totalCustomers,
        error: customersError?.message
      })

      
      // 3. MONTHLY REVENUE (✅ Count all except cancelled)
      const { data: monthBookings, error: revenueError } = await supabase
        .from('bookings')
        .select('total_price, status')
        .neq('status', 'cancelled')  // ✅ Tất cả trừ cancelled
        .gte('booking_date', firstDayOfMonth)
      
      const revenue = monthBookings?.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0) || 0
      
      console.log('💰 Revenue:', {
        count: monthBookings?.length || 0,
        total: revenue,
        bookings: monthBookings,
        error: revenueError?.message
      })
      
      // 4. ACTIVE SERVICES
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .eq('is_active', true)
      
      console.log('✂️ Services:', {
        count: services?.length || 0,
        error: servicesError?.message
      })
      
      // 5. RECENT BOOKINGS (Simplified - no nested joins)
      const { data: recentRaw, error: recentError } = await supabase
        .from('bookings')
        .select('id, booking_date, start_time, status, total_price, customer_id, service_id')
        .order('created_at', { ascending: false })
        .limit(5)
      
      console.log('📋 Recent bookings (raw):', {
        count: recentRaw?.length || 0,
        data: recentRaw,
        error: recentError?.message
      })
      
      // Enrich with customer and service data
      const recent = []
      if (recentRaw && recentRaw.length > 0) {
        for (const booking of recentRaw) {
          try {
            // Get customer name from profiles
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', booking.customer_id)
              .single()
            
            // Get service name
            const { data: service } = await supabase
              .from('services')
              .select('name')
              .eq('id', booking.service_id)
              .single()
            
            recent.push({
              ...booking,
              customer: { profiles: { full_name: profile?.full_name || 'N/A' }},
              service: { name: service?.name || 'N/A' }
            })
          } catch (err) {
            console.error('Error enriching booking:', err)
            recent.push({
              ...booking,
              customer: { profiles: { full_name: 'N/A' }},
              service: { name: 'N/A' }
            })
          }
        }
      }
      
      console.log('📋 Recent bookings (enriched):', recent)
      
      // Set stats
      setStats({
        todayBookings: todayBookings?.length || 0,
        totalCustomers: totalCustomers || 0,
        monthlyRevenue: revenue,
        activeServices: services?.length || 0
      })

      
      setRecentBookings(recent || [])
      setLoading(false)
      
      console.log('✅ Dashboard loaded successfully')
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      setLoading(false)
    }
  }
  
  const statsCards = [
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: '📅',
      color: '#8B5CF6',
      bgColor: '#F3E8FF'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: '👥',
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: '💰',
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: '📈',
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    }
  ]
  
  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading dashboard...</p>
      </div>
    )
  }
  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        {statsCards.map((stat, index) => {
          return (
            <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              </div>
              <div className="stat-content">
                <p className="stat-title">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Recent Bookings */}
      <div className="dashboard-section">
        <h2 className="section-title">Recent Bookings</h2>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No bookings yet
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.customer?.profiles?.full_name || 'N/A'}</td>
                    <td>{booking.service?.name || 'N/A'}</td>
                    <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                    <td>{booking.start_time}</td>
                    <td>${parseFloat(booking.total_price).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}