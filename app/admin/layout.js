// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import Link from 'next/link'
// import { createClient } from '@/lib/supabase-browser'

// const MENU_ITEMS = [
//   {
//     label: 'Dashboard',
//     icon: '📊',
//     path: '/admin',
//     description: 'Overview & Stats'
//   },
//   {
//     label: 'Bookings',
//     icon: '📅',
//     path: '/admin/bookings',
//     description: 'Manage Appointments'
//   },
//   {
//     label: 'Services',
//     icon: '✨',
//     path: '/admin/services',
//     description: 'Manage Services'
//   },
//   {
//     label: 'Staff',
//     icon: '👥',
//     path: '/admin/staff',
//     description: 'Manage Staff'
//   },
//   {
//     label: 'Customers',
//     icon: '👤',
//     path: '/admin/customers',
//     description: 'View Customers'
//   }
// ]

// export default function AdminLayout({ children }) {
//   const router = useRouter()
//   const pathname = usePathname()
//   const supabase = createClient()
  
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true)

//   useEffect(() => {
//     fetchUser()
//   }, [])

//   const fetchUser = async () => {
//     const { data: { user: authUser } } = await supabase.auth.getUser()
//     if (authUser) {
//       setUser(authUser)
      
//       const { data: profileData } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', authUser.id)
//         .single()
      
//       setProfile(profileData)
//     }
//   }

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     router.push('/login')
//   }

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      
//       {/* VERTICAL SIDEBAR - LEFT */}
//       <aside style={{
//         width: isSidebarOpen ? '280px' : '80px',
//         background: 'linear-gradient(180deg, #1f2937 0%, #111827 100%)',
//         color: 'white',
//         transition: 'width 0.3s ease',
//         position: 'fixed',
//         height: '100vh',
//         overflowY: 'auto',
//         overflowX: 'hidden',
//         zIndex: 40,
//         boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)'
//       }}>
        
//         {/* Logo & Toggle */}
//         <div style={{ 
//           padding: '1.5rem', 
//           borderBottom: '1px solid rgba(255,255,255,0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//           minHeight: '80px'
//         }}>
//           {isSidebarOpen ? (
//             <>
//               <div>
//                 <h1 style={{ 
//                   fontSize: '1.5rem', 
//                   fontWeight: 'bold', 
//                   margin: 0,
//                   background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
//                   WebkitBackgroundClip: 'text',
//                   WebkitTextFillColor: 'transparent'
//                 }}>
//                   💇‍♀️ Admin
//                 </h1>
//                 <p style={{ 
//                   fontSize: '0.75rem', 
//                   color: '#9ca3af', 
//                   margin: '0.25rem 0 0 0' 
//                 }}>
//                   Beauty Salon
//                 </p>
//               </div>
//               <button
//                 onClick={() => setIsSidebarOpen(false)}
//                 style={{
//                   background: 'rgba(255, 255, 255, 0.1)',
//                   border: 'none',
//                   color: 'white',
//                   cursor: 'pointer',
//                   fontSize: '1.25rem',
//                   width: '32px',
//                   height: '32px',
//                   borderRadius: '6px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   transition: 'background 0.2s'
//                 }}
//                 onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
//                 onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
//               >
//                 ‹
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={() => setIsSidebarOpen(true)}
//               style={{
//                 background: 'rgba(255, 255, 255, 0.1)',
//                 border: 'none',
//                 color: 'white',
//                 cursor: 'pointer',
//                 fontSize: '1.25rem',
//                 width: '32px',
//                 height: '32px',
//                 borderRadius: '6px',
//                 margin: '0 auto',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 transition: 'background 0.2s'
//               }}
//               onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
//               onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
//             >
//               ›
//             </button>
//           )}
//         </div>

//         {/* Navigation Menu */}
//         <nav style={{ padding: '1rem 0' }}>
//           {MENU_ITEMS.map((item) => {
//             const isActive = pathname === item.path
            
//             return (
//               <Link
//                 key={item.path}
//                 href={item.path}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '1rem',
//                   padding: isSidebarOpen ? '1rem 1.5rem' : '1rem 0',
//                   justifyContent: isSidebarOpen ? 'flex-start' : 'center',
//                   color: isActive ? 'white' : '#9ca3af',
//                   textDecoration: 'none',
//                   background: isActive ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
//                   borderLeft: isActive ? '4px solid #ec4899' : '4px solid transparent',
//                   transition: 'all 0.2s ease',
//                   position: 'relative'
//                 }}
//                 onMouseEnter={(e) => {
//                   if (!isActive) {
//                     e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
//                     e.currentTarget.style.color = 'white'
//                   }
//                 }}
//                 onMouseLeave={(e) => {
//                   if (!isActive) {
//                     e.currentTarget.style.background = 'transparent'
//                     e.currentTarget.style.color = '#9ca3af'
//                   }
//                 }}
//               >
//                 <span style={{ fontSize: '1.5rem', minWidth: '24px', textAlign: 'center' }}>
//                   {item.icon}
//                 </span>
//                 {isSidebarOpen && (
//                   <div style={{ flex: 1 }}>
//                     <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
//                       {item.label}
//                     </div>
//                     <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>
//                       {item.description}
//                     </div>
//                   </div>
//                 )}
                
//                 {/* Active indicator dot */}
//                 {isActive && !isSidebarOpen && (
//                   <div style={{
//                     position: 'absolute',
//                     right: '10px',
//                     width: '6px',
//                     height: '6px',
//                     borderRadius: '50%',
//                     background: '#ec4899'
//                   }} />
//                 )}
//               </Link>
//             )
//           })}
//         </nav>

//         {/* User Profile at Bottom */}
//         <div style={{
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           padding: '1.5rem',
//           borderTop: '1px solid rgba(255,255,255,0.1)',
//           background: 'rgba(0,0,0,0.2)'
//         }}>
//           {isSidebarOpen ? (
//             <>
//               <div style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 gap: '0.75rem', 
//                 marginBottom: '1rem' 
//               }}>
//                 <div style={{
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '50%',
//                   background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '1.25rem',
//                   fontWeight: 'bold',
//                   flexShrink: 0
//                 }}>
//                   {profile?.full_name?.[0]?.toUpperCase() || '👤'}
//                 </div>
//                 <div style={{ flex: 1, overflow: 'hidden' }}>
//                   <div style={{ 
//                     fontWeight: '600', 
//                     fontSize: '0.95rem', 
//                     whiteSpace: 'nowrap', 
//                     overflow: 'hidden', 
//                     textOverflow: 'ellipsis' 
//                   }}>
//                     {profile?.full_name || 'Admin User'}
//                   </div>
//                   <div style={{ 
//                     fontSize: '0.75rem', 
//                     color: '#9ca3af', 
//                     whiteSpace: 'nowrap', 
//                     overflow: 'hidden', 
//                     textOverflow: 'ellipsis' 
//                   }}>
//                     {user?.email}
//                   </div>
//                 </div>
//               </div>
              
//               <button
//                 onClick={handleLogout}
//                 style={{
//                   width: '100%',
//                   padding: '0.75rem',
//                   background: 'rgba(239, 68, 68, 0.1)',
//                   color: '#fca5a5',
//                   border: '1px solid rgba(239, 68, 68, 0.3)',
//                   borderRadius: '8px',
//                   fontWeight: '600',
//                   cursor: 'pointer',
//                   fontSize: '0.875rem',
//                   transition: 'all 0.2s',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   gap: '0.5rem'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
//                 }}
//               >
//                 🚪 Logout
//               </button>
//             </>
//           ) : (
//             <button
//               onClick={handleLogout}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 background: 'rgba(239, 68, 68, 0.1)',
//                 color: '#fca5a5',
//                 border: '1px solid rgba(239, 68, 68, 0.3)',
//                 borderRadius: '8px',
//                 cursor: 'pointer',
//                 fontSize: '1.25rem',
//                 transition: 'all 0.2s'
//               }}
//               title="Logout"
//             >
//               🚪
//             </button>
//           )}
//         </div>
//       </aside>

//       {/* MAIN CONTENT AREA */}
//       <main style={{
//         flex: 1,
//         marginLeft: isSidebarOpen ? '280px' : '80px',
//         transition: 'margin-left 0.3s ease',
//         minHeight: '100vh',
//         display: 'flex',
//         flexDirection: 'column'
//       }}>
//         {/* Top Header */}
//         <header style={{
//           background: 'white',
//           borderBottom: '1px solid #e5e7eb',
//           padding: '1.25rem 2rem',
//           position: 'sticky',
//           top: 0,
//           zIndex: 30,
//           boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
//         }}>
//           <div style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'space-between',
//             flexWrap: 'wrap',
//             gap: '1rem'
//           }}>
//             <div>
//               <h2 style={{ 
//                 fontSize: '1.5rem', 
//                 fontWeight: 'bold', 
//                 color: '#111827',
//                 margin: 0
//               }}>
//                 {MENU_ITEMS.find(item => item.path === pathname)?.label || 'Admin Panel'}
//               </h2>
//               <p style={{ 
//                 color: '#6b7280', 
//                 fontSize: '0.875rem', 
//                 margin: '0.25rem 0 0 0' 
//               }}>
//                 {new Date().toLocaleDateString('en-US', { 
//                   weekday: 'long', 
//                   year: 'numeric', 
//                   month: 'long', 
//                   day: 'numeric' 
//                 })}
//               </p>
//             </div>
            
//             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//               {/* Quick Link to Customer View */}
//               <Link
//                 href="/my-bookings?force=true"
//                 style={{
//                   padding: '0.5rem 1rem',
//                   background: '#f3f4f6',
//                   color: '#374151',
//                   textDecoration: 'none',
//                   borderRadius: '8px',
//                   fontSize: '0.875rem',
//                   fontWeight: '600',
//                   border: '1px solid #e5e7eb',
//                   transition: 'all 0.2s'
//                 }}
//                 onMouseEnter={(e) => {
//                   e.currentTarget.style.background = '#e5e7eb'
//                 }}
//                 onMouseLeave={(e) => {
//                   e.currentTarget.style.background = '#f3f4f6'
//                 }}
//               >
//                 👤 Customer View
//               </Link>
              
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 borderRadius: '50%',
//                 background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 color: 'white',
//                 fontWeight: 'bold',
//                 fontSize: '1.125rem'
//               }}>
//                 {profile?.full_name?.[0]?.toUpperCase() || '👤'}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div style={{ 
//           flex: 1,
//           padding: '2rem',
//           overflowY: 'auto'
//         }}>
//           {children}
//         </div>
//       </main>
//     </div>
//   )
// }

import Sidebar from '@/components/admin/Sidebar'
import AdminNavbar from '@/components/admin/AdminNavbar'
import './admin.css'

export default function AdminLayout({ children }) {
  return (
    <div className="admin-container">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Navbar */}
        <AdminNavbar />
        
        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  )
}