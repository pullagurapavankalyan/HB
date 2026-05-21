import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking, resetBookingState } from '../store/slices/bookingSlice';
import BookingForm from '../components/booking/BookingForm';
import ErrorMessage from '../components/ErrorMessage';

const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const BookingPage = () => {
  const { hotelId, roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { room, hotel } = location.state || {};
  const { loading, error, success, currentBooking } = useSelector(state => state.booking);

  useEffect(() => {
    if (success && currentBooking) {
      dispatch(resetBookingState());
      navigate(`/payment/${currentBooking._id}`);
    }
  }, [success, currentBooking, navigate, dispatch]);

  if (!room || !hotel) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-muted">Invalid booking session. Please select a room again.</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/hotels')}>
          Return to Hotels
        </button>
      </div>
    );
  }

  // Safe helper to extract room imagery url safely
  const getRoomImageUrl = () => {
    const fallbackPlaceholder = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
        <rect width="400" height="200" fill="#f1f3f5" />
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#adb5bd" font-family="Arial, sans-serif" font-size="18">No Image Available</text>
      </svg>
    `);
    const imgItem = room?.images?.[0];
    if (!imgItem) return fallbackPlaceholder;
    if (typeof imgItem === 'object') {
      if (imgItem.url?.startsWith('/')) {
        return `${BACKEND_HOST}${imgItem.url}`;
      }
      return imgItem.url || fallbackPlaceholder;
    }
    if (typeof imgItem === 'string' && imgItem.startsWith('/')) {
      return `${BACKEND_HOST}${imgItem}`;
    }
    return imgItem || fallbackPlaceholder;
  };

  const handleBookingSubmit = (bookingData) => {
    dispatch(createBooking({
      hotelId,
      roomId,
      ...bookingData
    }));
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold">Complete your booking</h2>
          <p className="text-muted">
            {hotel.hotelName || 'Selected Hotel'} — {room.roomType || 'Standard Unit'}
          </p>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8 mb-4">
          {error && <ErrorMessage message={error} />}
          <BookingForm room={room} onSubmit={handleBookingSubmit} loading={loading} />
        </div>
        
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 position-sticky" style={{ top: '100px' }}>
            <img 
              src={getRoomImageUrl()} 
              className="card-img-top" 
              alt={room.roomType || "Room View"} 
              style={{ height: '200px', objectFit: 'cover' }} 
            />
            <div className="card-body">
              <h5 className="fw-bold">{room.roomType || 'Room Specifications'}</h5>
              
              {/* FIXED STRUCTURAL CAPACITIES PARSING NODE */}
              <p className="text-muted small mb-3">
                <i className="bi bi-people me-1"></i> Max Capacity:{' '}
                {room.capacity?.adults || 0} Adults, {room.capacity?.children || 0} Kids
              </p>
              
              <h4 className="text-success fw-bold">
                ₹{room.price || 0} <span className="text-muted fs-6 fw-normal">/ night</span>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;