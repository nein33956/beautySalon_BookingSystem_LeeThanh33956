// import { createServerClient } from '@supabase/ssr'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next()
//   const supabase = createServerClient({ req, res })

//   // Get user session
//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   // Protected routes - require authentication
//   const protectedPaths = ['/booking', '/my-bookings', '/admin']
//   const isProtectedPath = protectedPaths.some(path => 
//     req.nextUrl.pathname.startsWith(path)
//   )

//   // If accessing protected route without login -> redirect to login
//   if (isProtectedPath && !session) {
//     const redirectUrl = req.nextUrl.clone()
//     redirectUrl.pathname = '/login'
//     // Save original URL to redirect back after login
//     redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
//     return NextResponse.redirect(redirectUrl)
//   }

//   // Admin-only routes
//   if (req.nextUrl.pathname.startsWith('/admin')) {
//     if (!session) {
//       return NextResponse.redirect(new URL('/login', req.url))
//     }

//     // Check if user is admin
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('role')
//       .eq('id', session.user.id)
//       .single()

//     if (profile?.role !== 'admin') {
//       // Not admin -> redirect to home
//       return NextResponse.redirect(new URL('/', req.url))
//     }
//   }

//   return res
// }

// // Configure which routes to run middleware on
// export const config = {
//   matcher: [
//     '/booking/:path*',
//     '/my-bookings/:path*',
//     '/admin/:path*',
//   ],
// }

// import { createServerClient } from '@supabase/ssr'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(req: NextRequest) {
//   let res = NextResponse.next()

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll: () => req.cookies.getAll(),
//         setAll: cookies => {
//           cookies.forEach(cookie => {
//             res.cookies.set(cookie.name, cookie.value, cookie.options)
//           })
//         },
//       },
//     }
//   )

//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   const protectedPaths = ['/booking', '/my-bookings', '/admin']
//   const isProtectedPath = protectedPaths.some(path =>
//     req.nextUrl.pathname.startsWith(path)
//   )

//   // 🔒 Require login
//   if (isProtectedPath && !session) {
//     const redirectUrl = req.nextUrl.clone()
//     redirectUrl.pathname = '/login'
//     redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
//     return NextResponse.redirect(redirectUrl)
//   }

//   // 🔐 Admin only
//   if (req.nextUrl.pathname.startsWith('/admin')) {
//     if (!session) {
//       return NextResponse.redirect(new URL('/login', req.url))
//     }

//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('role')
//       .eq('id', session.user.id)
//       .single()

//     if (profile?.role !== 'admin') {
//       return NextResponse.redirect(new URL('/', req.url))
//     }
//   }

//   return res
// }

// export const config = {
//   matcher: ['/booking/:path*', '/my-bookings/:path*', '/admin/:path*'],
// }

// import { createServerClient } from '@supabase/ssr'
// import { NextResponse } from 'next/server'

// export async function middleware(request) {
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   })

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
//     {
//       cookies: {
//         get(name) {
//           return request.cookies.get(name)?.value
//         },
//         set(name, value, options) {
//           request.cookies.set({
//             name,
//             value,
//             ...options,
//           })
//           response = NextResponse.next({
//             request: {
//               headers: request.headers,
//             },
//           })
//           response.cookies.set({
//             name,
//             value,
//             ...options,
//           })
//         },
//         remove(name, options) {
//           request.cookies.set({
//             name,
//             value: '',
//             ...options,
//           })
//           response = NextResponse.next({
//             request: {
//               headers: request.headers,
//             },
//           })
//           response.cookies.set({
//             name,
//             value: '',
//             ...options,
//           })
//         },
//       },
//     }
//   )

//   // Get user session
//   const {
//     data: { session },
//   } = await supabase.auth.getSession()

//   // Protected routes
//   const protectedPaths = ['/booking', '/my-bookings']
//   const isProtectedPath = protectedPaths.some(path => 
//     request.nextUrl.pathname.startsWith(path)
//   )

//   // Admin routes
//   const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

//   // If accessing protected route without login -> redirect to login
//   if (isProtectedPath && !session) {
//     const redirectUrl = new URL('/login', request.url)
//     redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
//     return NextResponse.redirect(redirectUrl)
//   }

//   // If accessing admin route
//   if (isAdminPath) {
//     if (!session) {
//       return NextResponse.redirect(new URL('/login', request.url))
//     }

//     // Check if user is admin
//     const { data: profile } = await supabase
//       .from('profiles')
//       .select('role')
//       .eq('id', session.user.id)
//       .single()

//     if (profile?.role !== 'admin') {
//       return NextResponse.redirect(new URL('/', request.url))
//     }
//   }

//   return response
// }

// export const config = {
//   matcher: [
//     '/booking/:path*',
//     '/my-bookings/:path*',
//     '/admin/:path*',
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

  // Check if path is protected
  const protectedPaths = ['/booking', '/my-bookings', '/admin']
  const isProtectedPath = protectedPaths.some(path =>
    req.nextUrl.pathname.startsWith(path)
  )

  console.log('🔒 Protected path:', isProtectedPath)

  // If protected and no session → redirect to login
  if (isProtectedPath && !session) {
    console.log('❌ NO SESSION → Redirecting to /login')
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    console.log('🔀 Redirect URL:', redirectUrl.toString())
    console.log('⏱️  Middleware took:', Date.now() - startTime, 'ms')
    console.log('===== MIDDLEWARE END =====\n')
    return NextResponse.redirect(redirectUrl)
  }

  // Admin check
  if (req.nextUrl.pathname.startsWith('/admin')) {
    console.log('👑 Admin path detected')
    
    if (!session) {
      console.log('❌ No session for admin → Redirect to /login')
      console.log('===== MIDDLEWARE END =====\n')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log('📋 Fetching profile for admin check...')
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    console.log('👤 Profile:', {
      role: profile?.role,
      error: profileError?.message
    })

    if (profile?.role !== 'admin') {
      console.log('❌ Not admin → Redirect to /')
      console.log('===== MIDDLEWARE END =====\n')
      return NextResponse.redirect(new URL('/', req.url))
    }

    console.log('✅ Admin access granted')
  }

  console.log('✅ ACCESS GRANTED')
  console.log('⏱️  Middleware took:', Date.now() - startTime, 'ms')
  console.log('===== MIDDLEWARE END =====\n')
  return res
}

export const config = {
  matcher: ['/booking/:path*', '/my-bookings/:path*', '/admin/:path*'],
}