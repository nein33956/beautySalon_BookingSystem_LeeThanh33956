// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import Link from 'next/link'

// export default function LoginPage() {
//   const router = useRouter()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const handleLogin = async (e) => {
//     e.preventDefault()
//     console.log('\n🔐 ===== LOGIN START =====')
//     console.log('📧 Email:', email)
//     setLoading(true)
//     setError('')

//     console.log('⏳ Calling signInWithPassword...')
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })

//     console.log('📊 Login result:', {
//       success: !!data.session,
//       userId: data.session?.user?.id,
//       email: data.session?.user?.email,
//       error: error?.message
//     })
//     if (error) {
//       console.log('❌ Login error:', error)
//       setError(error.message)
//       setLoading(false)
//     } else {
//       console.log('✅ Login success!')
//       console.log('🍪 Waiting for cookies to be set...')
//       await new Promise(resolve => setTimeout(resolve, 1000))
    
//       console.log('🔀 Redirecting to /')
//       router.push('/')
//       router.refresh()
//       console.log('===== LOGIN END =====\n')
//     }
//   }
//   // const handleLogin = async (e) => {
//   //   e.preventDefault()
//   //   setLoading(true)
//   //   setError('')

//   //   const { data, error } = await supabase.auth.signInWithPassword({
//   //     email,
//   //     password,
//   //   })

//   //   if (error) {
//   //     setError(error.message)
//   //     setLoading(false)
//   //   } else {
//   //     router.push('/')
//   //     router.refresh()
//   //   }
//   // }

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h1>Login</h1>
//         <p className="auth-subtitle">Welcome back to Beauty Salon</p>

//         {error && (
//           <div className="error-banner">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleLogin}>
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="your@email.com"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <button 
//             type="submit" 
//             className="btn-primary"
//             disabled={loading}
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Don't have an account?{' '}
//           <Link href="/register">Register</Link>
//         </p>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log('\n🔐 ===== LOGIN START =====')
    console.log('📧 Email:', email)
    setLoading(true)
    setError('')

    try {
      console.log('⏳ Calling signInWithPassword...')
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('📊 Login result:', {
        success: !!data.session,
        userId: data.session?.user?.id,
        email: data.session?.user?.email,
        error: signInError?.message
      })

      if (signInError) {
        throw signInError
      }

      if (!data.session) {
        throw new Error('No session created')
      }

      console.log('✅ Login success!')
      console.log('🍪 Session created, cookies should be set')
      
      // ✅ Verify session was saved
      const { data: sessionCheck } = await supabase.auth.getSession()
      console.log('🔍 Session check:', {
        exists: !!sessionCheck.session,
        userId: sessionCheck.session?.user?.id
      })

      if (!sessionCheck.session) {
        throw new Error('Session not persisted!')
      }

      // ✅ Small delay to ensure cookies are written
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('🔀 Redirecting to /')
      
      // Force a full page reload to ensure middleware picks up new cookies
      window.location.href = '/'
      
    } catch (err) {
      console.error('❌ Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back to Beauty Salon</p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link href="/register">Register</Link>
        </p>
      </div>
    </div>
  )
}