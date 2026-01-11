import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/**
 * GET /api/bookings - Get all bookings (for admin)
 */
export async function GET(request) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(id),
        service:services(name, duration, price),
        staff:staff(name, specialization)
      `)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })

    if (error) throw error

    return NextResponse.json({ bookings: data })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookings - Create new booking
 */
export async function POST(request) {
  try {
    console.log('📍 Creating new booking...')
    
    const body = await request.json()
    const { 
      serviceId, 
      staffId, 
      date, 
      time, 
      notes,
      customerName,
      customerPhone,
      customerEmail 
    } = body

    console.log('📋 Booking data:', { serviceId, staffId, date, time, customerName })

    // 1. Validate required fields
    if (!serviceId || !date || !time || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 2. Get authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    console.log('👤 User ID:', userId)

    // 3. Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('name, duration, price')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      console.error('Service fetch error:', serviceError)
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    console.log('✅ Service:', service.name, service.duration, 'mins')

    // 4. Calculate end_time based on duration
    const [hours, minutes] = time.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + service.duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`

    console.log('⏰ Time:', time, '->', endTime)

    // 5. Check for conflicts (same staff, overlapping time)
    if (staffId) {
      const { data: conflicts } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('staff_id', staffId)
        .eq('booking_date', date)
        .in('status', ['pending', 'confirmed'])

      if (conflicts && conflicts.length > 0) {
        // Check if any booking overlaps with our time slot
        const hasConflict = conflicts.some(booking => {
          const bookingStart = timeToMinutes(booking.start_time)
          const bookingEnd = timeToMinutes(booking.end_time)
          const newStart = startMinutes
          const newEnd = endMinutes

          // Check overlap: new booking starts before existing ends AND new ends after existing starts
          return (newStart < bookingEnd && newEnd > bookingStart)
        })

        if (hasConflict) {
          console.log('❌ Time slot conflict detected')
          return NextResponse.json(
            { error: 'This time slot is no longer available. Please select another time.' },
            { status: 409 }
          )
        }
      }
    }

    // 6. Create booking record
    const bookingRecord = {
      customer_id: userId,
      service_id: serviceId,
      staff_id: staffId || null,
      booking_date: date,
      start_time: time,
      end_time: endTime,
      total_price: service.price,
      status: 'pending',
      notes: notes || null,
      created_at: new Date().toISOString()
    }

    console.log('💾 Saving booking:', bookingRecord)

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingRecord)
      .select(`
        *,
        service:services(name, duration, price, category),
        staff:staff(name, specialization)
      `)
      .single()

    if (bookingError) {
      console.error('❌ Booking insert error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking: ' + bookingError.message },
        { status: 500 }
      )
    }

    console.log('✅ Booking created:', booking.id)

    // 7. Return success with booking details
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        service: booking.service,
        staff: booking.staff,
        date: booking.booking_date,
        time: booking.start_time,
        endTime: booking.end_time,
        price: booking.total_price,
        status: booking.status,
        notes: booking.notes
      },
      message: 'Booking created successfully!'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Booking API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

// Helper function
function timeToMinutes(time) {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + (mins || 0)
}