'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, cancelled: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    avatar_url: ''
  })
  
  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        router.push('/login')
        return
      }
      
      setUser(authUser)
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      
      if (profileError) throw profileError
      
      setProfile(profileData)
      setFormData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        avatar_url: profileData.avatar_url || ''
      })
    } catch (err) {
      setError(err.message)
      console.error('Fetch profile error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      
      const { data: bookings } = await supabase
        .from('bookings')
        .select('status')
        .eq('customer_id', authUser.id)
      
      if (bookings) {
        setStats({
          total: bookings.length,
          completed: bookings.filter(b => b.status === 'completed').length,
          pending: bookings.filter(b => b.status === 'pending').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length
        })
      }
    } catch (err) {
      console.error('Fetch stats error:', err)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone
        })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      await fetchProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }
    
    setIsUploadingAvatar(true)
    setError(null)
    
    try {
      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop()
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
      }
      
      // Upload new avatar
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)
      
      if (updateError) throw updateError
      
      setSuccess('Avatar updated successfully!')
      await fetchProfile()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })
      
      if (updateError) throw updateError
      
      setSuccess('Password changed successfully!')
      setShowPasswordForm(false)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #ede9fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #ec4899',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading profile...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #ede9fe 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            My Profile
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Manage your account settings
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: '#fee2e2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991b1b'
          }}>
            ⚠️ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            background: '#d1fae5',
            border: '2px solid #a7f3d0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#065f46'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Bookings', value: stats.total, icon: '📊', color: '#ec4899' },
            { label: 'Completed', value: stats.completed, icon: '✓', color: '#10b981' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: '#f59e0b' },
            { label: 'Cancelled', value: stats.cancelled, icon: '✗', color: '#ef4444' }
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color, marginBottom: '0.25rem' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          marginBottom: '1.5rem'
        }}>
          {/* Avatar Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                overflow: 'hidden',
                margin: '0 auto',
                border: '4px solid white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  '👤'
                )}
              </div>
              
              <label style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                background: 'white',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                border: '2px solid #ec4899'
              }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  style={{ display: 'none' }}
                />
                {isUploadingAvatar ? '⏳' : '📷'}
              </label>
            </div>
            
            <h2 style={{ 
              color: 'white', 
              fontSize: '1.75rem', 
              fontWeight: 'bold', 
              marginTop: '1rem',
              marginBottom: '0.25rem'
            }}>
              {formData.full_name || 'Your Name'}
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {user?.email}
            </p>
          </div>

          {/* Form Section */}
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Personal Information</h3>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                ) : (
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', fontWeight: '500' }}>
                    {formData.full_name || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                ) : (
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', fontWeight: '500' }}>
                    {formData.phone || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', fontWeight: '500', color: '#6b7280' }}>
                  {user?.email} (Cannot be changed)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Account Role
                </label>
                <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', fontWeight: '500' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {profile?.role?.toUpperCase() || 'CUSTOMER'}
                  </span>
                </div>
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setFormData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || '',
                      avatar_url: profile.avatar_url || ''
                    })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.6 : 1
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Password & Security</h3>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: '0.5rem 1.25rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Change Password
              </button>
            )}
          </div>

          {showPasswordForm && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => {
                    setShowPasswordForm(false)
                    setPasswordData({ newPassword: '', confirmPassword: '' })
                  }}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    opacity: isSaving ? 0.6 : 1
                  }}
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '1rem 2.5rem',
              background: '#fee2e2',
              color: '#991b1b',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  )
}