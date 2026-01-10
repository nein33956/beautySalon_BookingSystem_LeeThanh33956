// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
// import Link from 'next/link'

// export default function RegisterPage() {
//   const router = useRouter()
//   const [formData, setFormData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   })
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     })
//   }

//   // const handleRegister = async (e) => {
//   //   e.preventDefault()
//   //   setLoading(true)
//   //   setError('')

//   //   // Validation
//   //   if (formData.password !== formData.confirmPassword) {
//   //     setError('Passwords do not match')
//   //     setLoading(false)
//   //     return
//   //   }

//   //   if (formData.password.length < 6) {
//   //     setError('Password must be at least 6 characters')
//   //     setLoading(false)
//   //     return
//   //   }

//   //   // 1. Sign up user
//   //   const { data: authData, error: authError } = await supabase.auth.signUp({
//   //     email: formData.email,
//   //     password: formData.password,
//   //   })

//   //   if (authError) {
//   //     setError(authError.message)
//   //     setLoading(false)
//   //     return
//   //   }

//   //   // 2. Create profile
//   //   const { error: profileError } = await supabase
//   //     .from('profiles')
//   //     .insert({
//   //       id: authData.user.id,
//   //       full_name: formData.fullName,
//   //       phone: formData.phone,
//   //       role: 'customer',
//   //     })

//   //   if (profileError) {
//   //     setError('Failed to create profile')
//   //     setLoading(false)
//   //     return
//   //   }

//   //   // 3. Create customer record
//   //   const { error: customerError } = await supabase
//   //     .from('customers')
//   //     .insert({
//   //       id: authData.user.id,
//   //     })

//   //   if (customerError) {
//   //     setError('Failed to create customer record')
//   //     setLoading(false)
//   //     return
//   //   }

//   //   // Success
//   //   alert('Registration successful! Please check your email to verify.')
//   //   router.push('/login')
//   // }
//   const handleRegister = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError('')

//     // Validation
//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match')
//       setLoading(false)
//       return
//     }

//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters')
//       setLoading(false)
//       return
//     }

//     // 1. Sign up user với metadata
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email: formData.email,
//       password: formData.password,
//       options: {
//         data: {
//           full_name: formData.fullName,
//           phone: formData.phone,
//         }
//       }
//     })

//     if (authError) {
//       setError(authError.message)
//       setLoading(false)
//       return
//     }

//     // Success - User cần verify email
//     alert('Registration successful! Please check your email to verify your account.')
//     router.push('/login')
//   }

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h1>Register</h1>
//         <p className="auth-subtitle">Create your Beauty Salon account</p>

//         {error && (
//           <div className="error-banner">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleRegister}>
//           <div className="form-group">
//             <label htmlFor="fullName">Full Name</label>
//             <input
//               type="text"
//               id="fullName"
//               name="fullName"
//               value={formData.fullName}
//               onChange={handleChange}
//               placeholder="John Doe"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               placeholder="your@email.com"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="phone">Phone</label>
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleChange}
//               placeholder="0901234567"
//               maxLength="10"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Password</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="confirmPassword">Confirm Password</label>
//             <input
//               type="password"
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               placeholder="••••••••"
//               required
//             />
//           </div>

//           <button 
//             type="submit" 
//             className="btn-primary"
//             disabled={loading}
//           >
//             {loading ? 'Creating account...' : 'Register'}
//           </button>
//         </form>

//         <p className="auth-footer">
//           Already have an account?{' '}
//           <Link href="/login">Login</Link>
//         </p>
//       </div>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // 1. Sign up user với metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      // ✅ 2. Wait a bit for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000))

      // ✅ 3. Verify profile was created
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      // ✅ 4. If trigger failed, create manually
      if (profileError || !profileCheck) {
        console.log('Trigger failed, creating profile manually...')
        
        // Create profile
        const { error: manualProfileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: formData.fullName,
            phone: formData.phone,
            role: 'customer',
          })

        if (manualProfileError) {
          console.error('Failed to create profile:', manualProfileError)
          throw new Error('Failed to create user profile')
        }

        // Create customer record
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: authData.user.id,
          })

        if (customerError) {
          console.error('Failed to create customer:', customerError)
          // Don't throw - customer record is less critical
        }
      }

      // Success
      alert('Registration successful! Please check your email to verify your account.')
      router.push('/login')
      
    } catch (err) {
      console.error('Registration error:', err)
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Register</h1>
        <p className="auth-subtitle">Create your Beauty Salon account</p>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0901234567"
              maxLength="10"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}