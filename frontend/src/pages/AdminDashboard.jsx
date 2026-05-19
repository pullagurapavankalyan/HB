import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRevenueAnalytics } from '../store/slices/analyticsSlice';
import DashboardStats from '../components/dashboard/DashboardStats';
import RevenueChart from '../components/dashboard/RevenueChart';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.analytics);

  useEffect(() => {
    dispatch(fetchRevenueAnalytics());
  }, [dispatch]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4">Admin Dashboard</h2>
      <DashboardStats stats={data} />
      <div className="row">
        <div className="col-12">
          <RevenueChart data={data?.revenueData} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
