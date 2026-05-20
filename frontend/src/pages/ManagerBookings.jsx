import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { useSelector } from 'react-redux';
import api from '../api/axios';

const ManagerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/bookings/manager');
        setBookings(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      completed: 'info'
    };
    return statusMap[status] || 'secondary';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.bookingStatus === filter;
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-3">Bookings</h2>
        
        <div className="btn-group" role="group">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              className={`btn ${
                filter === status ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => setFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState 
          title="No Bookings" 
          message={`No ${filter === 'all' ? '' : filter} bookings at the moment.`}
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Booking ID</th>
                <th>Guest Name</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Room Type</th>
                <th>Total Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="text-monospace text-muted">{booking._id?.slice(-6)}</td>
                  <td className="fw-500">{booking.userId?.name || 'N/A'}</td>
                  <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                  <td>{booking.roomId?.roomType || 'N/A'}</td>
                  <td className="fw-bold">₹{booking.totalAmount}</td>
                  <td>
                    <span className={`badge bg-${getStatusBadge(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagerBookings;
