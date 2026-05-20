const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
      reply: {
        message: { type: String },
        repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        repliedAt: { type: Date }
      },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ hotelId: 1, userId: 1 }, { unique: true }); // Prevent multiple reviews by same user for same hotel
reviewSchema.index({ rating: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
