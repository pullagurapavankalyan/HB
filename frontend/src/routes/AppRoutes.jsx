import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import Loader from '../components/Loader';
// Sidebar is not used for manager/admin layouts.
import ErrorBoundary from '../components/ErrorBoundary';

// Real Pages
import Home from '../pages/Home';
import Hotels from '../pages/Hotels';
import HotelDetails from '../pages/HotelDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import BookingPage from '../pages/BookingPage';
import PaymentPage from '../pages/PaymentPage';
import BookingSuccess from '../pages/BookingSuccess';
import BookingHistory from '../pages/BookingHistory';
import Wishlist from '../pages/Wishlist';
import Notifications from '../pages/Notifications';
import ManagerRooms from '../pages/ManagerRooms';
import ManagerBookings from '../pages/ManagerBookings';
import ManagerHotels from '../pages/ManagerHotels';
import ManagerReviews from '../pages/ManagerReviews';
import UserProfile from '../pages/UserProfile';
import AdminDashboard from '../pages/AdminDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';
import NotFound from '../pages/NotFound';

// Lazy loaded skeletons for remaining CRUD pages
const Unauthorized = lazy(() => Promise.resolve({ default: () => <div className="p-5 text-center"><h2>Unauthorized Access</h2></div> }));
const ManageHotels = lazy(() => Promise.resolve({ default: () => <div className="p-4"><h2>Manage Hotels</h2></div> }));
const ManageUsers = lazy(() => Promise.resolve({ default: () => <div className="p-4"><h2>Manage Users</h2></div> }));

// Layout Wrappers for Dashboards
const AdminLayout = ({ children }) => (
  <div className="flex-grow-1 p-4 bg-light" style={{ minHeight: '100vh', overflowY: 'auto' }}>
    {children}
  </div>
);

const ManagerLayout = ({ children }) => (
  <div className="flex-grow-1 p-4 bg-light" style={{ minHeight: '100vh', overflowY: 'auto' }}>
    {children}
  </div>
);

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader fullscreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected User Routes */}
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<RoleProtectedRoute allowedRoles={['User']}><BookingHistory /></RoleProtectedRoute>} />
          <Route path="/wishlist" element={<RoleProtectedRoute allowedRoles={['User']}><Wishlist /></RoleProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          {/* Loyalty page removed; points shown in the navbar instead */}
          <Route path="/book/:hotelId/:roomId" element={<RoleProtectedRoute allowedRoles={['User']}><BookingPage /></RoleProtectedRoute>} />
          <Route path="/payment/:bookingId" element={<RoleProtectedRoute allowedRoles={['User']}><PaymentPage /></RoleProtectedRoute>} />
          <Route path="/booking-success/:bookingId" element={<RoleProtectedRoute allowedRoles={['User']}><BookingSuccess /></RoleProtectedRoute>} />

          {/* Protected Manager Routes */}
          <Route path="/manager/*" element={
            <RoleProtectedRoute allowedRoles={['Manager', 'Admin']}>
              <ManagerLayout>
                <Routes>
                  <Route path="dashboard" element={<ManagerDashboard />} />
                  <Route path="my-hotels" element={<ManagerHotels />} />
                  <Route path="rooms" element={<ManagerRooms />} />
                  <Route path="reviews" element={<ManagerReviews />} />
                  <Route path="bookings" element={<ManagerBookings />} />
                </Routes>
              </ManagerLayout>
            </RoleProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/*" element={
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="hotels" element={<ManageHotels />} />
                </Routes>
              </AdminLayout>
            </RoleProtectedRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
