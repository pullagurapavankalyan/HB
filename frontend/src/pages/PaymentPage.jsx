import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PaymentForm from '../components/payment/PaymentForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';


const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBookingAndLoyalty = async () => {
      try {
        const [bookingRes, loyaltyRes] = await Promise.all([
          api.get(`/bookings/${bookingId}`),
          api.get('/loyalty')
        ]);
        setBooking(bookingRes.data.data);
        setLoyaltyAccount(loyaltyRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load payment details.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBookingAndLoyalty();
    }
  }, [bookingId]);

  const handlePaymentSuccess = async () => {
    navigate(`/booking-success/${bookingId}`);
  };

  if (loading) return <Loader fullscreen />;

  if (error) return <ErrorMessage message={error} />;

  if (!booking) return <ErrorMessage message="Booking not found." />;

  return (
    <div className="container py-5">
      <PaymentForm
        booking={booking}
        loyaltyAccount={loyaltyAccount}
        bookingId={bookingId}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PaymentPage;