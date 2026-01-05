function CustomerInfoForm({ bookingData, setBookingData, services, errors, onNext }) {
  const handleChange = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="form-step">
      <h2>📝 Customer information</h2>
      <p className="subtitle">Step 1/3: Fill in your information</p>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={bookingData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Jonh Doe"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone">
            Phone <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={bookingData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="0901234567"
            maxLength="10"
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email (optional)</label>
          <input
            type="email"
            id="email"
            value={bookingData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        {/* Service Selection */}
        <div className="form-group">
          <label htmlFor="service">
            Select service <span className="required">*</span>
          </label>
          <select
            id="service"
            value={bookingData.serviceId || ''}
            onChange={(e) => handleChange('serviceId', parseInt(e.target.value))}
            className={errors.serviceId ? 'error' : ''}
          >
            <option value="">-- Select service --</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.price.toLocaleString('vi-VN')} VND ({service.duration}p)
              </option>
            ))}
          </select>
          {errors.serviceId && <span className="error-message">{errors.serviceId}</span>}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Next →
          </button>
        </div>
      </form>
    </div>
  );
}

export default CustomerInfoForm;