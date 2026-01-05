'use client'

import { useState, useEffect } from 'react'
// import './DateTimeSelector.css';   

// ... rest giữ nguyên

// import './DateTimeSelector.css';   // ← Thêm dòng này
function DateTimeSelector({ bookingData, setBookingData, currentService, errors, onNext, onPrevious }) {
  const [timeSlots, setTimeSlots] = useState([]);

  // Booked slots (giống HTML - simulate)
  const bookedSlots = {
    '2024-12-13': ['09:00', '14:00', '18:00'],
    '2024-12-14': ['10:00', '15:00']
  };

  // Generate time slots (giống HTML logic)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Get today in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Check if slot is booked
  const isSlotBooked = (time) => {
    if (!bookingData.date) return false;
    const booked = bookedSlots[bookingData.date] || [];
    return booked.includes(time);
  };

  // Handle date change
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingData(prev => ({
      ...prev,
      date: selectedDate,
      time: '' // Reset time when date changes
    }));
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    if (isSlotBooked(time)) return; // Không cho chọn slot đã book

    setBookingData(prev => ({
      ...prev,
      time: time
    }));
  };

  // Generate slots when date is selected
  useEffect(() => {
    if (bookingData.date) {
      setTimeSlots(generateTimeSlots());
    } else {
      setTimeSlots([]);
    }
  }, [bookingData.date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="form-step">
      <h2>📅 Select date & time</h2>
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
                {currentService.price.toLocaleString('vi-VN')} VND
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
            <div className="time-slots-grid">
              {timeSlots.map(time => {
                const booked = isSlotBooked(time);
                const selected = bookingData.time === time;

                return (
                  <button
                    key={time}
                    type="button"
                    className={`time-slot ${selected ? 'selected' : ''} ${booked ? 'disabled' : ''}`}
                    onClick={() => handleTimeSelect(time)}
                    disabled={booked}
                    title={booked ? 'Already booked' : 'Click to select'}
                  >
                    {time}
                    {booked && <span className="booked-badge">✕</span>}
                  </button>
                );
              })}
            </div>
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
          >
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}

export default DateTimeSelector;