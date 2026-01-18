'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Confirmation',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-900',
    icon: '⏳',
    description: 'Waiting for salon confirmation'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'from-green-400 to-emerald-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-900',
    icon: '✓',
    description: 'Your appointment is confirmed'
  },
  completed: {
    label: 'Completed',
    color: 'from-blue-400 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900',
    icon: '✓✓',
    description: 'Service completed successfully'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'from-red-400 to-rose-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-900',
    icon: '✗',
    description: 'This booking was cancelled'
  }
}

export default function BookingDetailPage({ params }) {
  const router = useRouter()
  const supabase = createClient()
  
  const [booking, setBooking] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => {
    async function unwrapParams() {
      const unwrapped = await params
      setBookingId(unwrapped.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          services!inner(id, name, description, duration, price, category, image_url),
          staff(id, name, specialization, avatar_url, bio, years_of_experience)
        `)
        .eq('id', bookingId)
        .eq('customer_id', user.id)
        .single()
      
      // Get customer info separately
      const { data: customerData } = await supabase
        .from('profiles')
        .select('id, full_name, phone, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (data) {
        data.service = data.services
        data.customer = customerData
        delete data.services
      }
      
      if (fetchError) throw fetchError
      if (!data) throw new Error('Booking not found')
      
      setBooking(data)
    } catch (err) {
      setError(err.message)
      console.error('Fetch booking error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setIsCancelling(true)
    
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
        throw new Error(data.error || 'Failed to cancel')
      }
      
      alert('✅ Booking cancelled successfully!')
      await fetchBooking() // Refresh
    } catch (err) {
      alert(`❌ Error: ${err.message}`)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleRebook = () => {
    if (booking?.service?.id) {
      router.push(`/booking?service=${booking.service.id}`)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const canCancel = () => {
    if (!booking) return false
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false
    
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60)
    
    return hoursUntilBooking > 2
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString) => {
    return timeString?.substring(0, 5) || ''
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #ede9fe 100%)',
        padding: '3rem 1rem',
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
          <p style={{ color: '#6b7280' }}>Loading booking details...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #ede9fe 100%)',
        padding: '3rem 1rem'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😕</div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Booking Not Found
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>{error || 'This booking does not exist or you do not have access to it.'}</p>
          <Link
            href="/my-bookings"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600'
            }}
          >
            ← Back to My Bookings
          </Link>
        </div>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #ede9fe 100%)',
      padding: '2rem 1rem'
    }} className="print:bg-white">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <div style={{ marginBottom: '1.5rem' }} className="print:hidden">
          <Link
            href="/my-bookings"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: '500'
            }}
          >
            ← Back to My Bookings
          </Link>
        </div>

        {/* Main Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Status Header */}
          <div style={{
            background: `linear-gradient(135deg, ${statusConfig.color.replace('from-', '').replace('to-', ', ')})`,
            padding: '2rem',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{statusConfig.icon}</div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                  {statusConfig.label}
                </h1>
                <p style={{ opacity: 0.9, margin: 0 }}>{statusConfig.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>Booking ID</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', fontFamily: 'monospace' }}>
                  #{booking.id.substring(0, 8)}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '2rem' }}>
            
            {/* Service Info */}
            <section style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '1rem' }}>
                Service Details
              </h2>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                {booking.service?.image_url && (
                  <img 
                    src={booking.service.image_url} 
                    alt={booking.service.name}
                    style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', margin: 0 }}>
                    {booking.service?.name}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                    {booking.service?.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Category</div>
                      <div style={{ fontWeight: '600' }}>{booking.service?.category}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Duration</div>
                      <div style={{ fontWeight: '600' }}>{booking.service?.duration} minutes</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Price</div>
                      <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#ec4899' }}>
                        {booking.total_price?.toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Appointment Info */}
            <section style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '1rem' }}>
                Appointment Time
              </h2>
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>📅 Date</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{formatDate(booking.booking_date)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>⏰ Time</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                      {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Staff Info */}
            <section style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '1rem' }}>
                Staff Member
              </h2>
              {booking.staff ? (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {booking.staff.avatar_url ? (
                      <img src={booking.staff.avatar_url} alt={booking.staff.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : '👤'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>{booking.staff.name}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{booking.staff.specialization}</p>
                    {booking.staff.years_of_experience && (
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        {booking.staff.years_of_experience} years of experience
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                  Any available staff member
                </div>
              )}
            </section>

            {/* Customer Info */}
            <section style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '1rem' }}>
                Customer Information
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Name</div>
                  <div style={{ fontWeight: '600' }}>{booking.customer?.full_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Phone</div>
                  <div style={{ fontWeight: '600' }}>{booking.customer?.phone}</div>
                </div>
              </div>
            </section>

            {/* Notes */}
            {booking.notes && (
              <section style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
                <h2 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '1rem' }}>
                  Notes
                </h2>
                <div style={{ background: '#eff6ff', border: '2px solid #dbeafe', borderRadius: '12px', padding: '1rem' }}>
                  <p style={{ color: '#1e3a8a', margin: 0 }}>{booking.notes}</p>
                </div>
              </section>
            )}

            {/* Timestamps */}
            <section style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                <div>
                  <div style={{ marginBottom: '0.25rem' }}>Created at</div>
                  <div style={{ fontWeight: '500' }}>{formatDateTime(booking.created_at)}</div>
                </div>
                {booking.cancelled_at && (
                  <div>
                    <div style={{ marginBottom: '0.25rem' }}>Cancelled at</div>
                    <div style={{ fontWeight: '500' }}>{formatDateTime(booking.cancelled_at)}</div>
                  </div>
                )}
                {booking.cancel_reason && (
                  <div>
                    <div style={{ marginBottom: '0.25rem' }}>Cancel reason</div>
                    <div style={{ fontWeight: '500' }}>{booking.cancel_reason}</div>
                  </div>
                )}
              </div>
            </section>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} className="print:hidden">
              {canCancel() && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: '2px solid #fecaca',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: isCancelling ? 'not-allowed' : 'pointer',
                    opacity: isCancelling ? 0.6 : 1
                  }}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              
              <button
                onClick={handleRebook}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Book Again
              </button>
              
              <button
                onClick={handlePrint}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '1rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}