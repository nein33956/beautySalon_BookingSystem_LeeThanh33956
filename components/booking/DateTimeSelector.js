'use client'

import { useState, useEffect } from 'react'
import StaffSelector from './StaffSelector'

function DateTimeSelector({ bookingData, setBookingData, currentService, errors, onNext, onPrevious }) {
  const [timeSlots, setTimeSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotsError, setSlotsError] = useState(null)

  // Get today in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  // ✅ Fetch available slots from API when date/staff changes
  useEffect(() => {
    if (bookingData.date && currentService?.id) {
      fetchAvailableSlots()
    } else {
      setTimeSlots([])
    }
  }, [bookingData.date, bookingData.staffId, currentService?.id]) // ✅ Added staffId dependency

  async function fetchAvailableSlots() {
    try {
      setLoadingSlots(true)
      setSlotsError(null)

      // ✅ Include staffId in API call if staff is selected
      let url = `/api/bookings/available-slots?date=${bookingData.date}&serviceId=${currentService.id}`
      if (bookingData.staffId) {
        url += `&staffId=${bookingData.staffId}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to fetch available slots')
      }

      const data = await response.json()
      setTimeSlots(data.availableSlots || [])

      // If no slots available
      if (data.availableSlots.length === 0) {
        setSlotsError('No available time slots for this date. Please choose another date.')
      }
    } catch (error) {
      console.error('Error fetching slots:', error)
      setSlotsError('Failed to load available time slots. Please try again.')
      setTimeSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Handle date change
  const handleDateChange = (e) => {
    const selectedDate = e.target.value
    setBookingData(prev => ({
      ...prev,
      date: selectedDate,
      time: '' // Reset time when date changes
    }))
  }

  // Handle time selection
  const handleTimeSelect = (time) => {
    setBookingData(prev => ({
      ...prev,
      time: time
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onNext()
  }

  return (
    <div className="form-step">
      <h2>Select date & time</h2>
      <p className="subtitle">Step 2/3: Choose a suitable time</p>

      <form onSubmit={handleSubmit}>
        {/* Service Info */}
        {currentService && (
          <div className="service-info-box">
            <h4>Selected service:</h4>
            <div className="service-info-content">
              <span className="service-name">{currentService.name}</span>
              <span className="service-duration">⏱️ {currentService.duration} minutes</span>
              <span className="service-price">
                {Number(currentService.price).toLocaleString('vi-VN')} VND
              </span>
            </div>
          </div>
        )}

        {/* Date Picker */}
        <div className="form-group">
          <label htmlFor="date">
            Select date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={bookingData.date}
            onChange={handleDateChange}
            min={today}
            className={errors.date ? 'error' : ''}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>

        {/* Time Slots */}
        {bookingData.date && (
          <div className="form-group">
            <label>
              Select time <span className="required">*</span>
            </label>

            {/* Loading State */}
            {loadingSlots && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8B5CF6' }}>
                <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                <p>Loading available time slots...</p>
              </div>
            )}

            {/* Error State */}
            {slotsError && !loadingSlots && (
              <div style={{ 
                padding: '15px', 
                background: '#fed7d7', 
                color: '#c53030',
                borderRadius: '8px',
                marginTop: '10px'
              }}>
                {slotsError}
              </div>
            )}

            {/* Time Slots Grid */}
            {!loadingSlots && !slotsError && timeSlots.length > 0 && (
              <div className="time-slots-grid">
                {timeSlots.map(time => {
                  const selected = bookingData.time === time

                  return (
                    <button
                      key={time}
                      type="button"
                      className={`time-slot ${selected ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(time)}
                      title="Click to select"
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            )}

            {errors.time && <span className="error-message">{errors.time}</span>}
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            value={bookingData.notes}
            onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Special requirements, allergies..."
            rows="3"
          />
        </div>

        {/* ✅ NEW: Staff Selector */}
        {bookingData.date && bookingData.time && (
          <StaffSelector
            bookingData={bookingData}
            setBookingData={setBookingData}
            currentService={currentService}
            selectedDate={bookingData.date}
            selectedTime={bookingData.time}
          />
        )}

        {/* Actions */}
        <div className="form-actions">
          <button 
            type="button"
            className="btn-secondary"
            onClick={onPrevious}
          >
            ← Back
          </button>

          <button 
            type="submit"
            className="btn-primary"
            disabled={loadingSlots}
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  )
}

export default DateTimeSelector