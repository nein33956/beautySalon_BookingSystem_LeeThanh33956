'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    icon: '⏳'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-800 border-green-300',
    icon: '✓'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '✓✓'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: '✗'
  }
}

export default function MyBookingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

      const response = await fetch('/api/bookings')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings')
      }
      
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err.message)
      console.error('Fetch bookings error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilter = () => {
    if (filter === 'all') {
      setFilteredBookings(bookings)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const filtered = bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date)
      bookingDate.setHours(0, 0, 0, 0)

      if (filter === 'upcoming') {
        return bookingDate >= today && 
               (booking.status === 'pending' || booking.status === 'confirmed')
      } else if (filter === 'past') {
        return bookingDate < today || 
               booking.status === 'completed' || 
               booking.status === 'cancelled'
      }
      return true
    })

    setFilteredBookings(filtered)
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
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
      
      alert('Booking cancelled successfully!')
      fetchBookings() // Refresh list
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const canCancelBooking = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      return false
    }
    
    // Check if booking is at least 2 hours away
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
    return timeString.substring(0, 5) // "10:00:00" -> "10:00"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            My Bookings 📅
          </h1>
          <p className="text-gray-600">
            Manage all your appointments
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'upcoming'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                filter === 'past'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You don't have any bookings yet. Book your first appointment!"
                : `No ${filter} bookings found.`}
            </p>
            <Link
              href="/booking"
              className="inline-block px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
            >
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
              
              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.service?.name}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Booking ID: #{booking.id.substring(0, 8)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-pink-600">
                          {booking.total_price?.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-semibold text-gray-900">
                            {formatDate(booking.booking_date)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </p>
                        </div>
                      </div>

                      {/* Staff */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">👤</span>
                        <div>
                          <p className="text-sm text-gray-500">Staff</p>
                          <p className="font-semibold text-gray-900">
                            {booking.staff?.name || 'Any available'}
                          </p>
                          {booking.staff?.specialization && (
                            <p className="text-sm text-gray-600">{booking.staff.specialization}</p>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">
                            {booking.service?.duration} minutes
                          </p>
                          <p className="text-sm text-gray-600">{booking.service?.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-500 mb-1">💬 Notes:</p>
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Link
                        href={`/my-bookings/${booking.id}`}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </Link>
                      
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Book New Button */}
        <div className="mt-8 text-center">
          <Link
            href="/booking"
            className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            + Book New Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}