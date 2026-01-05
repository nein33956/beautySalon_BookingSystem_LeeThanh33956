'use client'

import { useEffect } from 'react'

export default function BookingSuccess({ bookingData, currentService, onBackHome }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onBackHome()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onBackHome])

  return (
    <div className="success-page">
      <div className="success-icon">✅</div>
      
      <h2>Booking successfully!</h2>
      <p className="success-message">
        Thank you for scheduling an appointment. We will contact you at this number. <strong>{bookingData.phone}</strong> to confirm.
      </p>

      <div className="success-details">
        <div className="detail-row">
          <span>Service:</span>
          <strong>{currentService?.name}</strong>
        </div>
        <div className="detail-row">
          <span>Date:</span>
          <strong>{new Date(bookingData.date + 'T00:00:00').toLocaleDateString('vi-VN')}</strong>
        </div>
        <div className="detail-row">
          <span>Time:</span>
          <strong>{bookingData.time}</strong>
        </div>
        <div className="detail-row">
          <span>Total amount:</span>
          <strong className="price">{currentService?.price.toLocaleString('vi-VN')} VNĐ</strong>
        </div>
      </div>

      <p className="redirect-note">
        Automatically return to the home page after 5 seconds....
      </p>

      <button className="btn-primary" onClick={onBackHome}>
        Return to the homepage now
      </button>
    </div>
  )
}