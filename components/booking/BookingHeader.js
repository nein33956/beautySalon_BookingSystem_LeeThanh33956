function BookingHeader({ step, onBack }) {
  const steps = [
    { number: 1, label: 'Information' },
    { number: 2, label: 'Date/Time' },
    { number: 3, label: 'Confirm' },
    { number: 4, label: 'Completed' }
  ];

  return (
    <div className="booking-header">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="progress-steps">
        {steps.map((s, index) => (
          <div key={s.number} className="step-wrapper">
            <div className={`step-item ${step >= s.number ? 'active' : ''} ${step > s.number ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > s.number ? '✓' : s.number}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${step > s.number ? 'completed' : ''}`}></div>
            )}
          </div> 
        ))}
      </div>
    </div>
  );
}

export default BookingHeader;