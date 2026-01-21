// app/api/bookings/route.js
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'



/**
 * GET /api/bookings - Get all bookings for current user
 */
export async function GET(request) {
  try {
    // const supabase = await getSupabaseServer()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          async get(name) {
            const cookieStore = await cookies()
            return cookieStore.get(name)?.value
          }
        }
      }
    )
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get('upcoming')
    
    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        service:services(id, name, duration, price, category),
        staff:staff(id, name, specialization, avatar_url)
      `)
      .eq('customer_id', user.id)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false })
    
    // Filter upcoming bookings
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('booking_date', today)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
    
    return NextResponse.json({ 
      success: true,
      bookings: data || [] 
    })
    
  } catch (error) {
    console.error('GET bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings: ' + error.message },
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
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          async get(name) {
            const cookieStore = await cookies()
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    
    
    // const supabase = getSupabaseServer()
    
    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json(
        { error: 'Authentication required. Please login first.' },
        { status: 401 }
      )
    }
    
    const userId = user.id
    console.log('👤 User ID:', userId)
    
    // 2. Parse request body
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
    
    console.log('📋 Booking data:', { 
      serviceId, 
      staffId, 
      date, 
      time, 
      customerName,
      customerPhone 
    })
    
    // 3. Validate required fields
    if (!serviceId || !date || !time || !customerName || !customerPhone) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          missing: {
            serviceId: !serviceId,
            date: !date,
            time: !time,
            customerName: !customerName,
            customerPhone: !customerPhone
          }
        },
        { status: 400 }
      )
    }
    
    // 4. Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('id', userId)
      .single()
    
    if (profileError || !profile) {
      console.error('❌ Profile not found:', profileError)
      return NextResponse.json(
        { error: 'Profile not found. Please complete your profile first.' },
        { status: 404 }
      )
    }
    
    // 5. Update profile with latest info (if changed)
    if (customerName !== profile.full_name || customerPhone !== profile.phone) {
      console.log('📝 Updating profile info...')
      await supabase
        .from('profiles')
        .update({
          full_name: customerName,
          phone: customerPhone
        })
        .eq('id', userId)
    }
    
    // 6. Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, name, duration, price, is_active')
      .eq('id', serviceId)
      .single()
    
    if (serviceError || !service) {
      console.error('❌ Service fetch error:', serviceError)
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }
    
    if (!service.is_active) {
      return NextResponse.json(
        { error: 'This service is not available' },
        { status: 400 }
      )
    }
    
    console.log('✅ Service:', service.name, service.duration, 'mins')
    
    // 7. Calculate end_time based on duration
    const [hours, minutes] = time.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + service.duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
    
    console.log('⏰ Time:', time, '->', endTime)
    
    // 8. Check staff availability (if staff selected)
    if (staffId) {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('id, name, is_available')
        .eq('id', staffId)
        .single()
      
      if (staffError || !staff) {
        console.error('❌ Staff not found:', staffError)
        return NextResponse.json(
          { error: 'Staff not found' },
          { status: 404 }
        )
      }
      
      if (!staff.is_available) {
        return NextResponse.json(
          { error: 'This staff member is not available' },
          { status: 400 }
        )
      }
      
      // 9. Check for time conflicts
      const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_time, end_time')
        .eq('staff_id', staffId)
        .eq('booking_date', date)
        .in('status', ['pending', 'confirmed'])
      
      if (conflictError) {
        console.error('Conflict check error:', conflictError)
      }
      
      if (conflicts && conflicts.length > 0) {
        const hasConflict = conflicts.some(booking => {
          const bookingStart = timeToMinutes(booking.start_time)
          const bookingEnd = timeToMinutes(booking.end_time)
          const newStart = startMinutes
          const newEnd = endMinutes
          
          return (newStart < bookingEnd && newEnd > bookingStart)
        })
        
        if (hasConflict) {
          console.log('❌ Time slot conflict detected')
          return NextResponse.json(
            { 
              error: 'Time slot is not available',
              details: 'This staff member already has a booking during this time.',
              conflicts: conflicts.map(c => ({
                start: c.start_time,
                end: c.end_time
              }))
            },
            { status: 409 }
          )
        }
      }
    }
    
    // 10. Create booking record
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
    
    console.log('💾 Saving booking to database...')
    
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingRecord)
      .select(`
        *,
        service:services(id, name, duration, price, category),
        staff:staff(id, name, specialization)
      `)
      .single()
    
    if (bookingError) {
      console.error('❌ Booking insert error:', bookingError)
      return NextResponse.json(
        { error: 'Failed to create booking: ' + bookingError.message },
        { status: 500 }
      )
    }
    
    console.log('✅ Booking created successfully:', booking.id)
    
    // 11. Return success response
    return NextResponse.json({
      success: true,
      message: 'Booking created successfully!',
      booking: {
        id: booking.id,
        service: booking.service,
        staff: booking.staff,
        customer: booking.customer,
        date: booking.booking_date,
        time: booking.start_time,
        endTime: booking.end_time,
        price: booking.total_price,
        status: booking.status,
        notes: booking.notes
      }
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