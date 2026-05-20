import React, { useEffect, useState, useCallback } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loader from '../components/Loader';

const ManagerDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, bookingsCount: 0, totalUsers: 'N/A', totalHotels: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch manager's bookings
      const bookingsRes = await api.get('/bookings/manager');
      const bookings = bookingsRes.data?.data || [];

      // Fetch manager's hotels
      const hotelsRes = await api.get(`/hotels?managerId=${user?._id}`);
      const hotels = hotelsRes.data?.data?.hotels || [];

      // Compute total revenue (only paid bookings)
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.paymentStatus === 'paid' ? (b.totalAmount || 0) : 0), 0);
      const bookingsCount = bookings.length;

      setStats({ totalRevenue, bookingsCount, totalUsers: 'N/A', totalHotels: hotels.length });

      // Sort bookings by createdAt descending and take the latest 8
      const sorted = bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
      setRecentBookings(sorted);
    } catch (err) {
      console.error('Failed to load manager dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4">Welcome back, {user?.name}</h2>
      <p className="text-muted mb-4">Here is the overview of your properties.</p>

      {loading ? <Loader /> : <DashboardStats stats={stats} />}

      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm border-0 p-4">
            <h5 className="fw-bold">Recent Bookings</h5>
            <div className="table-responsive mt-3">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Booking ID</th>
                    <th>Guest</th>
                    <th>Hotel</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No recent bookings</td>
                    </tr>
                  )}
                  {recentBookings.map((b) => (
                    <tr key={b._id}>
                      <td>{b._id}</td>
                      <td>{b.userId?.name || b.userId?.email || 'Guest'}</td>
                      <td>{b.hotelId?.hotelName || '—'}</td>
                      <td>{b.bookingStatus === 'confirmed' || b.paymentStatus === 'paid' ? <span className="badge bg-success">CONFIRMED</span> : <span className="badge bg-secondary">{b.bookingStatus || b.paymentStatus}</span>}</td>
                        <td>₹{b.totalAmount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
