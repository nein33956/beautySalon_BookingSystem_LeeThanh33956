import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/staff/available
 * Query params: 
 *   - date (YYYY-MM-DD)
 *   - time (HH:00)
 *   - serviceId (uuid) - optional, to filter by specialization
 * Returns: Array of available staff
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const serviceId = searchParams.get('serviceId')

    // Validation
    if (!date || !time) {
      return NextResponse.json(
        { error: 'Missing required parameters: date and time' },
        { status: 400 }
      )
    }

    // 1. Get service info (if provided, to filter by specialization)
    let serviceCategory = null
    if (serviceId) {
      const { data: service } = await supabase
        .from('services')
        .select('category')
        .eq('id', serviceId)
        .single()
      
      serviceCategory = service?.category
    }

    // 2. Get all active staff
    let staffQuery = supabase
      .from('staff')
      .select('*')
      .eq('is_available', true) // Only staff marked as available

    // Filter by specialization if service category provided
    if (serviceCategory) {
      // Assuming staff.specialization contains categories like "Hair Stylist", "Nail Artist"
      // You can adjust this logic based on your data model
      staffQuery = staffQuery.ilike('specialization', `%${serviceCategory}%`)
    }

    const { data: allStaff, error: staffError } = await staffQuery

    if (staffError) {
      console.error('Error fetching staff:', staffError)
      return NextResponse.json(
        { error: 'Failed to fetch staff' },
        { status: 500 }
      )
    }

    // 3. Get bookings for selected date/time to check conflicts
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
      console.error('Error fetching bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    // 4. Filter staff who are NOT busy at the requested time
    const availableStaff = allStaff.filter(staff => {
      // Check if this staff has any booking at the requested time
      const staffBookings = bookings?.filter(b => b.staff_id === staff.id) || []

      for (const booking of staffBookings) {
        const bookingStart = booking.start_time // "09:00"
        const bookingDuration = booking.service?.duration || 60
        const bookingEnd = addMinutes(bookingStart, bookingDuration) // "11:00"

        // Check if requested time conflicts with this booking
        if (isTimeInRange(time, bookingStart, bookingEnd)) {
          return false // Staff is busy
        }
      }

      return true // Staff is available
    })

    // 5. Return available staff with additional info
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
      availableStaff: staffWithInfo,
      totalStaff: allStaff.length,
      availableCount: staffWithInfo.length
    })

  } catch (error) {
    console.error('Available staff API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Add minutes to time string
 * @param {string} time - "HH:00"
 * @param {number} minutes - Minutes to add
 * @returns {string} - "HH:MM"
 */
function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60)
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

/**
 * Check if a time falls within a range
 * @param {string} checkTime - "10:00"
 * @param {string} startTime - "09:00"
 * @param {string} endTime - "11:00"
 * @returns {boolean}
 */
function isTimeInRange(checkTime, startTime, endTime) {
  const check = timeToMinutes(checkTime)
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  
  return check >= start && check < end
}

/**
 * Convert time string to minutes
 * @param {string} time - "10:30"
 * @returns {number} - 630
 */
function timeToMinutes(time) {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + (mins || 0)
}