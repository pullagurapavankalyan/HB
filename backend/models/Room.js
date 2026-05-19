const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomNumber: { type: String, required: true },
    roomType: { type: String, required: true },
    capacity: {
      adults: { type: Number, required: true, default: 2 },
      children: { type: Number, required: true, default: 0 },
    },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    amenities: [{ type: String }],
    images: [{ type: String }],
    availability: { type: Boolean, default: true },
    bookedDates: [
      {
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        checkIn: { type: Date },
        checkOut: { type: Date },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and conflict detection
roomSchema.index({ hotelId: 1, roomType: 1 });
roomSchema.index({ price: 1 });
roomSchema.index({ availability: 1 });
roomSchema.index({ 'bookedDates.checkIn': 1, 'bookedDates.checkOut': 1 });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
