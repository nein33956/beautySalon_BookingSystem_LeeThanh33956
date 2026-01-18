

// import { createServerClient } from '@supabase/ssr'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   const startTime = Date.now()
//   console.log('\n🔍 ===== MIDDLEWARE START =====')
//   console.log('📍 Path:', req.nextUrl.pathname)
//   console.log('🌐 URL:', req.url)
  
//   let res = NextResponse.next()

//   // Create Supabase client
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         get(name: string) {
//           const value = req.cookies.get(name)?.value
//           console.log(`🍪 GET Cookie [${name}]:`, value ? 'EXISTS' : 'MISSING')
//           return value
//         },
//         set(name: string, value: string, options: any) {
//           console.log(`🍪 SET Cookie [${name}]`)
//           req.cookies.set({ name, value, ...options })
//           res = NextResponse.next({
//             request: { headers: req.headers },
//           })
//           res.cookies.set({ name, value, ...options })
//         },
//         remove(name: string, options: any) {
//           console.log(`🍪 REMOVE Cookie [${name}]`)
//           req.cookies.set({ name, value: '', ...options })
//           res = NextResponse.next({
//             request: { headers: req.headers },
//           })
//           res.cookies.set({ name, value: '', ...options })
//         },
//       },
//     }
//   )

//   // Get session
//   console.log('⏳ Getting session...')
//   const {
//     data: { session },
//     error: sessionError
//   } = await supabase.auth.getSession()

//   console.log('👤 Session:', {
//     exists: !!session,
//     userId: session?.user?.id,
//     email: session?.user?.email,
//     error: sessionError?.message
//   })

//   const path = req.nextUrl.pathname

//   // Check if path is protected
//   const protectedPaths = ['/booking', '/my-bookings', '/profile', '/admin']
//   const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

//   console.log('🔒 Protected path:', isProtectedPath)

//   // If protected and no session → redirect to login
//   if (isProtectedPath && !session) {
//     console.log('❌ NO SESSION → Redirecting to /login')
//     const redirectUrl = req.nextUrl.clone()
//     redirectUrl.pathname = '/login'
//     redirectUrl.searchParams.set('redirectTo', path)
//     console.log('🔀 Redirect URL:', redirectUrl.toString())
//     console.log('⏱️  Middleware took:', Date.now() - startTime, 'ms')
//     console.log('===== MIDDLEWARE END =====\n')
//     return NextResponse.redirect(redirectUrl)
//   }

//   // If logged in, check role-based access
//   if (session) {
//     console.log('📋 Fetching profile for role check...')
//     const { data: profile, error: profileError } = await supabase
//       .from('profiles')
//       .select('role')
//       .eq('id', session.user.id)
//       .single()

//     const userRole = profile?.role || 'customer'

//     console.log('👤 Profile:', {
//       role: userRole,
//       error: profileError?.message
//     })

//     // ADMIN ROUTES - Only admin can access
//     if (path.startsWith('/admin')) {
//       console.log('👑 Admin path detected')
      
//       if (userRole !== 'admin') {
//         console.log('❌ Not admin → Redirect to /my-bookings')
//         console.log('===== MIDDLEWARE END =====\n')
//         return NextResponse.redirect(new URL('/my-bookings', req.url))
//       }

//       console.log('✅ Admin access granted')
//     }

//     // CUSTOMER ROUTES - Redirect admin to admin panel
//     if (path.startsWith('/my-bookings') || path.startsWith('/booking') || path.startsWith('/profile')) {
//       console.log('🛍️  Customer path detected')
      
//       if (userRole === 'admin') {
//         console.log('👑 Admin user → Redirect to /admin (unless explicitly accessing these pages)')
//         // Allow admin to access customer pages if they want, but default redirect
//         if (path === '/my-bookings' && !req.nextUrl.searchParams.has('force')) {
//           console.log('🔀 Redirecting admin to /admin')
//           console.log('===== MIDDLEWARE END =====\n')
//           return NextResponse.redirect(new URL('/admin', req.url))
//         }
//       }

//       console.log('✅ Customer access granted')
//     }

//     // LOGIN/REGISTER - Redirect based on role if already logged in
//     if (path === '/login' || path === '/register') {
//       console.log('🔐 Login/Register page - User already logged in')
      
//       const redirectTo = req.nextUrl.searchParams.get('redirectTo')
      
//       if (redirectTo) {
//         console.log(`🔀 Redirecting to: ${redirectTo}`)
//         return NextResponse.redirect(new URL(redirectTo, req.url))
//       }
      
//       if (userRole === 'admin') {
//         console.log('🔀 Admin → Redirect to /admin')
//         return NextResponse.redirect(new URL('/admin', req.url))
//       } else {
//         console.log('🔀 Customer → Redirect to /my-bookings')
//         return NextResponse.redirect(new URL('/my-bookings', req.url))
//       }
//     }
//   }

//   console.log('✅ ACCESS GRANTED')
//   console.log('⏱️  Middleware took:', Date.now() - startTime, 'ms')
//   console.log('===== MIDDLEWARE END =====\n')
//   return res
// }

// export const config = {
//   matcher: [
//     '/booking/:path*', 
//     '/my-bookings/:path*', 
//     '/profile/:path*',
//     '/admin/:path*',
//     '/login',
//     '/register'
//   ],
// }

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const startTime = Date.now()
  console.log('\n🔍 ===== MIDDLEWARE START =====')
  console.log('📍 Path:', req.nextUrl.pathname)
  console.log('🌐 URL:', req.url)
  
  let res = NextResponse.next()

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = req.cookies.get(name)?.value
          console.log(`🍪 GET Cookie [${name}]:`, value ? 'EXISTS' : 'MISSING')
          return value
        },
        set(name: string, value: string, options: any) {
          console.log(`🍪 SET Cookie [${name}]`)
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: { headers: req.headers },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          console.log(`🍪 REMOVE Cookie [${name}]`)
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: { headers: req.headers },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get session
  console.log('⏳ Getting session...')
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  console.log('👤 Session:', {
    exists: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    error: sessionError?.message
  })

  const path = req.nextUrl.pathname

  // Check if path is protected
  const protectedPaths = ['/booking', '/my-bookings', '/profile', '/admin', '/staff']
  const isProtectedPath = protectedPaths.some(p => path.startsWith(p))

  console.log('🔒 Protected path:', isProtectedPath)

  // If protected and no session → redirect to login
  if (isProtectedPath && !session) {
    console.log('❌ NO SESSION → Redirecting to /login')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', path)
    console.log('🔀 Redirect URL:', redirectUrl.toString())
    console.log('⏱️  Middleware took:', Date.now() - startTime, 'ms')
    console.log('===== MIDDLEWARE END =====\n')
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in, check role-based access
  if (session) {
    console.log('📋 Fetching profile for role check...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const userRole = profile?.role || 'customer'

    console.log('👤 Profile:', {
      role: userRole,
      error: profileError?.message
    })

    // ==================== ADMIN ROUTES ====================
    // Only admin can access
    if (path.startsWith('/admin')) {
      console.log('👑 Admin path detected')
      
      if (userRole !== 'admin') {
        console.log('❌ Not admin → Redirect to /my-bookings')
        console.log('===== MIDDLEWARE END =====\n')
        return NextResponse.redirect(new URL('/my-bookings', req.url))
      }

      console.log('✅ Admin access granted')
    }

    // ==================== STAFF ROUTES ====================
    // Only staff and admin can access
    if (path.startsWith('/staff')) {
      console.log('👨‍💼 Staff path detected')
      
      if (userRole !== 'staff' && userRole !== 'admin') {
        console.log('❌ Not staff/admin → Redirect to /my-bookings')
        console.log('===== MIDDLEWARE END =====\n')
        return NextResponse.redirect(new URL('/my-bookings', req.url))
      }

      console.log('✅ Staff access granted')
    }

    // ==================== CUSTOMER ROUTES ====================
    // Redirect admin/staff to their respective panels
    if (path.startsWith('/my-bookings') || path.startsWith('/booking') || path.startsWith('/profile')) {
      console.log('🛍️  Customer path detected')
      
      // Redirect admin to admin panel (unless force parameter)
      if (userRole === 'admin' && path === '/my-bookings' && !req.nextUrl.searchParams.has('force')) {
        console.log('👑 Admin user → Redirect to /admin')
        console.log('===== MIDDLEWARE END =====\n')
        return NextResponse.redirect(new URL('/admin', req.url))
      }

      // Redirect staff to staff panel
      if (userRole === 'staff' && path === '/my-bookings' && !req.nextUrl.searchParams.has('force')) {
        console.log('👨‍💼 Staff user → Redirect to /staff')
        console.log('===== MIDDLEWARE END =====\n')
        return NextResponse.redirect(new URL('/staff', req.url))
      }

      console.log('✅ Customer access granted')
    }

    // ==================== LOGIN/REGISTER REDIRECT ====================
    // Redirect based on role if already logged in
    if (path === '/login' || path === '/register') {
      console.log('🔐 Login/Register page - User already logged in')
      
      const redirectTo = req.nextUrl.searchParams.get('redirectTo')
      
      if (redirectTo) {
        console.log(`🔀 Redirecting to: ${redirectTo}`)
        return NextResponse.redirect(new URL(redirectTo, req.url))
      }
      
      if (userRole === 'admin') {
        console.log('🔀 Admin → Redirect to /admin')
        return NextResponse.redirect(new URL('/admin', req.url))
      } else if (userRole === 'staff') {
        console.log('🔀 Staff → Redirect to /staff')
        return NextResponse.redirect(new URL('/staff', req.url))
      } else {
        console.log('🔀 Customer → Redirect to /my-bookings')
        return NextResponse.redirect(new URL('/my-bookings', req.url))
      }
    }
  }

  console.log('✅ ACCESS GRANTED')
  console.log('⏱️  Middleware took:', Date.now() - startTime, 'ms')
  console.log('===== MIDDLEWARE END =====\n')
  return res
}

export const config = {
  matcher: [
    '/booking/:path*', 
    '/my-bookings/:path*', 
    '/profile/:path*',
    '/admin/:path*',
    '/staff/:path*',
    '/login',
    '/register'
  ],
}