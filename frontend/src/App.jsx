import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { initiateSocketConnection, disconnectSocket, subscribeToNotifications } from './utils/socket';
import { addLiveNotification } from './store/slices/notificationSlice';

function App() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Connect to Socket.IO when user is authenticated
      initiateSocketConnection(user._id);

      // Listen for global real-time notifications via Redux
      subscribeToNotifications((notification) => {
        toast.info(notification.message, { position: "top-right", autoClose: 5000 });
        dispatch(addLiveNotification(notification));
      });
    }

    return () => {
      // Cleanup socket on unmount or logout
      disconnectSocket();
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />
      <main className="flex-grow-1">
        <AppRoutes />
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
