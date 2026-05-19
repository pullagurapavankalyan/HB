import React from 'react';

const RoomCard = ({ room, onBookNow, canBook = true }) => {
  
  // Safe helper to evaluate multi-type configurations for room imagery payloads
  const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');
  
  const getRoomImageUrl = () => {
    const fallbackPlaceholder = 'https://via.placeholder.com/300x200?text=Room';
    const imgItem = room?.images?.[0];
    if (!imgItem) return fallbackPlaceholder;
    return typeof imgItem === 'object' ? imgItem.url : imgItem;
  };

  return (
    <div className="card mb-3 shadow-sm border-0">
      <div className="row g-0">
        <div className="col-md-4">
          <img 
            src={
              room.images?.[0]?._id
                ? `${BACKEND_HOST}/api/hotels/${room.hotelId}/images/${room.images[0]._id}`
                : room.images?.[0]?.url?.startsWith('/')
                  ? `${BACKEND_HOST}${room.images[0].url}`
                  : room.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=Room'
            }
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
                ${room.price}
                <span className="text-muted small fw-normal"> / night</span>
              </h5>
            </div>
            
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
                Book This Room
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