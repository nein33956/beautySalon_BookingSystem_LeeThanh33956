//components/booking/StaffSelector.js
'use client'

import { useState, useEffect } from 'react'

export default function StaffSelector({ 
  bookingData, 
  setBookingData, 
  currentService,
  selectedDate,
  selectedTime 
}) {
  const [availableStaff, setAvailableStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (selectedDate && selectedTime && currentService?.id) {
      fetchAvailableStaff()
    } else {
      setAvailableStaff([])
    }
  }, [selectedDate, selectedTime, currentService?.id])

  async function fetchAvailableStaff() {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/staff/available?date=${selectedDate}&time=${selectedTime}&serviceId=${currentService.id}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch available staff')
      }

      const data = await response.json()
      setAvailableStaff(data.availableStaff || [])

      if (data.availableStaff.length === 0) {
        setError('No staff available for this time. Please choose another time.')
      }
    } catch (err) {
      console.error('Error fetching staff:', err)
      setError('Failed to load available staff.')
      setAvailableStaff([])
    } finally {
      setLoading(false)
    }
  }

  const handleStaffSelect = (staffId) => {
    setBookingData(prev => ({
      ...prev,
      staffId: staffId
    }))
  }

  if (!selectedDate || !selectedTime) {
    return null
  }

  return (
    <div className="form-group">
      <label>
        Select Staff (Optional)
      </label>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
        Choose a specific staff member or let us assign one for you
      </p>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#8B5CF6' }}>
          <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
          <p>Loading available staff...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ 
          padding: '15px', 
          background: '#fed7d7', 
          color: '#c53030',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Option: Any Available Staff */}
          <div 
            className={`staff-option ${!bookingData.staffId ? 'selected' : ''}`}
            onClick={() => handleStaffSelect(null)}
            style={{
              padding: '15px',
              border: '2px solid',
              borderColor: !bookingData.staffId ? '#8B5CF6' : '#e2e8f0',
              borderRadius: '12px',
              marginBottom: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: !bookingData.staffId ? '#f0f4ff' : 'white'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                ✨
              </div>
              <div>
                <strong style={{ fontSize: '1.1rem', color: '#2d3748' }}>
                  Any Available Staff
                </strong>
                <p style={{ color: '#718096', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                  We'll assign the best available staff for you
                </p>
              </div>
            </div>
          </div>

          {/* Staff Grid */}
          {availableStaff.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px'
            }}>
              {availableStaff.map(staff => (
                <div
                  key={staff.id}
                  className={`staff-card ${bookingData.staffId === staff.id ? 'selected' : ''}`}
                  onClick={() => handleStaffSelect(staff.id)}
                  style={{
                    padding: '15px',
                    border: '2px solid',
                    borderColor: bookingData.staffId === staff.id ? '#8B5CF6' : '#e2e8f0',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: bookingData.staffId === staff.id ? '#f0f4ff' : 'white',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={staff.avatar_url || '/placeholder.jpg'}
                    alt={staff.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 10px',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder.jpg'
                    }}
                  />
                  <strong style={{ fontSize: '1rem', color: '#2d3748', display: 'block' }}>
                    {staff.name}
                  </strong>
                  <p style={{ 
                    color: '#8B5CF6', 
                    fontSize: '0.85rem', 
                    margin: '5px 0',
                    fontWeight: '600'
                  }}>
                    {staff.specialization}
                  </p>
                  {staff.years_of_experience && (
                    <p style={{ color: '#718096', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                      {staff.years_of_experience} years exp.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}