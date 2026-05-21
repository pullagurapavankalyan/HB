import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { getSocket } from '../utils/socket';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalHotels: 0
  });
  const [revenueData, setRevenueData] = useState(MONTHS.map(m => ({ month: m, amount: 0 })));

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics/revenue');
      const payload = (res.data && res.data.data) ? res.data.data : res.data;

      const revenueAgg = Array.isArray(payload.revenueData) ? payload.revenueData : [];

      // Map aggregated month numbers to our month names and amounts
      const mapped = MONTHS.map((m, idx) => {
        const entry = revenueAgg.find(r => Number(r._id) === idx + 1);
        const amount = entry ? (entry.totalRevenue || entry.total || 0) : 0;
        return { month: m, amount };
      });

      setRevenueData(mapped);

      setStats({
        totalRevenue: payload.totalRevenue || 0,
        totalBookings: payload.totalBookings || 0,
        totalUsers: payload.totalUsers || 0,
        totalHotels: payload.totalHotels || 0
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();

    // Subscribe to booking socket events for live updates
    const socket = getSocket();
    const onNewBooking = () => {
      fetchAnalytics();
    };

    if (socket) {
      socket.on('new_booking', onNewBooking);
    }

    return () => {
      if (socket) socket.off('new_booking', onNewBooking);
    };
  }, [fetchAnalytics]);

  return (
    <div className="container-fluid bg-light min-vh-screen p-4">

      <h1 className="fw-bold text-dark mb-4 mt-2">Admin Dashboard</h1>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 border-0 border-start border-primary border-4 shadow-sm p-3">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <p className="text-uppercase text-muted fw-bold small mb-1" style={{ letterSpacing: '0.05em' }}>Total Revenue</p>
                <h2 className="fw-bold text-dark m-0">${stats.totalRevenue}</h2>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 border-0 border-start border-success border-4 shadow-sm p-3">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <p className="text-uppercase text-muted fw-bold small mb-1" style={{ letterSpacing: '0.05em' }}>Total Bookings</p>
                <h2 className="fw-bold text-dark m-0">{loading ? '...' : stats.totalBookings}</h2>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 border-0 border-start border-info border-4 shadow-sm p-3">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <p className="text-uppercase text-muted fw-bold small mb-1" style={{ letterSpacing: '0.05em' }}>Total Users</p>
                <h2 className="fw-bold text-dark m-0">{stats.totalUsers}</h2>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-xl-3">
          <div className="card h-100 border-0 border-start border-warning border-4 shadow-sm p-3">
            <div className="card-body d-flex justify-content-between align-items-center p-2">
              <div>
                <p className="text-uppercase text-muted fw-bold small mb-1" style={{ letterSpacing: '0.05em' }}>Total Hotels</p>
                <h2 className="fw-bold text-dark m-0">{stats.totalHotels}</h2>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="15" y1="22" x2="15" y2="16"></line><line x1="9" y1="16" x2="15" y2="16"></line><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M8 10h.01"></path><path d="M16 10h.01"></path></svg>
            </div>
          </div>
        </div>

      </div>

      <div className="card border-0 shadow-sm p-4">
        <h2 className="h4 fw-bold text-dark mb-3">Revenue Overview</h2>
        <hr className="border-secondary border-dashed my-3" />

        <div className="d-flex align-items-end justify-content-start pt-3 px-2 overflow-auto" style={{ height: '180px' }}>
          {revenueData.map((data, index) => {
            const heightPercent = `${(data.amount / Math.max(1500, stats.totalRevenue || 1)) * 100}%`;
            return (
              <div key={index} className="d-flex flex-column align-items-center h-100 justify-content-end mx-1" style={{ maxWidth: '28px', flex: '0 0 28px' }}>
                <div 
                  className="w-100 bg-primary bg-opacity-75 rounded-top position-relative"
                  style={{ height: heightPercent, transition: 'all 0.15s ease', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.classList.replace('bg-opacity-75', 'bg-opacity-100')}
                  onMouseOut={(e) => e.currentTarget.classList.replace('bg-opacity-100', 'bg-opacity-75')}
                  title={`$${data.amount}`}
                />
                <span className="fw-semibold text-secondary mt-2 text-center" style={{ fontSize: '0.55rem', lineHeight: '1' }}>{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}