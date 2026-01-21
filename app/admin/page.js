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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Fetching dashboard data...')

      // ✅ FIX 1: tách rõ date string và Date object
      const today = new Date().toISOString().split('T')[0] // yyyy-mm-dd
      const now = new Date()

      // ✅ FIX 2: year & month lấy từ Date object
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')

      // --- TODAY BOOKINGS (booking_date là DATE) ---
      const { data: todayBookings, error: todayError } = await supabase
        .from('bookings')
        .select('id, booking_date')
        .eq('booking_date', today)

      console.log('📊 Today bookings:', todayBookings, todayError)

      // --- TOTAL CUSTOMERS ---
      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer')

      console.log('👥 Customers:', customers, customersError)

      // --- MONTHLY REVENUE ---
      const firstDayOfMonth = `${year}-${month}-01`

      const { data: monthBookings, error: revenueError } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'confirmed')
        .gte('booking_date', firstDayOfMonth)

      const revenue =
        monthBookings?.reduce(
          (sum, b) => sum + (parseFloat(b.total_price) || 0),
          0
        ) || 0

      console.log('💰 Revenue:', revenue, revenueError)

      // --- ACTIVE SERVICES ---
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .eq('is_active', true)

      console.log('✂️ Services:', services, servicesError)

      // --- RECENT BOOKINGS ---
      const { data: recent, error: recentError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          status,
          total_price,
          services(name),
          profiles(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('📋 Recent bookings:', recent, recentError)

      // ✅ FIX 3: set stats đúng data
      setStats({
        todayBookings: todayBookings?.length || 0,
        totalCustomers: customers?.length || 0,
        monthlyRevenue: revenue,
        activeServices: services?.length || 0
      })

      setRecentBookings(recent || [])
      setLoading(false)

      console.log('✅ Dashboard data loaded')
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
      value: `${stats.monthlyRevenue.toFixed(2)}`,
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
        <p className="dashboard-subtitle">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ borderLeftColor: stat.color }}
          >
            <div
              className="stat-icon"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

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
                    <td>{booking.profiles?.full_name || 'N/A'}</td>
                    <td>{booking.services?.name || 'N/A'}</td>
                    <td>{booking.booking_date}</td>
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
