// app/api/bookings/[id]/cancel/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * PATCH /api/bookings/[id]/cancel
 * Cancel a booking (with 2-hour rule)
 */
export async function PATCH(request, { params }) {
  try {
    const supabase = getSupabaseClient()
    const { id } = params
    
    // Parse body
    const body = await request.json()
    const { cancel_reason } = body
    
    console.log('📍 Cancelling booking:', id)
    
    // Get booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError || !booking) {
      console.error('❌ Booking not found:', fetchError)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    console.log('✅ Booking found:', booking.booking_date, booking.start_time)
    
    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      )
    }
    
    // Check if already completed
    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed bookings' },
        { status: 400 }
      )
    }
    
    // Check 2-hour rule
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60)
    
    console.log('⏰ Hours until booking:', hoursUntilBooking.toFixed(2))
    
    if (hoursUntilBooking <= 2) {
      return NextResponse.json(
        { 
          error: 'Cannot cancel booking less than 2 hours before appointment time. Please contact the salon.',
          hoursRemaining: hoursUntilBooking.toFixed(1)
        },
        { status: 400 }
      )
    }
    
    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: cancel_reason || 'Customer cancelled'
      })
      .eq('id', id)
      .select(`
        *,
        service:services(id, name, duration, price),
        staff:staff(id, name)
      `)
      .single()
    
    if (updateError) {
      console.error('❌ Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to cancel booking: ' + updateError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Booking cancelled successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    })
    
  } catch (error) {
    console.error('❌ Cancel booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}