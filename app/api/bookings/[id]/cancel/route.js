// app/api/bookings/[id]/cancel/route.js
import { createClient } from '@supabase/supabase-js'
// import { createClient } from '@/lib/supabase-browser';
import { NextResponse } from 'next/server';

/**
 * PATCH /api/bookings/[id]/cancel
 * Cancel a booking (customer can cancel if > 2 hours before booking time)
 */
export async function PATCH(request, { params }) {
  try {

    const supabase = createClient();
    
    const { id } = params;
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Get booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*, customer:profiles(id)')
      .eq('id', id)
      .single();
    
    if (fetchError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    

    if (booking.customer_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      );
    }
    
    // 4. Check if booking is already cancelled or completed
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }
    
    if (booking.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed bookings' },
        { status: 400 }
      );
    }
    
    // 5. Check 2-hour rule
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);
    
    if (hoursUntilBooking <= 2) {
      return NextResponse.json(
        { 
          error: 'Không thể hủy lịch trước ít hơn 2 giờ. Vui lòng liên hệ salon để được hỗ trợ.',
          hoursRemaining: hoursUntilBooking.toFixed(1)
        },
        { status: 400 }
      );
    }
    
    // 6. Get cancel reason from request body
    const body = await request.json();
    const cancel_reason = body.cancel_reason || 'Khách hàng hủy';
    
    // 7. Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason
      })
      .eq('id', id)
      .select(`
        *,
        service:services(id, name, price, duration),
        staff:staff(id, name),
        customer:profiles(id, full_name, phone)
      `)
      .single();
    
    if (updateError) {
      console.error('Update booking error:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }
    
    // 8. Success response
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}