const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    hotelName: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    locationLink: { type: String },
    amenities: [{ type: String }],
    images: [{
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      url: { type: String },
      originalName: { type: String },
      contentType: { type: String },
      data: { type: Buffer, select: false }
    }],
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    featured: { type: Boolean, default: false },
    policies: {
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '11:00' },
      cancellationPolicy: { type: String, default: 'Free cancellation up to 24 hours before check-in.' },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Geo-spatial and compound indexes
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ city: 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ featured: -1 });

const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;
