function ServiceCard({ service, isSelected, onClick, onViewDetails, onBookClick }) {
  return (
    <div 
      className={`service-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(service)}
    >
      {/* Service Image */}
      <div className="service-image">
        <img src={service.image} alt={service.name} />
        <span className="category-badge">{service.category}</span>
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="selected-indicator">
            <span>✓ Selected</span>
          </div>
        )}
      </div>

      {/* Service Content */}
      <div className="service-card-content">
        <h3>{service.name}</h3>
        <p className="description">{service.description}</p>

        {/* Price & Duration */}
        <div className="service-info">
          <span className="price">
            {service.price.toLocaleString('vi-VN')} VND
          </span>
          <span className="duration">
            ⏱️ {service.duration} minutes
          </span>
        </div>

        {/* Action buttons */}
        <div className="card-actions">
          <button 
            className="view-details-btn"
            onClick={(e) => {
              e.stopPropagation(); // Không trigger card onClick
              onViewDetails(service);
            }}
          >
            Detail
          </button>
          
          <button 
            className="book-btn"
            onClick={(e) => {
              e.stopPropagation();
              onBookClick(service);
            }}
          >
            BOOKING
          </button>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;