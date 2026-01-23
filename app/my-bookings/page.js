// my-bookings/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-400',
    icon: '⏳'
  },
  confirmed: {
    label: 'Confirmed',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-400',
    icon: '✓'
  },
  completed: {
    label: 'Completed',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-400',
    icon: '✓✓'
  },
  cancelled: {
    label: 'Cancelled',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-400',
    icon: '✗'
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [filter, setFilter] = useState('active') // Default to 'active' (hide cancelled)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [filter, bookings])

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'admin') {
        router.replace('/admin/dashboard')
        return
      }

      // Fetch directly from Supabase
      const { data: bookingsData, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          services!inner(id, name, duration, price, category, image_url),
          staff(id, name, specialization, avatar_url)
        `)
        .eq('customer_id', user.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })
      
      if (fetchError) throw fetchError
      
      // Transform data to match expected format
      const transformedData = bookingsData?.map(booking => ({
        ...booking,
        service: booking.services,
        services: undefined
      })) || []
      
      setBookings(transformedData)
    } catch (err) {
      setError(err.message)
      console.error('Fetch bookings error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilter = () => {
    const now = new Date()
    
    if (filter === 'all') {
      setFilteredBookings(bookings)
      return
    }

    const filtered = bookings.filter(booking => {
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
      const isPast = bookingDateTime < now
      const isActive = (booking.status === 'pending' || booking.status === 'confirmed')

      if (filter === 'active') {
        // Only show active bookings in the future
        return isActive && !isPast
      } else if (filter === 'upcoming') {
        // Show pending/confirmed bookings in the future
        return isActive && !isPast
      } else if (filter === 'past') {
        // Show past bookings OR completed/cancelled
        return isPast || booking.status === 'completed' || booking.status === 'cancelled'
      }
      return true
    })

    setFilteredBookings(filtered)
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setCancellingId(bookingId)
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancel_reason: 'Customer cancelled'
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking')
      }
      
      alert('✅ Booking cancelled successfully!')
      await fetchBookings() // Refresh list
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    } finally {
      setCancellingId(null)
    }
  }

  const canCancelBooking = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false
    }
    
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60)
    
    return hoursUntilBooking > 2
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (timeString) => {
    return timeString.substring(0, 5)
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #ede9fe 100%)',
        padding: '3rem 1rem'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #ec4899',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Loading your bookings...</p>
          </div>
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
      background: 'linear-gradient(135deg, #B3446C 0%, #E3CCDC 50%, #008292 100%)',
      padding: '3rem 1rem'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              My Bookings
            </h1>
            <span style={{ fontSize: '2rem' }}>📅</span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '1.125rem', margin: 0 }}>
            Manage all your appointments
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ 
          background: '#f3f4f6', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { key: 'active', label: 'Active' },
              { key: 'all', label: 'All', count: bookings.length },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: filter === tab.key 
                    ? 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)'
                    : '#f3f4f6',
                  color: filter === tab.key ? 'white' : '#374151',
                  transform: filter === tab.key ? 'translateY(-2px)' : 'none',
                  boxShadow: filter === tab.key ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none'
                }}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{ color: '#991b1b', margin: 0, fontWeight: '500' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {filteredBookings.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            padding: '4rem 2rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              No bookings found
            </h3>
            <p style={{ color: '#6b7280', fontSize: '1.125rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              {filter === 'all' 
                ? "You don't have any bookings yet. Book your first appointment to get started!"
                : `No ${filter} bookings found. Try a different filter.`}
            </p>
            <Link
              href="/booking"
              style={{
                display: 'inline-block',
                padding: '1rem 2.5rem',
                background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.125rem',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.3)'
              }}
            >
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <>
            {/* Bookings Grid */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {filteredBookings.map((booking) => {
                const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
                const isCancelling = cancellingId === booking.id
                
                return (
                  <div
                    key={booking.id}
                    style={{
                      background: '#EACFA3',
                      borderRadius: '20px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      border: '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'none'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                    }}
                  >
                    {/* Card Header - Colored Strip */}
                    <div style={{
                      height: '6px',
                      background: booking.status === 'confirmed' 
                        ? 'linear-gradient(90deg, #10b981, #059669)'
                        : booking.status === 'pending'
                        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : booking.status === 'completed'
                        ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
                        : 'linear-gradient(90deg, #ef4444, #dc2626)'
                    }} />

                    <div style={{ padding: '1.5rem' }}>
                      {/* Service Name & Status */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: '#111827', 
                            marginBottom: '0.5rem',
                            margin: 0
                          }}>
                            {booking.service?.name || 'Service'}
                          </h3>
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#9ca3af',
                            margin: 0
                          }}>
                            Booking #{booking.id.substring(0, 8)}
                          </p>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          background: statusConfig.bgColor,
                          color: statusConfig.textColor,
                          border: `2px solid ${statusConfig.borderColor.replace('border-', '')}`
                        }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: statusConfig.dotColor.replace('bg-', ''),
                            display: 'inline-block'
                          }} />
                          {statusConfig.label}
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.25rem',
                        padding: '1.25rem',
                        background: '#f9fafb',
                        borderRadius: '12px',
                        marginBottom: '1rem'
                      }}>
                        {/* Date & Time */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            📅 Date & Time
                          </div>
                          <div style={{ color: '#111827', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {formatDate(booking.booking_date)}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </div>
                        </div>

                        {/* Staff */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            👤 Staff
                          </div>
                          <div style={{ color: '#111827', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {booking.staff?.name || 'Any Available'}
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            {booking.staff?.specialization || 'Staff Member'}
                          </div>
                        </div>

                        {/* Duration & Price */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            ⏱️ Duration & Price
                          </div>
                          <div style={{ color: '#111827', fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                            {booking.service?.duration} minutes
                          </div>
                          <div style={{ color: '#ec4899', fontSize: '1.25rem', fontWeight: 'bold' }}>
                            {booking.total_price?.toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div style={{
                          background: '#eff6ff',
                          border: '2px solid #dbeafe',
                          borderRadius: '12px',
                          padding: '1rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '600', marginBottom: '0.5rem' }}>
                            💬 NOTES
                          </div>
                          <p style={{ color: '#1e3a8a', margin: 0, fontSize: '0.95rem' }}>{booking.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link
                          href={`/my-bookings/${booking.id}`}
                          style={{
                            flex: 1,
                            padding: '0.875rem',
                            background: '#f3f4f6',
                            color: '#374151',
                            textDecoration: 'none',
                            borderRadius: '12px',
                            fontWeight: '600',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            border: '2px solid #e5e7eb'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e5e7eb'
                            e.currentTarget.style.borderColor = '#d1d5db'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f3f4f6'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                          }}
                        >
                          View Details →
                        </Link>
                        
                        {canCancelBooking(booking) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isCancelling}
                            style={{
                              flex: 1,
                              padding: '0.875rem',
                              background: isCancelling ? '#fca5a5' : '#fee2e2',
                              color: '#991b1b',
                              border: '2px solid #fecaca',
                              borderRadius: '12px',
                              fontWeight: '600',
                              cursor: isCancelling ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              opacity: isCancelling ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!isCancelling) {
                                e.currentTarget.style.background = '#fecaca'
                                e.currentTarget.style.borderColor = '#fca5a5'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCancelling) {
                                e.currentTarget.style.background = '#fee2e2'
                                e.currentTarget.style.borderColor = '#fecaca'
                              }
                            }}
                          >
                            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Book New Button */}
            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <Link
                href="/booking"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '16px',
                  fontWeight: '600',
                  fontSize: '1.125rem',
                  boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(236, 72, 153, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)'
                }}
              >
                + Book New Appointment
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}