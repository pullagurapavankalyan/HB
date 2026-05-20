import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MyBookings = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/mybookings');
        setBookings(res.data.data || res.data);
      } catch (error) {
        console.error('Failed to load bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [isAuthenticated, navigate]);

  return (
    <Container className="py-5" style={{ color: 'var(--text-color)' }}>
      <h2 className="mb-4">My Bookings</h2>
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {message.text}
        </div>
      )}
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : bookings.length === 0 ? (
        <Card style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
          <Card.Body>You have no bookings yet.</Card.Body>
        </Card>
      ) : (
        <Table responsive hover variant={document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'} style={{ backgroundColor: 'var(--card-bg)' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Hotel</th>
              <th>Room Type</th>
              <th>Dates</th>
              <th>Total Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th />
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td>{String(b._id).substring(0, 8)}</td>
                <td>{b.hotelId?.hotelName || b.hotel?.name || 'Unknown Hotel'}</td>
                <td>{b.roomId?.roomType || b.roomType}</td>
                <td>{new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</td>
                <td>₹{b.totalAmount || b.totalPrice || 0}</td>
                <td>
                  {b.paymentStatus === 'paid' || b.isPaid ? (
                    <Badge bg="success">Paid</Badge>
                  ) : (
                    <Badge bg="danger">Pending</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={b.bookingStatus === 'cancelled' ? 'secondary' : 'info'}>{b.bookingStatus || b.status || 'Confirmed'}</Badge>
                </td>
                <td>
                  {(!b.bookingStatus || (b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed')) && (
                    <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                      if (cancelingId === b._id) return;
                      setMessage({ type: '', text: '' });
                      setCancelingId(b._id);
                      try {
                        await api.put(`/bookings/${b._id}/cancel`, {});
                        setMessage({ type: 'success', text: 'Booking cancelled successfully.' });
                        const res = await api.get('/bookings/mybookings');
                        setBookings(res.data.data || res.data);
                      } catch (err) {
                        console.error('Cancel failed', err);
                        setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel booking' });
                      } finally {
                        setCancelingId(null);
                      }
                    }}
                    disabled={cancelingId === b._id}
                  >
                    {cancelingId === b._id ? 'Cancelling…' : 'Cancel'}
                  </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default MyBookings;
