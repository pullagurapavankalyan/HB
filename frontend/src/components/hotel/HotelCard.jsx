import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../store/slices/wishlistSlice';

const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const HotelCard = ({ hotel }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const items = useSelector((state) => state.wishlist.items) || [];

  const imageUrl = hotel.images?.[0]?._id
    ? `${BACKEND_HOST}/api/hotels/${hotel._id}/images/${hotel.images[0]._id}`
    : typeof hotel.images?.[0] === 'object'
      ? hotel.images[0]?.url?.startsWith('/')
        ? `${BACKEND_HOST}${hotel.images[0].url}`
        : hotel.images[0]?.url || 'https://via.placeholder.com/400x250?text=Hotel'
      : hotel.images?.[0] || 'https://via.placeholder.com/400x250?text=Hotel';

  const isWishlisted = items.some(item => item._id === hotel._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      dispatch(toggleWishlist({ hotelId: hotel._id, isAdded: isWishlisted }));
    } else {
      alert('Please login to add to wishlist');
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0 position-relative overflow-hidden" style={{ borderRadius: '12px' }}>
      {user?.role === 'User' && (
        <button 
          className="btn position-absolute top-0 end-0 m-2 p-1 bg-white rounded-circle shadow-sm"
          style={{ zIndex: 10, width: '35px', height: '35px' }}
          onClick={handleWishlistToggle}
        >
          <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'} fs-5`}></i>
        </button>
      )}

      <img 
        src={
          imageUrl
        } 
        className="card-img-top" 
        alt={hotel.hotelName} 
        style={{ height: '200px', objectFit: 'cover' }}
      />
      
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h5 className="card-title fw-bold mb-0 text-truncate" style={{ maxWidth: '80%' }}>
            {hotel.hotelName}
          </h5>
          <div className="badge bg-primary d-flex align-items-center">
            <i className="bi bi-star-fill me-1 small"></i>
            {hotel.rating?.toFixed(1) || 'New'}
          </div>
        </div>
        
        <p className="card-text text-muted small mb-3">
          <i className="bi bi-geo-alt-fill me-1"></i> {hotel.city}, {hotel.country}
        </p>
        
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <Link to={`/hotels/${hotel._id}`} className="btn btn-outline-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
