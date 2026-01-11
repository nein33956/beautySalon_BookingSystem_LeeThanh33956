// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import Link from 'next/link'

// export default function Navbar() {
//   const router = useRouter()
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Get initial session
//     checkUser()

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null)
//       if (session?.user) {
//         fetchProfile(session.user.id)
//       } else {
//         setProfile(null)
//       }
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   async function checkUser() {
//     const { data: { session } } = await supabase.auth.getSession()
//     setUser(session?.user ?? null)
//     if (session?.user) {
//       await fetchProfile(session.user.id)
//     }
//     setLoading(false)
//   }

//   async function fetchProfile(userId) {
//     const { data } = await supabase
//       .from('profiles')
//       .select('full_name, role')
//       .eq('id', userId)
//       .single()
    
//     setProfile(data)
//   }

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     setUser(null)
//     setProfile(null)
//     router.push('/')
//     router.refresh()
//   }

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen)
//   }
  
//   const handleNavClick = (e, targetId) => {
//     e.preventDefault()
//     const element = document.getElementById(targetId)
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' })
//       setIsMenuOpen(false)
//     }
//   }

//   return (
//     <header>
//       <nav>
//         <Link href="/">
//           <h1 style={{ cursor: 'pointer' }}>Beauty Salon</h1>
//         </Link>
        
//         <button 
//           className="mobile-menu-btn"
//           onClick={toggleMenu}
//           aria-label="Toggle menu"
//         >
//           ☰
//         </button>

//         <ul className={isMenuOpen ? 'active' : ''}>
//           <li>
//             <a 
//               href="#home" 
//               onClick={(e) => handleNavClick(e, 'home')}
//             >
//               HomePage
//             </a>
//           </li>
//           <li>
//             <a 
//               href="/services" 
//               onClick={(e) => setIsMenuOpen(false)}
//             >
//               Service
//             </a>
//           </li>
//           <li>
//             <a 
//               href="#contact" 
//               onClick={() => handleNavClick(e, 'contact')}
//             >
//               Contact
//             </a>
//           </li>

//           {!loading && (
//             <>
//               {user ? (
//                 <>
//                   <li>
//                     <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)}>
//                       My Bookings
//                     </Link>
//                   </li>
                  
//                   {profile?.role === 'admin' && (
//                     <li>
//                       <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
//                         Admin
//                       </Link>
//                     </li>
//                   )}
                  
//                   <li>
//                     <button onClick={handleLogout} className="logout-btn">
//                       Logout
//                     </button>
//                   </li>
                  
//                   <li className="user-info">
//                     <span className="user-name">👤 {profile?.full_name || 'User'}</span>
//                   </li>
//                 </>
//               ) : (
//                 <>
//                   <li>
//                     <Link href="/login" onClick={() => setIsMenuOpen(false)}>
//                       Login
//                     </Link>
//                   </li>
//                   <li>
//                     <Link href="/register" onClick={() => setIsMenuOpen(false)}>
//                       <span className="register-btn-nav">Register</span>
//                     </Link>
//                   </li>
//                 </>
//               )}
//             </>
//           )}
//         </ul>
//       </nav>
//     </header>
//   )
// }

// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase-browser'
// import Link from 'next/link'

// export default function Navbar() {
//   const router = useRouter()
//   const supabase = createClient()
  
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Get initial session
//     checkUser()

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event, session) => {
//       console.log('🔄 Auth state changed:', event, session?.user?.email)
//       setUser(session?.user ?? null)
//       if (session?.user) {
//         await fetchProfile(session.user.id)
//       } else {
//         setProfile(null)
//       }
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   async function checkUser() {
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       console.log('👤 Navbar session check:', {
//         hasSession: !!session,
//         email: session?.user?.email
//       })
      
//       setUser(session?.user ?? null)
//       if (session?.user) {
//         await fetchProfile(session.user.id)
//       }
//     } catch (error) {
//       console.error('Error checking user:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   async function fetchProfile(userId) {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('full_name, role')
//         .eq('id', userId)
//         .single()
      
//       if (error) throw error
      
//       console.log('📋 Profile loaded:', data)
//       setProfile(data)
//     } catch (error) {
//       console.error('Error fetching profile:', error)
//     }
//   }

//   const handleLogout = async () => {
//     console.log('👋 Logging out...')
//     await supabase.auth.signOut()
//     setUser(null)
//     setProfile(null)
//     router.push('/')
//     router.refresh()
//   }

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen)
//   }
  
//   const handleNavClick = (e, targetId) => {
//     e.preventDefault()
//     const element = document.getElementById(targetId)
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' })
//       setIsMenuOpen(false)
//     }
//   }

//   return (
//     <header>
//       <nav>
//         <Link href="/">
//           <h1 style={{ cursor: 'pointer' }}>Beauty Salon</h1>
//         </Link>
        
//         <button 
//           className="mobile-menu-btn"
//           onClick={toggleMenu}
//           aria-label="Toggle menu"
//         >
//           ☰
//         </button>

//         <ul className={isMenuOpen ? 'active' : ''}>
//           <li>
//             <a 
//               href="#home" 
//               onClick={(e) => handleNavClick(e, 'home')}
//             >
//               HomePage
//             </a>
//           </li>
//           <li>
//             <a 
//               href="#services" 
//               onClick={(e) => handleNavClick(e, 'services')}
//             >
//               Service
//             </a>
//           </li>
//           <li>
//             <a 
//               href="#contact" 
//               onClick={(e) => handleNavClick(e, 'contact')}
//             >
//               Contact
//             </a>
//           </li>

//           {!loading && (
//             <>
//               {user ? (
//                 <>
//                   <li>
//                     <Link href="/my-bookings" onClick={() => setIsMenuOpen(false)}>
//                       My Bookings
//                     </Link>
//                   </li>
                  
//                   {profile?.role === 'admin' && (
//                     <li>
//                       <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
//                         Admin
//                       </Link>
//                     </li>
//                   )}
                  
//                   <li>
//                     <button onClick={handleLogout} className="logout-btn">
//                       Logout
//                     </button>
//                   </li>
                  
//                   <li className="user-info">
//                     <span className="user-name">👤 {profile?.full_name || 'User'}</span>
//                   </li>
//                 </>
//               ) : (
//                 <>
//                   <li>
//                     <Link href="/login" onClick={() => setIsMenuOpen(false)}>
//                       Login
//                     </Link>
//                   </li>
//                   <li>
//                     <Link href="/register" onClick={() => setIsMenuOpen(false)}>
//                       <span className="register-btn-nav">Register</span>
//                     </Link>
//                   </li>
//                 </>
//               )}
//             </>
//           )}
//         </ul>
//       </nav>
//     </header>
//   )
// }



// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { createClient } from '@/lib/supabase-browser'
// import Link from 'next/link'

// export default function Navbar() {
//   const router = useRouter()
//   const pathname = usePathname()
//   const supabase = createClient()
  
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     // Initial check
//     checkUser()

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (event, session) => {
//       console.log('🔄 Auth event:', event, session?.user?.email)
      
//       // Reset loading for auth state changes
//       setLoading(true)
      
//       try {
//         if (event === 'SIGNED_OUT') {
//           console.log('👋 User signed out - clearing state')
//           setUser(null)
//           setProfile(null)
//         } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
//           console.log('✅ User signed in - updating state')
//           setUser(session?.user ?? null)
//           if (session?.user) {
//             await fetchProfile(session.user.id)
//           }
//         } else if (event === 'USER_UPDATED') {
//           setUser(session?.user ?? null)
//           if (session?.user) {
//             await fetchProfile(session.user.id)
//           }
//         } else {
//           // Handle any other events
//           setUser(session?.user ?? null)
//           if (session?.user) {
//             await fetchProfile(session.user.id)
//           } else {
//             setProfile(null)
//           }
//         }
//       } catch (error) {
//         console.error('❌ Auth state change error:', error)
//         setUser(null)
//         setProfile(null)
//       } finally {
//         // ✅ ALWAYS complete loading after auth state change
//         setLoading(false)
//       }
//     })

//     return () => {
//       console.log('🧹 Cleaning up auth listener')
//       subscription.unsubscribe()
//     }
//   }, [])

//   async function checkUser() {
//     console.log('🔍 Checking user session...')
//     try {
//       const { data: { session }, error } = await supabase.auth.getSession()
      
//       if (error) {
//         console.error('❌ Session check error:', error)
//         setUser(null)
//         setProfile(null)
//         return
//       }
      
//       console.log('👤 Session result:', {
//         hasSession: !!session,
//         email: session?.user?.email
//       })
      
//       if (session?.user) {
//         setUser(session.user)
//         await fetchProfile(session.user.id)
//       } else {
//         setUser(null)
//         setProfile(null)
//       }
//     } catch (error) {
//       console.error('❌ Error checking user:', error)
//       setUser(null)
//       setProfile(null)
//     } finally {
//       // ✅ ALWAYS set loading to false, no matter what happens
//       console.log('✅ Setting loading to false')
//       setLoading(false)
//     }
//   }

//   async function fetchProfile(userId) {
//     try {
//       console.log('📋 Fetching profile for:', userId)
//       const { data, error } = await supabase
//         .from('profiles')
//         .select('full_name, role')
//         .eq('id', userId)
//         .single()
      
//       if (error) {
//         console.error('❌ Profile fetch error:', error)
//         // Still set empty profile to avoid loading state
//         setProfile({ full_name: null, role: 'customer' })
//         return
//       }
      
//       console.log('✅ Profile loaded:', data)
//       setProfile(data || { full_name: null, role: 'customer' })
//     } catch (error) {
//       console.error('❌ Error fetching profile:', error)
//       setProfile({ full_name: null, role: 'customer' })
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       console.log('👋 Logging out...')
      
//       // Clear local state immediately
//       setUser(null)
//       setProfile(null)
      
//       // Sign out from Supabase
//       const { error } = await supabase.auth.signOut()
      
//       if (error) {
//         console.error('❌ Logout error:', error)
//       } else {
//         console.log('✅ Logout successful')
//       }
      
//       // Redirect to home
//       router.push('/')
      
//       // Force refresh to clear any cached data
//       setTimeout(() => {
//         router.refresh()
//       }, 100)
      
//     } catch (error) {
//       console.error('❌ Logout error:', error)
//     }
//   }

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen)
//   }
  
//   const handleNavClick = (e, targetId) => {
//     e.preventDefault()
    
//     // If not on homepage, navigate to homepage first
//     if (pathname !== '/') {
//       router.push('/')
//       setTimeout(() => {
//         const element = document.getElementById(targetId)
//         if (element) {
//           element.scrollIntoView({ behavior: 'smooth' })
//         }
//       }, 200)
//     } else {
//       // Already on homepage, just scroll
//       const element = document.getElementById(targetId)
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth' })
//       }
//     }
    
//     setIsMenuOpen(false)
//   }

//   // Force re-render when pathname changes
//   useEffect(() => {
//     console.log('📍 Path changed:', pathname)
//     checkUser()
//   }, [pathname])

//   return (
//     <header>
//       <nav>
//         <Link href="/">
//           <h1 style={{ cursor: 'pointer' }}>Beauty Salon</h1>
//         </Link>
        
//         <button 
//           className="mobile-menu-btn"
//           onClick={toggleMenu}
//           aria-label="Toggle menu"
//         >
//           ☰
//         </button>

//         <ul className={isMenuOpen ? 'active' : ''}>
//           <li>
//             <a 
//               href="#home" 
//               onClick={(e) => handleNavClick(e, 'home')}
//             >
//               HomePage
//             </a>
//           </li>
//           <li>
//             <a 
//               href="#services" 
//               onClick={(e) => handleNavClick(e, 'services')}
//             >
//               Service
//             </a>
//           </li>
//           <li>
//             <a 
//               href="#contact" 
//               onClick={(e) => handleNavClick(e, 'contact')}
//             >
//               Contact
//             </a>
//           </li>

//           {/* Auth links - always rendered, visibility based on user state */}
//           {loading ? (
//             <li style={{ color: '#718096', fontSize: '0.9rem' }}>Loading...</li>
//           ) : user ? (
//             <>
//               <li>
//                 <Link 
//                   href="/my-bookings" 
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   My Bookings
//                 </Link>
//               </li>
              
//               {profile?.role === 'admin' && (
//                 <li>
//                   <Link 
//                     href="/admin" 
//                     onClick={() => setIsMenuOpen(false)}
//                   >
//                     Admin
//                   </Link>
//                 </li>
//               )}
              
//               <li>
//                 <button 
//                   onClick={handleLogout} 
//                   className="logout-btn"
//                   type="button"
//                 >
//                   Logout
//                 </button>
//               </li>
              
//               <li className="user-info">
//                 <span className="user-name">
//                   👤 {profile?.full_name || user.email?.split('@')[0] || 'User'}
//                 </span>
//               </li>
//             </>
//           ) : (
//             <>
//               <li>
//                 <Link 
//                   href="/login" 
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Login
//                 </Link>
//               </li>
//               <li>
//                 <Link 
//                   href="/register" 
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   <span className="register-btn-nav">Register</span>
//                 </Link>
//               </li>
//             </>
//           )}
//         </ul>
//       </nav>
//     </header>
//   )
// }


// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { createClient } from '@/lib/supabase-browser'
// import Link from 'next/link'

// export default function Navbar() {
//   const router = useRouter()
//   const supabase = createClient()
  
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//   const [user, setUser] = useState(null)
//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [debugInfo, setDebugInfo] = useState('')

//   useEffect(() => {
//     console.log('🚀 Navbar mounted')
//     loadUserData()
//   }, [])

//   async function loadUserData() {
//     const startTime = Date.now()
//     console.log('⏳ loadUserData START')
//     setDebugInfo('Loading user...')
    
//     try {
//       // Step 1: Get session
//       console.log('Step 1: Getting session...')
//       setDebugInfo('Step 1: Getting session...')
      
//       const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
//       console.log('Session result:', {
//         hasSession: !!session,
//         email: session?.user?.email,
//         error: sessionError?.message
//       })
      
//       if (sessionError) {
//         console.error('Session error:', sessionError)
//         setDebugInfo(`Error: ${sessionError.message}`)
//         setUser(null)
//         setProfile(null)
//         setLoading(false)
//         return
//       }

//       if (!session || !session.user) {
//         console.log('✅ No session - user logged out')
//         setDebugInfo('No session')
//         setUser(null)
//         setProfile(null)
//         setLoading(false)
//         return
//       }

//       // Step 2: Set user
//       console.log('Step 2: Setting user...')
//       setDebugInfo('Step 2: Setting user...')
//       setUser(session.user)

//       // Step 3: Get profile
//       console.log('Step 3: Getting profile for:', session.user.id)
//       setDebugInfo('Step 3: Getting profile...')
      
//       const { data: profileData, error: profileError } = await supabase
//         .from('profiles')
//         .select('full_name, role')
//         .eq('id', session.user.id)
//         .single()

//       console.log('Profile result:', {
//         data: profileData,
//         error: profileError?.message
//       })

//       if (profileError) {
//         console.error('Profile error:', profileError)
//         setDebugInfo(`Profile error: ${profileError.message}`)
//         // Use email as fallback
//         setProfile({ full_name: session.user.email.split('@')[0], role: 'customer' })
//       } else {
//         setProfile(profileData)
//         setDebugInfo('Profile loaded')
//       }

//       const duration = Date.now() - startTime
//       console.log(`✅ loadUserData COMPLETE in ${duration}ms`)
      
//     } catch (error) {
//       console.error('❌ Unexpected error:', error)
//       setDebugInfo(`Unexpected error: ${error.message}`)
//       setUser(null)
//       setProfile(null)
//     } finally {
//       console.log('🏁 Setting loading to FALSE')
//       setDebugInfo('Done')
//       setLoading(false)
//     }
//   }

//   const handleLogout = async () => {
//     console.log('👋 Logout clicked')
//     setLoading(true)
//     setUser(null)
//     setProfile(null)
    
//     await supabase.auth.signOut()
    
//     setLoading(false)
//     router.push('/')
//     router.refresh()
//   }

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen)
//   }

//   console.log('🎨 Navbar render:', { loading, hasUser: !!user, hasProfile: !!profile })

//   return (
//     <>
//       <header>
//         <nav>
//           <Link href="/">
//             <h1 style={{ cursor: 'pointer' }}>Beauty Salon</h1>
//           </Link>
          
//           <button 
//             className="mobile-menu-btn"
//             onClick={toggleMenu}
//             aria-label="Toggle menu"
//           >
//             ☰
//           </button>

//           <ul className={isMenuOpen ? 'active' : ''}>
//             <li>
//               <Link href="/">HomePage</Link>
//             </li>
//             <li>
//               <Link href="/services">Service</Link>
//             </li>
//             <li>
//               <Link href="#contact">Contact</Link>
//             </li>

//             {loading ? (
//               <li style={{ color: '#fff', opacity: 0.7 }}>Loading...</li>
//             ) : user ? (
//               <>
//                 <li>
//                   <Link href="/my-bookings">My Bookings</Link>
//                 </li>
                
//                 {profile?.role === 'admin' && (
//                   <li>
//                     <Link href="/admin">Admin</Link>
//                   </li>
//                 )}
                
//                 <li>
//                   <button 
//                     onClick={handleLogout} 
//                     className="logout-btn"
//                   >
//                     Logout
//                   </button>
//                 </li>
                
//                 <li className="user-info">
//                   <span className="user-name">
//                     👤 {profile?.full_name || user.email?.split('@')[0] || 'User'}
//                   </span>
//                 </li>
//               </>
//             ) : (
//               <>
//                 <li>
//                   <Link href="/login">Login</Link>
//                 </li>
//                 <li>
//                   <Link href="/register">
//                     <span className="register-btn-nav">Register</span>
//                   </Link>
//                 </li>
//               </>
//             )}
//           </ul>
//         </nav>
//       </header>

//       {/* DEBUG INFO - REMOVE AFTER FIXING */}
//       <div style={{
//         position: 'fixed',
//         bottom: 10,
//         right: 10,
//         background: 'rgba(0,0,0,0.9)',
//         color: 'white',
//         padding: '15px',
//         borderRadius: '8px',
//         fontSize: '11px',
//         fontFamily: 'monospace',
//         zIndex: 99999,
//         maxWidth: '300px',
//         border: '2px solid #667eea'
//       }}>
//         <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
//           🔍 NAVBAR DEBUG
//         </div>
//         <div>Loading: <strong>{loading ? 'YES ⏳' : 'NO ✅'}</strong></div>
//         <div>User: <strong>{user?.email || 'null'}</strong></div>
//         <div>Profile: <strong>{profile?.full_name || 'null'}</strong></div>
//         <div>Role: <strong>{profile?.role || 'null'}</strong></div>
//         <div style={{ marginTop: '8px', color: '#fbbf24' }}>
//           Status: {debugInfo}
//         </div>
//         <button 
//           onClick={() => {
//             console.log('🔄 Manual reload triggered')
//             setLoading(true)
//             loadUserData()
//           }}
//           style={{
//             marginTop: '10px',
//             padding: '6px 12px',
//             background: '#667eea',
//             border: 'none',
//             borderRadius: '4px',
//             color: 'white',
//             cursor: 'pointer',
//             width: '100%',
//             fontWeight: 'bold'
//           }}
//         >
//           🔄 Force Reload
//         </button>
//       </div>
//     </>
//   )
// }

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
