function BookingSummary({ bookingData, currentService, isConfirmation }) {
  // Format date (giống HTML version)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`booking-summary ${isConfirmation ? 'confirmation' : ''}`}>
      <h3>Scheduling information</h3>

      <div className="summary-section">
        <div className="summary-item">
          <span className="label">Customer:</span>
          <span className="value">{bookingData.name || '-'}</span>
        </div>

        <div className="summary-item">
          <span className="label">Phone:</span>
          <span className="value">{bookingData.phone || '-'}</span>
        </div>

        {bookingData.email && (
          <div className="summary-item">
            <span className="label">Email:</span>
            <span className="value">{bookingData.email}</span>
          </div>
        )}
      </div>

      <div className="summary-divider"></div>

      <div className="summary-section">
        <div className="summary-item">
          <span className="label">Service:</span>
          <span className="value highlight">{currentService?.name || '-'}</span>
        </div>

        <div className="summary-item">
          <span className="label">Duration:</span>
          <span className="value">{currentService?.duration || '-'} minutes</span>
        </div>

        <div className="summary-item">
          <span className="label">date:</span>
          <span className="value">{formatDate(bookingData.date)}</span>
        </div>

        <div className="summary-item">
          <span className="label">Time:</span>
          <span className="value">{bookingData.time || '-'}</span>
        </div>

        {bookingData.notes && (
          <div className="summary-item notes">
            <span className="label">Notes:</span>
            <span className="value">{bookingData.notes}</span>
          </div>
        )}
      </div>

      <div className="summary-divider"></div>

      <div className="summary-total">
        <span className="label">Total amount:</span>
        <span className="value">
          {currentService ? currentService.price.toLocaleString('vi-VN') : '0'} VND
        </span>
      </div>
    </div>
  );
}

export default BookingSummary;