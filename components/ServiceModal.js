import { useEffect } from 'react';

function ServiceModal({ service, onClose, onBook }) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (service) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [service, onClose]);

  if (!service) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {/* Modal Image */}
        <div className="modal-image">
          <img src={service.image} alt={service.name} />
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <span className="modal-category">{service.category}</span>
          <h2>{service.name}</h2>
          <p className="modal-description">{service.description}</p>

          {/* Details */}
          <div className="modal-details">
            <div className="detail-item">
              <span className="detail-label">💰 Price</span>
              <span className="detail-value price">
                {service.price.toLocaleString('vi-VN')} VND
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">⏱️ Times</span>
              <span className="detail-value">
                {service.duration} minutes
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">📋 Category</span>
              <span className="detail-value">
                {service.category}
              </span>
            </div>
          </div>

          {/* What's included */}
          <div className="modal-info">
            <h4>Include:</h4>
            <ul>
              <li>✓ Professional service</li>
              <li>✓ High-end products</li>
              <li>✓ Experienced staff</li>
              <li>✓ Comfortable space</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button 
              className="book-now-btn"
              onClick={() => onBook(service)}
            >
              Booking Now
            </button>
            <button 
              className="cancel-btn" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceModal;