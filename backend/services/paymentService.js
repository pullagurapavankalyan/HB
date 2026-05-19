const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

/**
 * Service to handle Stripe Payment Intent creation
 */
const processPaymentIntent = async (bookingId, amount, userId) => {
  const amountCents = Math.round(amount * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { bookingId: bookingId.toString(), userId: userId.toString() }
  });

  const payment = await Payment.create({
    bookingId,
    userId,
    paymentGateway: 'Stripe',
    paymentId: paymentIntent.id,
    amount,
    transactionStatus: 'pending'
  });

  return { clientSecret: paymentIntent.client_secret, paymentId: payment._id };
};

/**
 * Service to handle refunds securely
 */
const processRefund = async (paymentId, amount, reason) => {
  const payment = await Payment.findById(paymentId).populate('bookingId');
  if (!payment || payment.transactionStatus !== 'succeeded') {
    throw new Error('Payment not found or not eligible for refund');
  }

  const refund = await stripe.refunds.create({
    payment_intent: payment.paymentId,
    amount: Math.round(amount * 100),
    reason: reason || 'requested_by_customer'
  });

  payment.transactionStatus = 'refunded';
  payment.refundDetails = {
    refundId: refund.id,
    refundAmount: amount,
    refundReason: reason,
    refundDate: new Date()
  };
  await payment.save();

  await Transaction.create({
    transactionId: refund.id,
    userId: payment.userId,
    paymentId: payment._id,
    bookingId: payment.bookingId._id,
    amount,
    type: 'Refund',
    status: 'Completed',
    description: 'Booking Cancellation Refund'
  });

  return refund;
};

module.exports = { processPaymentIntent, processRefund };
