// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase-browser'

// export default function AdminDashboard() {
//   const supabase = createClient()
  
//   const [stats, setStats] = useState({
//     todayBookings: 0,
//     pendingBookings: 0,
//     totalRevenue: 0,
//     totalCustomers: 0,
//     totalServices: 0,
//     totalStaff: 0
//   })
  
//   const [recentBookings, setRecentBookings] = useState([])
//   const [isLoading, setIsLoading] = useState(true)

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true)
      
//       // Get all bookings
//       const { data: bookings } = await supabase
//         .from('bookings')
//         .select(`
//           *,
//           services!inner(name, price),
//           staff(name),
//           profiles!inner(full_name, phone)
//         `)
//         .order('created_at', { ascending: false })
      
//       // Calculate stats
//       const today = new Date().toISOString().split('T')[0]
//       const todayBookings = bookings?.filter(b => b.booking_date === today).length || 0
//       const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0
//       const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0
      
//       // Get customers count
//       const { count: customersCount } = await supabase
//         .from('profiles')
//         .select('*', { count: 'exact', head: true })
//         .eq('role', 'customer')
      
//       // Get services count
//       const { count: servicesCount } = await supabase
//         .from('services')
//         .select('*', { count: 'exact', head: true })
      
//       // Get staff count
//       const { count: staffCount } = await supabase
//         .from('staff')
//         .select('*', { count: 'exact', head: true })
      
//       setStats({
//         todayBookings,
//         pendingBookings,
//         totalRevenue,
//         totalCustomers: customersCount || 0,
//         totalServices: servicesCount || 0,
//         totalStaff: staffCount || 0
//       })
      
//       // Recent bookings (last 5)
//       setRecentBookings(bookings?.slice(0, 5) || [])
      
//     } catch (err) {
//       console.error('Fetch dashboard data error:', err)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const STAT_CARDS = [
//     {
//       label: "Today's Bookings",
//       value: stats.todayBookings,
//       icon: '📅',
//       color: '#ec4899',
//       bgColor: '#fdf2f8'
//     },
//     {
//       label: 'Pending',
//       value: stats.pendingBookings,
//       icon: '⏳',
//       color: '#f59e0b',
//       bgColor: '#fffbeb'
//     },
//     {
//       label: 'Total Revenue',
//       value: `${stats.totalRevenue.toLocaleString('vi-VN')}₫`,
//       icon: '💰',
//       color: '#10b981',
//       bgColor: '#ecfdf5'
//     },
//     {
//       label: 'Customers',
//       value: stats.totalCustomers,
//       icon: '👥',
//       color: '#3b82f6',
//       bgColor: '#eff6ff'
//     },
//     {
//       label: 'Services',
//       value: stats.totalServices,
//       icon: '✨',
//       color: '#8b5cf6',
//       bgColor: '#f5f3ff'
//     },
//     {
//       label: 'Staff',
//       value: stats.totalStaff,
//       icon: '👤',
//       color: '#06b6d4',
//       bgColor: '#ecfeff'
//     }
//   ]

//   const STATUS_CONFIG = {
//     pending: { label: 'Pending', color: '#f59e0b', bgColor: '#fffbeb' },
//     confirmed: { label: 'Confirmed', color: '#10b981', bgColor: '#ecfdf5' },
//     completed: { label: 'Completed', color: '#3b82f6', bgColor: '#eff6ff' },
//     cancelled: { label: 'Cancelled', color: '#ef4444', bgColor: '#fef2f2' }
//   }

//   if (isLoading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '4rem' }}>
//         <div style={{
//           width: '48px',
//           height: '48px',
//           border: '4px solid #ec4899',
//           borderTopColor: 'transparent',
//           borderRadius: '50%',
//           margin: '0 auto 1rem',
//           animation: 'spin 1s linear infinite'
//         }}></div>
//         <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
//         <style jsx>{`
//           @keyframes spin {
//             to { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     )
//   }

//   return (
//     <div>
//       {/* Welcome Banner */}
//       <div style={{
//         background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
//         borderRadius: '20px',
//         padding: '2rem',
//         color: 'white',
//         marginBottom: '2rem'
//       }}>
//         <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
//           Welcome back, Admin! 👋
//         </h1>
//         <p style={{ opacity: 0.9, margin: 0 }}>
//           Here's what's happening with your salon today
//         </p>
//       </div>

//       {/* Stats Grid */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//         gap: '1.5rem',
//         marginBottom: '2rem'
//       }}>
//         {STAT_CARDS.map((stat, idx) => (
//           <div key={idx} style={{
//             background: stat.bgColor,
//             borderRadius: '16px',
//             padding: '1.5rem',
//             border: `2px solid ${stat.color}20`
//           }}>
//             <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
//             <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.25rem' }}>
//               {stat.value}
//             </div>
//             <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
//               {stat.label}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Recent Bookings */}
//       <div style={{
//         background: 'white',
//         borderRadius: '20px',
//         padding: '1.5rem',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
//       }}>
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'space-between', 
//           alignItems: 'center',
//           marginBottom: '1.5rem'
//         }}>
//           <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
//             Recent Bookings
//           </h2>
//           <Link
//             href="/admin/bookings"
//             style={{
//               padding: '0.5rem 1rem',
//               background: '#f3f4f6',
//               color: '#374151',
//               textDecoration: 'none',
//               borderRadius: '8px',
//               fontSize: '0.875rem',
//               fontWeight: '600'
//             }}
//           >
//             View All →
//           </Link>
//         </div>

//         {recentBookings.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
//             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
//             <p>No bookings yet</p>
//           </div>
//         ) : (
//           <div style={{ display: 'grid', gap: '1rem' }}>
//             {recentBookings.map((booking) => {
//               const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
              
//               return (
//                 <div key={booking.id} style={{
//                   padding: '1rem',
//                   border: '1px solid #e5e7eb',
//                   borderRadius: '12px',
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   alignItems: 'center'
//                 }}>
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
//                       {booking.services?.name}
//                     </div>
//                     <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
//                       {booking.profiles?.full_name} • {booking.booking_date} {booking.start_time?.substring(0, 5)}
//                     </div>
//                   </div>
                  
//                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
//                     <div style={{ fontWeight: 'bold', color: '#ec4899' }}>
//                       {booking.total_price?.toLocaleString('vi-VN')}₫
//                     </div>
                    
//                     <span style={{
//                       padding: '0.25rem 0.75rem',
//                       borderRadius: '9999px',
//                       fontSize: '0.75rem',
//                       fontWeight: '600',
//                       background: status.bgColor,
//                       color: status.color
//                     }}>
//                       {status.label}
//                     </span>
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* Quick Actions */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//         gap: '1.5rem',
//         marginTop: '2rem'
//       }}>
//         <Link
//           href="/admin/bookings"
//           style={{
//             background: 'white',
//             borderRadius: '16px',
//             padding: '1.5rem',
//             textDecoration: 'none',
//             color: 'inherit',
//             boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//             border: '2px solid transparent',
//             transition: 'all 0.2s'
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.borderColor = '#ec4899'
//             e.currentTarget.style.transform = 'translateY(-2px)'
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.borderColor = 'transparent'
//             e.currentTarget.style.transform = 'none'
//           }}
//         >
//           <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
//           <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Manage Bookings</div>
//           <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>View and manage all appointments</div>
//         </Link>

//         <Link
//           href="/admin/services"
//           style={{
//             background: 'white',
//             borderRadius: '16px',
//             padding: '1.5rem',
//             textDecoration: 'none',
//             color: 'inherit',
//             boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//             border: '2px solid transparent',
//             transition: 'all 0.2s'
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.borderColor = '#8b5cf6'
//             e.currentTarget.style.transform = 'translateY(-2px)'
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.borderColor = 'transparent'
//             e.currentTarget.style.transform = 'none'
//           }}
//         >
//           <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
//           <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Manage Services</div>
//           <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Add or edit salon services</div>
//         </Link>

//         <Link
//           href="/admin/staff"
//           style={{
//             background: 'white',
//             borderRadius: '16px',
//             padding: '1.5rem',
//             textDecoration: 'none',
//             color: 'inherit',
//             boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
//             border: '2px solid transparent',
//             transition: 'all 0.2s'
//           }}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.borderColor = '#10b981'
//             e.currentTarget.style.transform = 'translateY(-2px)'
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.borderColor = 'transparent'
//             e.currentTarget.style.transform = 'none'
//           }}
//         >
//           <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
//           <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Manage Staff</div>
//           <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Add or edit staff members</div>
//         </Link>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react'

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
      // Get today's date
      const today = new Date().toISOString().split('T')[0]
      
      // Today's bookings
      const { data: todayBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('booking_date', today)
        .in('status', ['pending', 'confirmed'])
      
      // Total customers
      const { data: customers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer')
      
      // Monthly revenue (this month)
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0]
      
      const { data: monthBookings } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'confirmed')
        .gte('booking_date', firstDayOfMonth)
      
      const revenue = monthBookings?.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0) || 0
      
      // Active services
      const { data: services } = await supabase
        .from('services')
        .select('id')
        .eq('is_active', true)
      
      // Recent bookings
      const { data: recent } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          start_time,
          status,
          total_price,
          service:services(name),
          customer:profiles!bookings_customer_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      setStats({
        todayBookings: todayBookings?.length || 0,
        totalCustomers: customers?.length || 0,
        monthlyRevenue: revenue,
        activeServices: services?.length || 0
      })
      
      setRecentBookings(recent || [])
      setLoading(false)
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }
  
  const statsCards = [
    {
      title: "Today's Bookings",
      value: stats.todayBookings,
      icon: Calendar,
      color: '#8B5CF6',
      bgColor: '#F3E8FF'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      title: 'Active Services',
      value: stats.activeServices,
      icon: TrendingUp,
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
          const Icon = stat.icon
          return (
            <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor, color: stat.color }}>
                <Icon size={24} />
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
                    <td>{booking.customer?.full_name || 'N/A'}</td>
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