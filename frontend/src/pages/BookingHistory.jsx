import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBookings, cancelBooking } from '../store/slices/bookingSlice';
import BookingCard from '../components/booking/BookingCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const BookingHistory = () => {
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const dispatch = useDispatch();
  const { bookings, loading, error } = useSelector((state) => state.booking);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return;

    setSuccessMessage('');
    setCancelError('');
    setCancellingId(bookingId);
    const resultAction = await dispatch(cancelBooking(bookingId));
    setCancellingId(null);
    if (cancelBooking.fulfilled.match(resultAction)) {
      setSuccessMessage('Booking cancelled successfully.');
      dispatch(fetchMyBookings());
    }
    if (cancelBooking.rejected.match(resultAction)) {
      setCancelError(resultAction.payload || resultAction.error?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Bookings History</h2>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <>
          {successMessage && <div className="alert alert-success">{successMessage}</div>}
          {cancelError && <ErrorMessage message={cancelError} />}
          {bookings.length === 0 ? (
            <EmptyState title="No Bookings Yet" message="You haven't booked any hotels yet. Start exploring!" actionLink="/hotels" actionText="Explore Hotels" />
          ) : (
            <div className="row">
              <div className="col-lg-8 mx-auto">
                {bookings.map(booking => (
                  <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} isCancelling={cancellingId === booking._id} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookingHistory;
