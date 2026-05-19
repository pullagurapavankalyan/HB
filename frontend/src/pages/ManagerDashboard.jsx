import React from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import { useSelector } from 'react-redux';

const ManagerDashboard = () => {
  const { user } = useSelector(state => state.auth);

  // Mock stats for manager scope
  const mockStats = {
    totalRevenue: 12500,
    bookingsCount: 45,
    totalUsers: 'N/A',
    totalHotels: 3
  };

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4">Welcome back, {user?.name}</h2>
      <p className="text-muted mb-4">Here is the overview of your properties.</p>
      
      <DashboardStats stats={mockStats} />
      
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
                  <tr>
                    <td>#BKG-1234</td>
                    <td>John Doe</td>
                    <td>Grand Resort</td>
                    <td><span className="badge bg-success">CONFIRMED</span></td>
                    <td>$450</td>
                  </tr>
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
