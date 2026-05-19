import React from 'react';
import { Link, useParams } from 'react-router-dom';

const BookingSuccess = () => {
  const { bookingId } = useParams();

  return (
    <div className="container py-5 text-center">
      <div className="card border-0 shadow-sm p-5 max-w-md mx-auto" style={{ maxWidth: '600px', borderRadius: '15px' }}>
        <i className="bi bi-check-circle-fill text-success mb-3" style={{ fontSize: '4rem' }}></i>
        <h2 className="fw-bold mb-2">Booking Confirmed!</h2>
        <p className="text-muted fs-5 mb-4">Your payment was successful and your room is reserved.</p>
        
        <div className="bg-light p-3 rounded mb-4 text-start">
          <p className="mb-1 text-muted small">Booking Reference</p>
          <h5 className="fw-bold font-monospace">{bookingId}</h5>
        </div>
        
        <div className="d-flex justify-content-center gap-3">
          <Link to="/my-bookings" className="btn btn-primary px-4">View My Bookings</Link>
          <Link to="/" className="btn btn-outline-secondary px-4">Return Home</Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
