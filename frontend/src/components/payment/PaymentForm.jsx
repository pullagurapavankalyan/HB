import React, { useState } from 'react';
import api from '../../api/axios';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import CustomButton from '../shared/CustomButton';
import ErrorMessage from '../ErrorMessage';

// --- SUB-COMPONENT: ONLY MOUNTS IN REAL PRODUCTION ENGINE MODE ---
const StripeCardInput = () => {
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#495057',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': { color: '#adb5bd' },
      },
      invalid: { color: '#dc3545', iconColor: '#dc3545' },
    },
    hidePostalCode: true,
  };

  return (
    <div className="py-2" style={{ minHeight: '40px' }}>
      <CardElement options={cardElementOptions} />
    </div>
  );
};

// --- MAIN PORTAL CONTROLLER ---
const PaymentForm = ({ clientSecret, onPaymentSuccess, bookingId }) => {
  // Safe extraction lookup: only run Stripe hook values inside real ecosystem scopes
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isDevelopmentMock = clientSecret && clientSecret.startsWith('pi_test_');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!bookingId) {
      setError('Booking ID is missing. Please go back and try again.');
      setLoading(false);
      return;
    }

    if (!clientSecret) {
      setError('Payment session not initialized. Please refresh and try again.');
      setLoading(false);
      return;
    }

    // --- STRATEGY A: SANDBOX TESTING ENVIRONMENT PIPELINE ---
    if (isDevelopmentMock) {
      try {
        const paymentId = clientSecret.substring(0, clientSecret.indexOf('_secret'));

        const response = await api.post('/payments/confirm', {
          bookingId,
          paymentId
        });

        if (response.data.success) {
          onPaymentSuccess();
        } else {
          setError(response.data.message || 'Payment confirmation failed');
        }
      } catch (err) {
        console.error('Mock Checkout Route Error:', err);
        setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // --- STRATEGY B: GENUINE SECURE STRIPE GATEWAY ENGINE ---
    if (!stripe || !elements) {
      setError('Stripe Gateway Engine has not loaded properly. Please wait a moment.');
      setLoading(false);
      return;
    }

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: 'Hotel Guest' },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Stripe SDK engine failure:', err);
      setError('An unexpected structural gateway error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 w-100 mx-auto" style={{ maxWidth: '500px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold">Secure Checkout</h3>
        {isDevelopmentMock && (
          <span className="badge bg-warning text-dark fw-bold px-2 py-1 small">Local Sandbox</span>
        )}
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 border rounded bg-white">
          <label className="form-label text-muted small fw-bold mb-2">Credit or Debit Card</label>
          
          {isDevelopmentMock ? (
            <div className="py-2 text-success small fw-medium d-flex align-items-center justify-content-center border border-dashed rounded bg-light" style={{ minHeight: '40px' }}>
              <i className="bi bi-shield-fill-check me-2 fs-5"></i> 
              Sandbox Gateway Connected Successfully
            </div>
          ) : (
            // Inner component prevents breaking hook boundaries
            <StripeCardInput />
          )}
        </div>
        
        <CustomButton type="submit" loading={loading} className="w-100 btn-success btn-lg fw-bold">
          <i className="bi bi-lock-fill me-2"></i> {isDevelopmentMock ? 'Authorize Sandbox Pay' : 'Pay Now Safely'}
        </CustomButton>
      </form>
      
      <p className="text-center text-muted small mt-3 mb-0">
        <i className="bi bi-shield-check text-success me-1"></i> 
        {isDevelopmentMock ? 'Running under mock validation conditions.' : 'Your data is secured by industry standard encryption.'}
      </p>
    </div>
  );
};

export default PaymentForm;