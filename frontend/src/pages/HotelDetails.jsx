import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotelDetails, clearHotelDetails } from '../store/slices/hotelSlice';
import api from '../api/axios';
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

  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState('');

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
    const fallbackPlaceholder = "https://placeholder.co/600x400?text=No+Image+Available";
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

  const myReview = hotel.reviews?.find((review) => review.userId?._id === user?._id || review.userId === user?._id);
  const canReview = user?.role === 'User' && !myReview;

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess('');

    if (!reviewForm.comment.trim()) {
      setReviewError('Please add your review comment.');
      setReviewLoading(false);
      return;
    }
    if (Number(reviewForm.rating) < 1 || Number(reviewForm.rating) > 5) {
      setReviewError('Please select a rating between 1 and 5.');
      setReviewLoading(false);
      return;
    }

    try {
      await api.post('/reviews', {
        hotelId: id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim()
      });
      setReviewSuccess('Thank you for your review.');
      setReviewForm({ rating: 0, comment: '' });
      dispatch(fetchHotelDetails(id));
    } catch (err) {
      console.error('Review submission failed', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };
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

      {/* Grid Image Gallery layout - responsive for all screen sizes */}
      <div className="mb-5">
        {/* Main Image - Full width on all screens */}
        <div className="mb-3">
          <img 
            src={getImageUrl(0)} 
            alt={`${hotel.hotelName || 'Hotel'} main preview`} 
            className="img-fluid w-100 rounded shadow-sm" 
            style={{ height: '300px', objectFit: 'cover', maxHeight: '500px' }} 
          />
        </div>
        
        {/* Secondary Images - Row layout on all screens */}
        <div className="d-flex gap-2 overflow-x-auto">
          <img 
            src={getImageUrl(1)} 
            alt={`${hotel.hotelName || 'Hotel'} view secondary`} 
            className="img-fluid rounded shadow-sm flex-shrink-0" 
            style={{ height: '120px', minWidth: '120px', objectFit: 'cover' }} 
          />
          <img 
            src={getImageUrl(2)} 
            alt={`${hotel.hotelName || 'Hotel'} interior view`} 
            className="img-fluid rounded shadow-sm flex-shrink-0" 
            style={{ height: '120px', minWidth: '120px', objectFit: 'cover' }} 
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
      <div className="row mt-5">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <h3 className="fw-bold mb-3">Guest Reviews</h3>
              {hotel.reviews && hotel.reviews.length > 0 ? (
                <div className="list-group">
                  {hotel.reviews.map((review) => (
                    <div key={review._id} className="list-group-item list-group-item-action mb-3 rounded-3 shadow-sm">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="mb-1">{review.userId?.name || 'Guest'}</h5>
                          <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                        </div>
                        <span className="badge bg-warning text-dark">{review.rating} ★</span>
                      </div>
                      <p className="mt-3 mb-1">{review.comment}</p>
                      {review.reply?.message && (
                        <div className="border rounded-3 bg-light p-3 mt-3">
                          <strong className="d-block mb-1">Manager Reply</strong>
                          <p className="mb-1 small">{review.reply.message}</p>
                          <small className="text-muted">{review.reply.repliedAt ? new Date(review.reply.repliedAt).toLocaleDateString() : ''}</small>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No reviews yet for this hotel.</div>
              )}
            </div>
          </div>

          {user?.role === 'User' && (
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-body">
                <h3 className="fw-bold mb-3">Leave a Review</h3>
                {myReview ? (
                  <div className="alert alert-info">You have already submitted a review for this hotel.</div>
                ) : (
                  <form onSubmit={handleReviewSubmit}>
                    {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                    {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}
                    <div className="mb-3">
                      <label className="form-label">Rating</label>
                      <select name="rating" value={reviewForm.rating} onChange={handleReviewChange} className="form-select" required>
                        <option value={0}>Select rating</option>
                        <option value={1}>1 - Poor</option>
                        <option value={2}>2 - Fair</option>
                        <option value={3}>3 - Good</option>
                        <option value={4}>4 - Very good</option>
                        <option value={5}>5 - Excellent</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Comment</label>
                      <textarea
                        name="comment"
                        value={reviewForm.comment}
                        onChange={handleReviewChange}
                        className="form-control"
                        rows={4}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                      {reviewLoading ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;