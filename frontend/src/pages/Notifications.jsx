import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const { notifications, loading, error } = useSelector((state) => state.notification);
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch notifications on mount if needed
    // dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Notifications</h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : notifications && notifications.length > 0 ? (
        <div className="row">
          {notifications.map((notification) => (
            <div className="col-md-8 mb-3" key={notification._id}>
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title">{notification.title}</h5>
                  <p className="card-text text-muted">{notification.message}</p>
                  <small className="text-secondary">
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="No Notifications" 
          message="You're all caught up! Check back later for updates." 
          actionLink="/hotels"
          actionText="Explore Hotels"
        />
      )}
    </div>
  );
};

export default Notifications;
