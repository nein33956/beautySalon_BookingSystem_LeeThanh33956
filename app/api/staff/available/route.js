// app/api/staff/available/route.js

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'


export async function GET(request) {
  try {
    const cookieStore = await cookies() // 👈 BẮT BUỘC await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const serviceId = searchParams.get('serviceId')

    console.log('📍 Staff availability request:', { date, time, serviceId })

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Missing required parameters: date and time' },
        { status: 400 }
      )
    }

    // 1. Get service category if serviceId provided
    let serviceCategory = null
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select('category, name')
        .eq('id', serviceId)
        .single()
      
      serviceCategory = service?.category
      console.log('📋 Service category:', serviceCategory, '- Service:', service?.name)
    }

    // 2. Get all active staff
    let staffQuery = supabase
      .from('staff')
      .select('*')
      .eq('is_available', true)

    // ✅ IMPROVED: Better category matching
    if (serviceCategory) {
      // Map service categories to staff specializations
      const categoryMap = {
        'Hair': ['Hair Stylist', 'Hair', 'Stylist'],
        'Nails': ['Nail Artist', 'Nail', 'Manicure', 'Pedicure'],
        'Spa': ['Spa Specialist', 'Massage Therapist', 'Spa', 'Massage'],
        'Makeup': ['Makeup Artist', 'Makeup']
      }

      const searchTerms = categoryMap[serviceCategory] || [serviceCategory]
      console.log('🔍 Searching for specializations containing:', searchTerms)

      // Build OR query for multiple specialization matches
      const orConditions = searchTerms
        .map(term => `specialization.ilike.%${term}%`)
        .join(',')

      staffQuery = staffQuery.or(orConditions)
    }

    const { data: allStaff, error: staffError } = await staffQuery

    if (staffError) {
      console.error('Staff fetch error:', staffError)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    console.log('👥 Total staff found:', allStaff?.length || 0)
    if (allStaff && allStaff.length > 0) {
      console.log('Staff specializations:', allStaff.map(s => ({ name: s.name, spec: s.specialization })))
    }

    // 3. Get bookings for selected date/time
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        staff_id,
        start_time,
        service:services(duration)
      `)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    console.log('📅 Bookings found:', bookings?.length || 0)

    // 4. Filter staff who are NOT busy at the requested time
    const availableStaff = allStaff?.filter(staff => {
      const staffBookings = bookings?.filter(b => b.staff_id === staff.id) || []

      for (const booking of staffBookings) {
        const bookingStart = booking.start_time
        const bookingDuration = booking.service?.duration || 60
        const bookingEnd = addMinutes(bookingStart, bookingDuration)

        // Check if requested time conflicts
        if (isTimeInRange(time, bookingStart, bookingEnd)) {
          console.log(`❌ ${staff.name} is busy at ${time} (booked ${bookingStart}-${bookingEnd})`)
          return false
        }
      }

      return true
    }) || []

    console.log('✅ Available staff:', availableStaff.length)

    // 5. Format response
    const staffWithInfo = availableStaff.map(staff => ({
      id: staff.id,
      name: staff.name,
      specialization: staff.specialization,
      avatar_url: staff.avatar_url,
      bio: staff.bio,
      years_of_experience: staff.years_of_experience
    }))

    return NextResponse.json({
      date,
      time,
      serviceCategory,
      availableStaff: staffWithInfo,
      totalStaff: allStaff?.length || 0,
      availableCount: staffWithInfo.length
    })

  } catch (error) {
    console.error('Available staff API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

function isTimeInRange(checkTime, startTime, endTime) {
  const check = timeToMinutes(checkTime)
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  
  return check >= start && check < end
}

function timeToMinutes(time) {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + (mins || 0)
}