'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BookingHeader from '@/components/booking/BookingHeader'
import CustomerInfoForm from '@/components/booking/CustomerInfoForm'
import DateTimeSelector from '@/components/booking/DateTimeSelector'
import BookingSummary from '@/components/booking/BookingSummary'
import BookingSuccess from '@/components/booking/BookingSuccess'

function BookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preSelectedServiceId = searchParams.get('service')

  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceId: null,
    date: '',
    time: '',
    notes: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const services = [
    { id: 1, name: 'Haircut', price: 200000, duration: 70 },
    { id: 2, name: 'Hair Coloring', price: 500000, duration: 120 },
    { id: 3, name: 'Hair Styling', price: 180000, duration: 75 },
    { id: 4, name: 'Nail Art', price: 400000, duration: 100 },
    { id: 5, name: 'Manicure & Pedicure', price: 300000, duration: 1200 },
    { id: 6, name: 'Massage', price: 800000, duration: 1200 }
  ]

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

    if(!bookingData.name || bookingData.name.trim().length < 2){
      newErrors.name = 'Please enter your first and last name (at least 2 characters).'
    }

    const phoneRegex = /^[0-9]{10}$/
    if(!phoneRegex.test(bookingData.phone)){
      newErrors.phone = 'The phone number must have 10 digits.'
    }

    if(!bookingData.serviceId){
      newErrors.serviceId = 'Please select a service'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}

    if(!bookingData.date){
      newErrors.date = 'Please select date'
    }

    if(!bookingData.time){
      newErrors.time = 'Please select time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if(step === 1 && validateStep1()){
      setStep(2)
    }else if (step === 2 && validateStep2()){
      setStep(3)
    }
  }

  const handlePrevious = () => {
    if(step > 1){
      setStep(step - 1)
      setErrors({})
    }
  }

  const handleConfirm = () => {
    setLoading(true)

    setTimeout(() => {
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
      const newBooking = {
        ...bookingData,
        service: currentService,
        timestamp: new Date().toISOString()
      }
      bookings.push(newBooking)
      localStorage.setItem('bookings', JSON.stringify(bookings))

      setLoading(false)
      setStep(4)
    }, 2000)
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

            <BookingSummary
              bookingData={bookingData}
              setBookingData={setBookingData}
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
                    Loading... <span className="spinner-small"></span>
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
              setBookingData={setBookingData}
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