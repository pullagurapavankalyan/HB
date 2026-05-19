import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const Loyalty = () => {
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.loyalty);
  const dispatch = useDispatch();

  useEffect(() => {
    // In a real app, fetch loyalty data here
    // dispatch(fetchLoyaltyData());
  }, [dispatch]);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">Rewards Program</h2>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <div className="row">
          {/* Loyalty Points Card */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-star-fill fs-1 text-warning mb-3"></i>
                <h5 className="card-title">Your Points</h5>
                <p className="display-6 fw-bold text-primary">5,250</p>
                <p className="text-muted">Earn points on every booking!</p>
              </div>
            </div>
          </div>

          {/* Tier Status Card */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body text-center">
                <i className="bi bi-trophy-fill fs-1 text-success mb-3"></i>
                <h5 className="card-title">Tier Status</h5>
                <p className="display-6 fw-bold text-success">Silver</p>
                <p className="text-muted">1,750 points to Gold!</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="col-12 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light border-bottom">
                <h6 className="mb-0 fw-bold">Current Benefits</h6>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>5% Discount</strong> on all bookings
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Free Room Upgrade</strong> on eligible hotels
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Priority Support</strong> 24/7
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Early Access</strong> to special deals
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light border-bottom">
                <h6 className="mb-0 fw-bold">Recent Points Activity</h6>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <tbody>
                      <tr>
                        <td>Booking at Grand Ocean Resort</td>
                        <td className="text-end text-success fw-bold">+500 pts</td>
                      </tr>
                      <tr>
                        <td>Tier Bonus - Silver Status</td>
                        <td className="text-end text-success fw-bold">+250 pts</td>
                      </tr>
                      <tr>
                        <td>Referral Reward</td>
                        <td className="text-end text-success fw-bold">+100 pts</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
