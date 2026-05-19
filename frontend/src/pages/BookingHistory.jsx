import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking } from '../store/slices/bookingSlice';
import BookingCard from '../components/booking/BookingCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const BookingHistory = () => {
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      dispatch(cancelBooking(bookingId));
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">My Bookings</h2>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : bookings.length === 0 ? (
        <EmptyState title="No Bookings Yet" message="You haven't booked any hotels yet. Start exploring!" actionLink="/hotels" actionText="Explore Hotels" />
      ) : (
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {bookings.map(booking => (
              <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
