import React from 'react';
import { Link } from 'react-router-dom';

const BookingCard = ({ booking, onCancel, isCancelling }) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      confirmed: 'bg-success',
      cancelled: 'bg-danger',
      completed: 'bg-info text-dark'
    };
    return <span className={`badge ${badges[status] || 'bg-secondary'}`}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="card shadow-sm border-0 mb-4 rounded-3">
      <div className="card-header bg-white border-bottom-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
        <h6 className="text-muted mb-0">Booking ID: {booking._id}</h6>
        {getStatusBadge(booking.bookingStatus)}
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-8">
            <h4 className="fw-bold text-primary">{booking.hotelId?.hotelName}</h4>
            <p className="text-muted mb-2"><i className="bi bi-geo-alt me-2"></i>{booking.hotelId?.city}</p>
            {booking.hotelId?.locationLink && (
              <p className="mb-2">
                <a href={booking.hotelId.locationLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  <i className="bi bi-box-arrow-up-right me-1"></i>View location
                </a>
              </p>
            )}
            {booking.hotelId?.managerId?.name && (
              <p className="mb-0 text-muted small">
                Managed by {booking.hotelId.managerId.name}
                {booking.hotelId.managerId.email ? ` • ${booking.hotelId.managerId.email}` : ''}
              </p>
            )}
            <hr className="my-2" />
            <div className="row mt-3">
              <div className="col-sm-6">
                <p className="mb-1 text-muted small">Check-in</p>
                <p className="fw-semibold">{new Date(booking.checkInDate).toLocaleDateString()}</p>
              </div>
              <div className="col-sm-6">
                <p className="mb-1 text-muted small">Check-out</p>
                <p className="fw-semibold">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="mb-0">
              <i className="bi bi-people me-2 text-muted"></i>
              {booking.guests?.adults || 0} Adults
              {booking.guests?.children > 0 && `, ${booking.guests.children} ${booking.guests.children === 1 ? 'Child' : 'Children'}`}
            </p>
          </div>
          <div className="col-md-4 d-flex flex-column justify-content-center align-items-end border-start mt-3 mt-md-0">
            <p className="text-muted mb-1">Total Amount</p>
            <h2 className="fw-bold text-success">₹{booking.totalAmount}</h2>
            <p className="small text-muted mb-3">Payment: <span className="fw-semibold">{booking.paymentStatus.toUpperCase()}</span></p>
            
            {booking.bookingStatus === 'pending' && booking.paymentStatus === 'pending' && (
              <Link to={`/payment/${booking._id}`} className="btn btn-primary w-100 mb-2">Pay Now</Link>
            )}
            
            {(booking.bookingStatus === 'pending' || booking.bookingStatus === 'confirmed') && (
              <button
                className="btn btn-outline-danger w-100"
                onClick={() => onCancel(booking._id)}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
