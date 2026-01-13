'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import BookingHeader from '@/components/booking/BookingHeader'
import CustomerInfoForm from '@/components/booking/CustomerInfoForm'
import DateTimeSelector from '@/components/booking/DateTimeSelector'
import BookingSummary from '@/components/booking/BookingSummary'
import BookingSuccess from '@/components/booking/BookingSuccess'
import { getAllServices } from '@/lib/services'

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const preSelectedServiceId = searchParams.get('service')

  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceId: null,
    date: '',
    time: '',
    staffId: null,
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submissionError, setSubmissionError] = useState('')

  const [services, setServices] = useState([])
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    fetchServices()
    loadUserProfile()
  }, [])

  async function fetchServices() {
    const { data, error } = await getAllServices()
    if (!error && data) {
      setServices(data)
    }
  }

  async function loadUserProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUserProfile(profile)
        setBookingData(prev => ({
          ...prev,
          name: profile.full_name || '',
          phone: profile.phone || '',
          email: session.user.email || ''
        }))
      }
    }
  }

  const currentService = services.find(s => s.id === bookingData.serviceId)

  useEffect(() => {
    if (preSelectedServiceId) {
      setBookingData(prev => ({
        ...prev,
        serviceId: parseInt(preSelectedServiceId)
      }))
    }
  }, [preSelectedServiceId])

  const validateStep1 = () => {
    const newErrors = {}

    if (!bookingData.name || bookingData.name.trim().length < 2) {
      newErrors.name = 'Please enter your full name (at least 2 characters).'
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(bookingData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits.'
    }

    if (!bookingData.serviceId) {
      newErrors.serviceId = 'Please select a service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if (!bookingData.date) {
      newErrors.date = 'Please select a date'
    }

    if (!bookingData.time) {
      newErrors.time = 'Please select a time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1)
      setErrors({})
      setSubmissionError('')
    }
  }

 
  const handleConfirm = async () => {
    console.log('🚀 Submitting booking...')
    setLoading(true)
    setSubmissionError('')

    try {
      // ✅ DÙNG getUser() – KHÔNG DÙNG session
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
      throw new Error('Authentication required. Please login first.')
    }

      console.log('👤 User logged in:', user.id)
      // Call API to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          staffId: bookingData.staffId,
          date: bookingData.date,
          time: bookingData.time,
          notes: bookingData.notes,
          customerName: bookingData.name,
          customerPhone: bookingData.phone,
          customerEmail: bookingData.email
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking')
      }

      console.log('✅ Booking created:', result.booking)
      // Success
      setStep(4)

    } catch (error) {
      console.error('❌ Booking submission error:', error)
      setSubmissionError(
        error.message || 'Failed to create booking. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }


  const handleBackToHome = () => {
    router.push('/')
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <CustomerInfoForm
            bookingData={bookingData}
            setBookingData={setBookingData}
            services={services}
            errors={errors}
            onNext={handleNext}
          />
        )

      case 2:
        return (
          <DateTimeSelector
            bookingData={bookingData}
            setBookingData={setBookingData}
            currentService={currentService}
            errors={errors}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )

      case 3:
        return (
          <div className="confirmation-step">
            <h2>Confirm information</h2>
            <p className="subtitle">Please double check your booking information.</p>

            {submissionError && (
              <div style={{
                padding: '15px',
                background: '#fed7d7',
                color: '#c53030',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #fc8181'
              }}>
                <strong>⚠️ Error:</strong> {submissionError}
              </div>
            )}

            <BookingSummary
              bookingData={bookingData}
              currentService={currentService}
              isConfirmation={true}
            />

            <div className="form-actions">
              <button 
                type="button"
                className="btn-secondary"
                onClick={handlePrevious}
                disabled={loading}
              >
                ← Back
              </button>

              <button 
                type="button"
                className="btn-primary"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    Creating... <span className="spinner-small"></span>
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <BookingSuccess
            bookingData={bookingData}
            currentService={currentService}
            onBackHome={handleBackToHome}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="booking-page">
      <BookingHeader
        step={step}
        onBack={step === 1 ? handleBackToHome : handlePrevious}
      />

      <div className="booking-container">
        <div className="booking-content">
          {renderStep()}
        </div>

        {step < 4 && step !== 3 && (
          <div className="booking-sidebar">
            <BookingSummary
              bookingData={bookingData}
              currentService={currentService}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  )
}