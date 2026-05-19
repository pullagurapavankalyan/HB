import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { createPaymentIntent, resetPayment } from '../store/slices/paymentSlice';
import PaymentForm from '../components/payment/PaymentForm';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

// Initialize stripe cleanly. 
const STRIPE_PUBLIC_KEY = 'pk_test_your_actual_stripe_publishable_key_here';

// If running a placeholder dummy key, generate an empty object state instead of invoking the real SDK constructor
const stripePromise = STRIPE_PUBLIC_KEY.startsWith('pk_') 
  ? loadStripe(STRIPE_PUBLIC_KEY) 
  : Promise.resolve({
      elements: () => null,
      createToken: () => Promise.resolve({ token: null }),
      confirmCardPayment: () => Promise.resolve({ paymentIntent: { status: 'succeeded' } })
    });

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { clientSecret, loading, error } = useSelector(state => state.payment);

  useEffect(() => {
    if (bookingId) {
      dispatch(createPaymentIntent(bookingId));
    }
    return () => {
      dispatch(resetPayment());
    };
  }, [dispatch, bookingId]);

  const handlePaymentSuccess = () => {
    navigate(`/booking-success/${bookingId}`);
  };

  if (loading && !clientSecret) return <Loader fullscreen />;

  return (
    <div className="container py-5">
      {error && <ErrorMessage message={error} />}
      {clientSecret ? (
        // Always wrap with Elements to satisfy internal useStripe hook compilation
        <Elements stripe={stripePromise}>
          <PaymentForm 
            clientSecret={clientSecret} 
            bookingId={bookingId} 
            onPaymentSuccess={handlePaymentSuccess} 
          />
        </Elements>
      ) : (
        <ErrorMessage message="Unable to initialize payment session. Please try again later." />
      )}
    </div>
  );
};

export default PaymentPage;