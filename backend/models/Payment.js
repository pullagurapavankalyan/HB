const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentGateway: { type: String, enum: ['Stripe', 'Razorpay'], default: 'Stripe' },
    paymentId: { type: String, required: true }, // Stripe Session ID or Payment Intent ID
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    transactionStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
    },
    webhookVerified: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
    refundDetails: {
      refundId: { type: String },
      refundAmount: { type: Number },
      refundReason: { type: String },
      refundDate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
