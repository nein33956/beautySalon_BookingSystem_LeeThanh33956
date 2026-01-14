// app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

/**
 * GET /api/bookings/[id] - Get a single booking by ID
 */
export async function GET(request, context) {
  try {
    const supabase = createClient()
    const { id } = await context.params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Fetch booking with relations
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, duration, price, category, image_url),
        staff:staff(id, name, specialization, avatar_url, bio),
        customer:profiles(id, full_name, phone, avatar_url)
      `)
      .eq('id', id)
      .eq('customer_id', user.id) // Only allow users to see their own bookings
      .single()
    
    if (error || !booking) {
      console.error('Booking fetch error:', error)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      booking
    })
    
  } catch (error) {
    console.error('GET booking by ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bookings/[id] - Update a booking
 * (For future use - admin updates or customer reschedule)
 */
export async function PATCH(request, context) {
  try {
    const supabase = createClient()
    const { id } = await context.params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get booking to verify ownership
    const { data: existingBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('customer_id, status')
      .eq('id', id)
      .single()
    
    if (fetchError || !existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Check ownership
    if (existingBooking.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own bookings' },
        { status: 403 }
      )
    }
    
    // Parse update data
    const body = await request.json()
    const allowedFields = ['notes', 'status'] // Only allow updating certain fields
    
    const updates = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    // Update booking
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        service:services(*),
        staff:staff(*),
        customer:profiles(*)
      `)
      .single()
    
    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    })
    
  } catch (error) {
    console.error('PATCH booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bookings/[id] - Delete a booking
 * (Admin only - customer should use cancel endpoint)
 */
export async function DELETE(request, context) {
  try {
    const supabase = createClient()
    const { id } = await context.params
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    // Delete booking
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete booking' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
    
  } catch (error) {
    console.error('DELETE booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}