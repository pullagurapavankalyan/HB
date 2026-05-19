const express = require('express');
const router = express.Router();
const { createPaymentIntent, stripeWebhook, confirmPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/confirm', protect, confirmPayment);

// Webhook does NOT use JSON parser, but server.js is currently using express.json() globally.
// In a strict production app, the webhook route needs raw body parser.
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhook);

module.exports = router;