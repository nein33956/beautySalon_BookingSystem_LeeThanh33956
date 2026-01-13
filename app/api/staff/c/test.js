
import supabase from 'supabase-js'
// Import Supabase client (nếu chưa có)
const { createClient } = supabase

// Tạo Supabase client
const supabaseTest = createClient(
  'https://qjlbdtynosxqobtkufue.supabase.co',  // ← Thay bằng NEXT_PUBLIC_SUPABASE_URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbGJkdHlub3N4cW9idGt1ZnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NjcsImV4cCI6MjA4MzIwOTc2N30.CBptu3lkXON4cDkmlnj2dkZhuztvPoYYI8kaQZllfMM'       // ← Thay bằng NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// TEST FUNCTION
async function testBooking() {
  console.log('🧪 Starting booking test...\n')
  
  // 1. Check session
  const { data: { session }, error: sessionError } = await supabaseTest.auth.getSession()
  
  if (sessionError || !session) {
    console.error('❌ Session Error:', sessionError || 'No session found')
    console.log('👉 Please login first!')
    return
  }
  
  console.log('✅ Session found')
  console.log('👤 User ID:', session.user.id)
  console.log('📧 Email:', session.user.email)
  console.log('')
  
  // 2. Check profile
  const { data: profile, error: profileError } = await supabaseTest
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()
  
  if (profileError) {
    console.error('❌ Profile Error:', profileError)
    return
  }
  
  console.log('✅ Profile found:', profile.full_name)
  console.log('📱 Phone:', profile.phone)
  console.log('')
  
  // 3. Check if service exists
  const { data: services, error: servicesError } = await supabaseTest
    .from('services')
    .select('id, name, duration, price')
    .limit(1)
  
  if (servicesError || !services || services.length === 0) {
    console.error('❌ No services found!')
    console.log('👉 Please create a service first')
    return
  }
  
  const testService = services[0]
  console.log('✅ Service found:', testService.name)
  console.log('⏱️ Duration:', testService.duration, 'mins')
  console.log('💰 Price:', testService.price.toLocaleString('vi-VN'), '₫')
  console.log('')
  
  // 4. Test insert booking
  console.log('💾 Attempting to insert booking...')
  
  const testBooking = {
    customer_id: session.user.id,
    service_id: testService.id,
    staff_id: null,
    booking_date: '2026-01-20',
    start_time: '14:00',
    end_time: '15:00',
    total_price: testService.price,
    status: 'pending',
    notes: 'Test booking from console'
  }
  
  console.log('📦 Booking data:', testBooking)
  console.log('')
  
  const { data: booking, error: bookingError } = await supabaseTest
    .from('bookings')
    .insert(testBooking)
    .select()
    .single()
  
  if (bookingError) {
    console.error('❌ BOOKING ERROR:', bookingError)
    console.log('🔍 Error code:', bookingError.code)
    console.log('🔍 Error message:', bookingError.message)
    console.log('')
    
    // Diagnose common errors
    if (bookingError.code === '42501') {
      console.log('🚨 RLS POLICY VIOLATION!')
      console.log('👉 The policy "Customers can create bookings" might have wrong condition')
      console.log('👉 Check: WITH CHECK (customer_id = auth.uid())')
    } else if (bookingError.code === '23503') {
      console.log('🚨 FOREIGN KEY VIOLATION!')
      console.log('👉 service_id or staff_id does not exist')
    }
    
    return
  }
  
  console.log('✅✅✅ BOOKING CREATED SUCCESSFULLY! ✅✅✅')
  console.log('🎉 Booking ID:', booking.id)
  console.log('📅 Date:', booking.booking_date)
  console.log('⏰ Time:', booking.start_time, '-', booking.end_time)
  console.log('💵 Price:', booking.total_price.toLocaleString('vi-VN'), '₫')
  console.log('')
  console.log('🎯 Now check Supabase Table Editor → bookings table!')
}

// Run test
testBooking()