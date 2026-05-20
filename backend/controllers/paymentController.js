const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create Payment Intent
// @route   POST /api/payments/create-intent
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return errorResponse(res, 404, 'Booking not found');
  if (booking.paymentStatus === 'paid') return errorResponse(res, 400, 'Booking is already paid');

  // Amount in cents for Stripe
  const amountCents = Math.round(booking.totalAmount * 100);

  let paymentIntent;
  
  // Check if using dummy Stripe key (local development)
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.includes('dummy')) {
    // Mock payment intent for development
    paymentIntent = {
      id: `pi_test_${Date.now()}`,
      client_secret: `pi_test_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: amountCents,
      currency: 'inr',
      status: 'requires_payment_method'
    };
    console.log('⚠️  Using mock Stripe payment intent (development mode)');
  } else {
    // Real Stripe payment intent
    paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'inr',
      metadata: { bookingId: booking._id.toString() }
    });
  }

  // Create initial payment log
  await Payment.create({
    bookingId: booking._id,
    userId: req.user._id,
    paymentGateway: 'Stripe',
    paymentId: paymentIntent.id,
    amount: booking.totalAmount,
    transactionStatus: 'pending'
  });

  successResponse(res, 200, 'Payment intent created', {
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Stripe Webhook (Verify payment asynchronously)
// @route   POST /api/payments/webhook
// @access  Public
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    // Update payment record
    await Payment.findOneAndUpdate(
      { paymentId: paymentIntent.id },
      { transactionStatus: 'succeeded', webhookVerified: true }
    );

    // Update booking status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      bookingStatus: 'confirmed'
    });

    console.log(`Payment confirmed for Booking: ${bookingId}`);
  }

  res.send({ received: true });
});

// @desc    Confirm Payment (for development/testing)
// @route   POST /api/payments/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentId } = req.body;

  if (!bookingId || !paymentId) {
    return errorResponse(res, 400, 'bookingId and paymentId are required');
  }

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { paymentId },
    { transactionStatus: 'succeeded', webhookVerified: true },
    { new: true }
  );

  if (!payment) {
    return errorResponse(res, 404, 'Payment not found');
  }

  // Update booking status
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      paymentStatus: 'paid',
      bookingStatus: 'confirmed'
    },
    { new: true }
  );

  successResponse(res, 200, 'Payment confirmed successfully', {
    booking,
    payment
  });
});

module.exports = { createPaymentIntent, stripeWebhook, confirmPayment };