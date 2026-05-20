const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { calculateLoyaltyPoints, upgradeTierIfNeeded } = require('./loyaltyService');

/**
 * Service to handle strict Booking transactions with overlaps check
 */
const createSafeBooking = async (userId, hotelId, roomId, inDate, outDate, guests, totalAmount, couponUsed = null) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const room = await Room.findById(roomId).session(session);
    if (!room) throw new Error('Room not found');

    // Advanced overlap detection
    const isOverlap = room.bookedDates.some(
      (b) => inDate < b.checkOut && outDate > b.checkIn
    );

    if (isOverlap) {
      throw new Error('Room is already booked for the selected dates');
    }

    // Points calculation: 1 point for every 100 rupees spent
    const pointsEarned = Math.floor(totalAmount / 100);

    const booking = await Booking.create([{
      userId,
      hotelId,
      roomId,
      checkInDate: inDate,
      checkOutDate: outDate,
      guests,
      totalAmount,
      couponUsed,
      loyaltyPointsEarned: pointsEarned,
      bookingStatus: 'pending',
      paymentStatus: 'pending'
    }], { session });

    await Room.findByIdAndUpdate(roomId, {
      $push: { bookedDates: { bookingId: booking[0]._id, checkIn: inDate, checkOut: outDate } }
    }, { session });

    await session.commitTransaction();
    session.endSession();

    return booking[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * Service to confirm a booking and distribute loyalty points
 */
const confirmBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new Error('Booking not found');

  booking.bookingStatus = 'confirmed';
  booking.paymentStatus = 'paid';
  await booking.save();

  // Distribute loyalty rewards
  if (booking.loyaltyPointsEarned > 0) {
    await calculateLoyaltyPoints(booking.userId, booking.loyaltyPointsEarned, booking._id);
    await upgradeTierIfNeeded(booking.userId);
  }

  return booking;
};

module.exports = { createSafeBooking, confirmBooking };
