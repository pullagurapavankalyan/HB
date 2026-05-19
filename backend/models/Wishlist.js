const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
  },
  {
    timestamps: true,
  }
);

wishlistSchema.index({ userId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;
