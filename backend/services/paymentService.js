const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

/**
 * Manual payment service placeholders.
 * This project no longer uses payment intent processing.
 */
const processPaymentIntent = async () => {
  throw new Error('Payment intent processing is disabled in this build.');
};

/**
 * Service to handle refunds securely
 */
const processRefund = async (paymentId, amount, reason) => {
  throw new Error('Refund processing is not available for manual card payments.');
};

module.exports = { processPaymentIntent, processRefund };
