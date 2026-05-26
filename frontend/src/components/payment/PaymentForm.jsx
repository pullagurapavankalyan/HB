import React, { useState } from 'react';
import api from '../../api/axios';
import CustomButton from '../shared/CustomButton';
import ErrorMessage from '../ErrorMessage';

const PaymentForm = ({ booking, loyaltyAccount, bookingId, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
    const isDevelopmentMock = import.meta.env.MODE === 'development';

  const availablePoints = loyaltyAccount?.points || 0;
  const redeemedPoints = booking?.loyaltyPointsRedeemed || 0;
  const totalRedeemPoints = redeemedPoints + (Number.isInteger(pointsToRedeem) ? pointsToRedeem : 0);
  const discountPercent = (totalRedeemPoints / 10) * 7;
  const roundedDiscount = Math.min(100, discountPercent);
  const baseAmount = booking?.originalAmount ?? booking?.totalAmount ?? 0;
  const discountedAmount = Math.max(Math.round((baseAmount * (1 - roundedDiscount / 100)) * 100) / 100, 0);

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').slice(0, 19);
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  const validateCardFields = () => {
    const normalizedNumber = cardNumber.replace(/\D/g, '');
    if (!cardHolderName.trim()) return 'Cardholder name is required.';
    if (!/^\d{12,19}$/.test(normalizedNumber)) return 'Card number must contain 12 to 19 digits.';
    const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
    if (!expiryMatch) return 'Expiry date must be in MM/YY format.';
    const month = Number(expiryMatch[1]);
    let year = Number(expiryMatch[2]);
    if (year < 100) year += 2000;
    const now = new Date();
    const cardExpiry = new Date(year, month - 1, 1);
    if (cardExpiry < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return 'Card expiry must be in the future.';
    }
    if (!/^\d{3,4}$/.test(cvc)) return 'CVC must be 3 or 4 digits.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!bookingId) {
      setError('Booking ID is missing. Please go back and try again.');
      setLoading(false);
      return;
    }

    if (!booking) {
      setError('Booking details are missing. Please refresh and try again.');
      setLoading(false);
      return;
    }

    const validationError = validateCardFields();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const expiryMatch = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
    let expiryMonth = Number(expiryMatch[1]);
    let expiryYear = Number(expiryMatch[2]);
    if (expiryYear < 100) expiryYear += 2000;
    const cleanCardNumber = cardNumber.replace(/\D/g, '');

    try {
      await api.post('/payments/process', {
        bookingId,
        pointsToRedeem: pointsToRedeem || 0,
        cardHolderName: cardHolderName.trim(),
        cardNumber: cleanCardNumber,
        expiryMonth,
        expiryYear,
        cvc,
      });
      onPaymentSuccess();
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 w-100 mx-auto" style={{ maxWidth: '500px' }}>
      <div className="mb-4">
        <h3 className="fw-bold mb-2">Secure Checkout</h3>
        <p className="text-muted small mb-0">Enter card details below and redeem points in blocks of 10 for a 7% discount per block.</p>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 border rounded bg-white">
          <div className="mb-3">
            <strong>Booking Amount:</strong> ₹{baseAmount.toFixed(2)}
          </div>
          <div className="mb-3">
            <strong>Available Star Points:</strong> {availablePoints}
          </div>
          {redeemedPoints > 0 && (
            <div className="mb-3 small text-muted">
              Previously redeemed: {redeemedPoints} points
            </div>
          )}
          <label className="form-label text-muted small fw-bold mb-2">Redeem Star Points</label>
          <input
            type="number"
            min="0"
            step="10"
            max={availablePoints}
            value={pointsToRedeem}
            onChange={(e) => {
              const value = Number(e.target.value) || 0;
              const normalized = Math.max(0, Math.min(value, availablePoints));
              setPointsToRedeem(normalized - (normalized % 10));
            }}
            className="form-control mb-2"
          />
          <div className="small text-muted">
            Discount: {roundedDiscount}% | Final amount: ₹{discountedAmount.toFixed(2)}
          </div>
        </div>
        <div className="mb-4 p-3 border rounded bg-white">
          <label className="form-label text-muted small fw-bold mb-2">Credit or Debit Card</label>
          
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Name on Card</label>
              <input
                type="text"
                className="form-control"
                placeholder="Cardholder Name"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Card Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              />
            </div>
            <div className="col-6">
              <label className="form-label">Expiry (MM/YY)</label>
              <input
                type="text"
                className="form-control"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
              />
            </div>
            <div className="col-6">
              <label className="form-label">CVC</label>
              <input
                type="password"
                className="form-control"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              />
            </div>
          </div>
        </div>
        
        <CustomButton type="submit" loading={loading} className="w-100 btn-success btn-lg fw-bold">
          <i className="bi bi-lock-fill me-2"></i> Pay Now Safely
        </CustomButton>
      </form>
      
      <p className="text-center text-muted small mt-3 mb-0">
        <i className="bi bi-shield-check text-success me-1"></i> 
        Your card details are collected for this booking only and are not stored in full.
      </p>
    </div>
  );
};

export default PaymentForm;