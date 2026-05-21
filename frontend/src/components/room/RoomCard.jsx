import React from 'react';

const RoomCard = ({ room, hotelId, onBookNow, canBook = true }) => {
  
  // Safe helper to evaluate multi-type configurations for room imagery payloads
  const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  const fallbackPlaceholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
      <rect width="300" height="200" fill="#f1f3f5" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#adb5bd" font-family="Arial, sans-serif" font-size="18">No Image Available</text>
    </svg>
  `);

  const getRoomImageUrl = () => {
    const imgItem = room?.images?.[0];
    if (!imgItem) return fallbackPlaceholder;
    if (typeof imgItem === 'object') {
      if (imgItem._id) {
        return `${BACKEND_HOST}/api/hotels/${hotelId || room.hotelId}/images/${imgItem._id}`;
      }
      if (imgItem.url) {
        return imgItem.url.startsWith('/') ? `${BACKEND_HOST}${imgItem.url}` : imgItem.url;
      }
      return fallbackPlaceholder;
    }
    if (typeof imgItem === 'string' && imgItem.startsWith('/')) {
      return `${BACKEND_HOST}${imgItem}`;
    }
    return imgItem || fallbackPlaceholder;
  };

  return (
    <div className="card mb-3 shadow-sm border-0">
      <div className="row g-0">
        <div className="col-md-4">
          <img 
            src={getRoomImageUrl()}
            className="img-fluid rounded-start h-100" 
            alt={room.roomType || "Hotel Room"} 
            style={{ objectFit: 'cover', minHeight: '100%' }}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body d-flex flex-column h-100">
            <div className="d-flex justify-content-between">
              <h5 className="card-title fw-bold text-primary">{room.roomType || 'Standard Room'}</h5>
              <h5 className="fw-bold text-success">
                ₹{room.price}
                <span className="text-muted small fw-normal"> / night</span>
              </h5>
            </div>
            <p className="text-muted small mb-2">Available units: {room.quantity || 1}</p>
            
            {/* Structural Changes here to safely break open the capacity parameters */}
            <div className="mb-3 mt-2 d-flex flex-wrap gap-2">
              <span className="badge bg-light text-dark border">
                <i className="bi bi-people me-1"></i> 
                Max: {room.capacity?.adults || 0} Adults, {room.capacity?.children || 0} Kids
              </span>
              {room.size && (
                <span className="badge bg-light text-dark border">
                  <i className="bi bi-rulers me-1"></i> {room.size} sqft
                </span>
              )}
            </div>
            
            <p className="card-text text-muted small flex-grow-1">
              {room.description || 'No descriptive structural layout summaries supplied for this unit style.'}
            </p>
            
            {/* Filtered Map block looping for amenities tags */}
            <div className="mt-auto d-flex flex-wrap gap-2 mb-3">
              {room.amenities?.slice(0, 4).map((amenity, idx) => (
                <span key={idx} className="badge bg-secondary opacity-75">{amenity}</span>
              ))}
              {room.amenities?.length > 4 && (
                <span className="badge bg-secondary opacity-75">+{room.amenities.length - 4} more</span>
              )}
            </div>

            {canBook ? (
              <button className="btn btn-primary w-100 fw-bold" onClick={() => onBookNow(room)}>
                Book
              </button>
            ) : (
              <button className="btn btn-secondary w-100 fw-bold" disabled>
                Booking unavailable for managers
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;