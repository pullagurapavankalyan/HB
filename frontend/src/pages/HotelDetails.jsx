import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotelDetails, clearHotelDetails } from '../store/slices/hotelSlice';
import RoomCard from '../components/room/RoomCard';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Extracting UI state variables cleanly from the Redux slice
  const { hotelDetails: hotel, detailsLoading: loading, error } = useSelector((state) => state.hotel);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelDetails(id));
    }
    // Cleanup function runs when the component unmounts
    return () => {
      dispatch(clearHotelDetails());
    };
  }, [dispatch, id]);

  const handleBookNow = (room) => {
    if (!hotel) return;
    // Pass structural data parameters securely down via react-router location state
    navigate(`/book/${hotel._id}/${room._id}`, { state: { room, hotel } });
  };

  // Safe wrapper fallback function processing multi-type array items from image endpoints
  const getImageUrl = (index) => {
    const fallbackPlaceholder = "https://via.placeholder.com/600x400?text=No+Image+Available";
    const imgItem = hotel?.images?.[index];
    if (!imgItem) return fallbackPlaceholder;
    
    // If image has MongoDB _id, use the API endpoint
    if (typeof imgItem === 'object' && imgItem._id) {
      return `${BACKEND_HOST}/api/hotels/${hotel._id}/images/${imgItem._id}`;
    }
    
    // Otherwise use the url field or fallback
    if (typeof imgItem === 'object') {
      if (imgItem.url?.startsWith('/')) {
        return `${BACKEND_HOST}${imgItem.url}`;
      }
      return imgItem.url || fallbackPlaceholder;
    }
    return imgItem;
  };

  // Handle Loading State
  if (loading) {
    return <Loader fullscreen />;
  }

  // Handle Error State
  if (error) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error} />
      </div>
    );
  }

  // Handle Empty/Missing Object Payload State
  if (!hotel) {
    return (
      <div className="container py-5 text-center">
        <p className="text-muted fs-5">No hotel data could be loaded.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header Info Section */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fw-bold display-5">{hotel.hotelName || 'Unnamed Hotel'}</h1>
          <p className="text-muted fs-5">
            <i className="bi bi-geo-alt-fill text-primary me-2"></i>
            {hotel.city || 'Unknown City'}, {hotel.country || 'Unknown Country'}
          </p>
        </div>
      </div>

      {/* Grid Image Gallery layout structural patterns */}
      <div className="row g-2 mb-5">
        <div className="col-md-8">
          <img 
            src={getImageUrl(0)} 
            alt={`${hotel.hotelName || 'Hotel'} main preview`} 
            className="img-fluid w-100 rounded shadow-sm" 
            style={{ height: '400px', objectFit: 'cover' }} 
          />
        </div>
        <div className="col-md-4 d-flex flex-column gap-2">
          <img 
            src={getImageUrl(1)} 
            alt={`${hotel.hotelName || 'Hotel'} view secondary`} 
            className="img-fluid w-100 rounded shadow-sm" 
            style={{ height: '196px', objectFit: 'cover' }} 
          />
          <img 
            src={getImageUrl(2)} 
            alt={`${hotel.hotelName || 'Hotel'} interior view`} 
            className="img-fluid w-100 rounded shadow-sm" 
            style={{ height: '196px', objectFit: 'cover' }} 
          />
        </div>
      </div>

      <div className="row">
        {/* Core Left Columns Content Details */}
        <div className="col-lg-8">
          
          {/* Description Block */}
          <h3 className="fw-bold mb-3">About this hotel</h3>
          <p className="text-muted mb-5" style={{ lineHeight: '1.8' }}>
            {hotel.description || 'No descriptive summary available for this property.'}
          </p>

          {/* Amenities Map Processing Block */}
          <h3 className="fw-bold mb-3">Popular Amenities</h3>
          <div className="d-flex flex-wrap gap-2 mb-5">
            {!hotel.amenities || hotel.amenities.length === 0 ? (
              <p className="text-muted fs-6">Contact the front desk for available amenity lists.</p>
            ) : (
              hotel.amenities.map((amenity, index) => (
                <span key={index} className="badge bg-light text-dark border p-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  {amenity}
                </span>
              ))
            )}
          </div>

          {/* Available Rooms Conditional Loop Handling */}
          <h3 className="fw-bold mb-3">Available Rooms</h3>
          {!hotel.rooms || hotel.rooms.length === 0 ? (
            <div className="alert alert-info border-0 shadow-sm p-4">
              <p className="text-muted mb-0 fw-semibold">No rooms currently available matching this timeline view.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3 mb-5">
              {hotel.rooms.map((room) => (
                <RoomCard
                  key={room._id}
                  room={room}
                  onBookNow={handleBookNow}
                  canBook={user?.role === 'User'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Layout Scoring Column */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 position-sticky" style={{ top: '100px', zIndex: 10 }}>
            <div className="card-body text-center p-4">
              <h2 className="display-4 fw-bold text-primary mb-0">
                {hotel.rating ? hotel.rating.toFixed(1) : 'N/A'}
              </h2>
              
              {/* Star Evaluation Vector Output Engine */}
              <div className="text-warning mb-2 fs-4">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`bi bi-star${i < Math.round(hotel.rating || 0) ? '-fill' : ''}`}
                  ></i>
                ))}
              </div>
              
              <p className="text-muted">{hotel.reviewsCount || 0} verified reviews</p>
              <hr />
              
              <div className="d-grid">
                <button 
                  className="btn btn-outline-primary btn-lg" 
                  onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                >
                  Read Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default HotelDetails;