// import { NextResponse } from 'next/server'
// import { supabase } from '@/lib/supabase'

// /**
//  * GET /api/bookings/available-slots
//  * Query params: 
//  *   - date (YYYY-MM-DD)
//  *   - serviceId (uuid)
//  *   - staffId (uuid) - optional, to check specific staff availability
//  * Returns: { availableSlots: ['09:00', '10:00', ...] }
//  */
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const date = searchParams.get('date')
//     const serviceId = searchParams.get('serviceId')
//     const staffId = searchParams.get('staffId') // ✅ NEW: Optional staff filter

//     // Validation
//     if (!date || !serviceId) {
//       return NextResponse.json(
//         { error: 'Missing required parameters: date and serviceId' },
//         { status: 400 }
//       )
//     }

//     // 1. Get service details (to know duration)
//     const { data: service, error: serviceError } = await supabase
//       .from('services')
//       .select('duration')
//       .eq('id', serviceId)
//       .single()

//     if (serviceError || !service) {
//       return NextResponse.json(
//         { error: 'Service not found' },
//         { status: 404 }
//       )
//     }

//     const serviceDuration = service.duration // in minutes

//     // 2. Generate all possible time slots (9:00 - 21:00)
//     const allSlots = generateTimeSlots()

//     // 3. Get bookings for this date
//     let bookingsQuery = supabase
//       .from('bookings')
//       .select(`
//         id,
//         start_time,
//         end_time,
//         status,
//         staff_id,
//         service:services(duration)
//       `)
//       .eq('booking_date', date)
//       .in('status', ['pending', 'confirmed'])

//     // ✅ NEW: If specific staff selected, only check that staff's bookings
//     if (staffId) {
//       bookingsQuery = bookingsQuery.eq('staff_id', staffId)
//     }

//     const { data: bookings, error: bookingsError } = await bookingsQuery

//     if (bookingsError) {
//       console.error('Error fetching bookings:', bookingsError)
//       return NextResponse.json(
//         { error: 'Failed to fetch bookings' },
//         { status: 500 }
//       )
//     }

//     // 4. Calculate occupied slots
//     const occupiedSlots = new Set()

//     bookings?.forEach(booking => {
//       const startTime = booking.start_time
//       const bookingDuration = booking.service?.duration || 60

//       // ✅ Calculate slot occupation based on duration
//       const slotsNeeded = Math.ceil(bookingDuration / 60)

//       for (let i = 0; i < slotsNeeded; i++) {
//         const occupiedSlot = addHours(startTime, i)
//         occupiedSlots.add(occupiedSlot)
//       }
//     })

//     // ✅ NEW: If NO staff selected, check if ANY staff is available
//     if (!staffId) {
//       // Get all active staff
//       const { data: allStaff } = await supabase
//         .from('staff')
//         .select('id')
//         .eq('is_available', true)

//       const allStaffIds = allStaff?.map(s => s.id) || []

//       // For each time slot, check if at least 1 staff is available
//       const availableSlots = []

//       for (const slot of allSlots) {
//         const slotsNeeded = Math.ceil(serviceDuration / 60)
        
//         // Check if this slot + duration fits
//         let slotFits = true
//         for (let i = 0; i < slotsNeeded; i++) {
//           const checkSlot = addHours(slot, i)
//           if (!allSlots.includes(checkSlot)) {
//             slotFits = false
//             break
//           }
//         }

//         if (!slotFits) continue

//         // Check if ANY staff is available for this time
//         let anyStaffAvailable = false

//         for (const sid of allStaffIds) {
//           // Get this staff's bookings
//           const staffBookings = bookings?.filter(b => b.staff_id === sid) || []
          
//           // Check if this staff is free for required duration
//           let staffIsFree = true
//           for (let i = 0; i < slotsNeeded; i++) {
//             const checkSlot = addHours(slot, i)
            
//             // Check if any booking conflicts
//             for (const booking of staffBookings) {
//               const bookingStart = booking.start_time
//               const bookingDuration = booking.service?.duration || 60
//               const bookingSlotsNeeded = Math.ceil(bookingDuration / 60)
              
//               for (let j = 0; j < bookingSlotsNeeded; j++) {
//                 if (addHours(bookingStart, j) === checkSlot) {
//                   staffIsFree = false
//                   break
//                 }
//               }
//               if (!staffIsFree) break
//             }
//             if (!staffIsFree) break
//           }

//           if (staffIsFree) {
//             anyStaffAvailable = true
//             break
//           }
//         }

//         if (anyStaffAvailable) {
//           availableSlots.push(slot)
//         }
//       }

//       return NextResponse.json({
//         date,
//         serviceId,
//         serviceDuration,
//         staffId: 'any',
//         availableSlots,
//         totalBookings: bookings?.length || 0
//       })
//     }

//     // 5. Check if selected service fits in each slot (SPECIFIC STAFF case)
//     const availableSlots = allSlots.filter(slot => {
//       const slotsNeeded = Math.ceil(serviceDuration / 60)
      
//       for (let i = 0; i < slotsNeeded; i++) {
//         const checkSlot = addHours(slot, i)
        
//         if (occupiedSlots.has(checkSlot)) {
//           return false
//         }
        
//         if (!allSlots.includes(checkSlot)) {
//           return false
//         }
//       }
      
//       return true
//     })

//     return NextResponse.json({
//       date,
//       serviceId,
//       serviceDuration,
//       staffId: staffId || 'any',
//       availableSlots,
//       totalBookings: bookings?.length || 0
//     })

//   } catch (error) {
//     console.error('Available slots API error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }

// /**
//  * Generate time slots from 9:00 to 20:00 (salon closes at 21:00)
//  * Last booking start time is 20:00 for 60-min service
//  */
// function generateTimeSlots() {
//   const slots = []
//   for (let hour = 9; hour <= 20; hour++) {
//     slots.push(`${hour.toString().padStart(2, '0')}:00`)
//   }
//   return slots
// }

// /**
//  * Add hours to a time string
//  * @param {string} time - Time in "HH:00" format
//  * @param {number} hours - Hours to add
//  * @returns {string} New time in "HH:00" format
//  */
// function addHours(time, hours) {
//   const [hour] = time.split(':')
//   const newHour = parseInt(hour) + hours
//   return `${newHour.toString().padStart(2, '0')}:00`
// }

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')
    const staffId = searchParams.get('staffId')

    console.log('📍 Available slots request:', { date, serviceId, staffId })

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }
    if (!date || !serviceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: date and serviceId' },
        { status: 400 }
      )
    }

    // 1. Get service details
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single()

    if (serviceError || !service) {
      console.error('Service fetch error:', serviceError)
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const serviceDuration = service.duration
    console.log('✅ Service duration:', serviceDuration)

    // 2. Generate all possible time slots (9:00 - 20:00)
    const allSlots = []
    for (let hour = 9; hour <= 20; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    console.log('📊 All possible slots:', allSlots.length)

    // 3. Get bookings for this date
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        staff_id,
        service:services(duration)
      `)
      .eq('booking_date', date)
      .in('status', ['pending', 'confirmed'])

    // If specific staff selected, filter by that staff
    if (staffId && staffId !== 'any') {
      bookingsQuery = bookingsQuery.eq('staff_id', staffId)
      console.log('🎯 Filtering by staff:', staffId)
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery

    if (bookingsError) {
      console.error('Bookings fetch error:', bookingsError)
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }

    console.log('📅 Bookings found:', bookings?.length || 0)

    // 4. If no staff selected, we need to check if ANY staff is available
    if (!staffId || staffId === 'any') {
      // Get all active staff
      const { data: allStaff } = await supabase
        .from('staff')
        .select('id')
        .eq('is_available', true)

      const staffIds = allStaff?.map(s => s.id) || []
      console.log('👥 Total active staff:', staffIds.length)

      if (staffIds.length === 0) {
        console.log('⚠️ No staff available')
        return NextResponse.json({
          date,
          serviceId,
          serviceDuration,
          staffId: 'any',
          availableSlots: [],
          totalBookings: bookings?.length || 0,
          message: 'No staff available'
        })
      }

      // For each time slot, check if at least one staff member is free
      const availableSlots = []

      for (const slot of allSlots) {
        let anyStaffFree = false

        for (const sid of staffIds) {
          // Check if this staff has any booking that conflicts with this slot
          const staffBookings = bookings?.filter(b => b.staff_id === sid) || []
          
          let isFree = true
          for (const booking of staffBookings) {
            if (booking.start_time === slot) {
              isFree = false
              break
            }
          }

          if (isFree) {
            anyStaffFree = true
            break
          }
        }

        if (anyStaffFree) {
          availableSlots.push(slot)
        }
      }

      console.log('✅ Available slots (any staff):', availableSlots.length)

      return NextResponse.json({
        date,
        serviceId,
        serviceDuration,
        staffId: 'any',
        availableSlots,
        totalBookings: bookings?.length || 0,
        totalStaff: staffIds.length
      })
    }

    // 5. Specific staff selected - check only that staff's bookings
    const occupiedSlots = new Set()

    bookings?.forEach(booking => {
      const startTime = booking.start_time
      const bookingDuration = booking.service?.duration || 60
      const slotsNeeded = Math.ceil(bookingDuration / 60)

      for (let i = 0; i < slotsNeeded; i++) {
        const occupiedSlot = addHours(startTime, i)
        occupiedSlots.add(occupiedSlot)
      }
    })

    console.log('🚫 Occupied slots:', occupiedSlots.size)

    // Filter available slots
    const availableSlots = allSlots.filter(slot => {
      const slotsNeeded = Math.ceil(serviceDuration / 60)
      
      for (let i = 0; i < slotsNeeded; i++) {
        const checkSlot = addHours(slot, i)
        
        if (occupiedSlots.has(checkSlot)) {
          return false
        }
        
        if (!allSlots.includes(checkSlot)) {
          return false
        }
      }
      
      return true
    })

    console.log('✅ Available slots (specific staff):', availableSlots.length)

    return NextResponse.json({
      date,
      serviceId,
      serviceDuration,
      staffId: staffId || 'any',
      availableSlots,
      totalBookings: bookings?.length || 0
    })

  } catch (error) {
    console.error('❌ Available slots API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * @param {string} time - Time in "HH:MM" format
 * @param {number} hours - Number of hours to add
 * @returns {string} New time in "HH:MM" format
 */

function addHours(time, hours) {
  const [hour] = time.split(':')
  const newHour = parseInt(hour) + hours
  return `${newHour.toString().padStart(2, '0')}:00`
}