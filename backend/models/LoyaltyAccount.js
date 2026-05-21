const mongoose = require('mongoose');

const loyaltyAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, default: 0 },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    history: [
      {
        transactionType: { type: String, enum: ['Earned', 'Redeemed', 'Revoked'], required: true },
        pointsAmount: { type: Number, required: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        description: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

loyaltyAccountSchema.index({ userId: 1 });
loyaltyAccountSchema.index({ tier: 1 });

const LoyaltyAccount = mongoose.model('LoyaltyAccount', loyaltyAccountSchema);
module.exports = LoyaltyAccount;
