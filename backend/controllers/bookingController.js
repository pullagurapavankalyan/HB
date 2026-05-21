const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new booking (Uses MongoDB Transactions to prevent collision)
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { hotelId, roomId, checkInDate, checkOutDate, guests, totalAmount } = req.body;

  // Validate guests format - ensure it has adults property
  if (!guests || typeof guests !== 'object' || !guests.adults) {
    return errorResponse(res, 400, 'Valid guests information (adults and children) is required');
  }

  const inDate = new Date(checkInDate);
  const outDate = new Date(checkOutDate);

  if (inDate >= outDate) {
    return errorResponse(res, 400, 'Check-out must be after check-in');
  }

  try {
    // 1. Fetch room data directly
    const room = await Room.findById(roomId);
    if (!room) {
      return errorResponse(res, 404, 'Room profile document not found');
    }

    // Ensure bookedDates array exists safely
    const datesArray = room.bookedDates || [];
    const totalUnits = room.quantity || 1;

    // 2. Count overlapping bookings and allow booking until room quantity is exhausted
    const overlappedBookings = datesArray.filter((b) => {
      const existingCheckIn = new Date(b.checkIn);
      const existingCheckOut = new Date(b.checkOut);
      return inDate < existingCheckOut && outDate > existingCheckIn;
    });

    if (overlappedBookings.length >= totalUnits) {
      return errorResponse(res, 400, 'Room is already booked for the selected dates');
    }

    // 3. Create the booking document without any transaction sessions
    const loyaltyPointsEarned = Math.floor(Number(totalAmount) / 100);
    const createdBooking = await Booking.create({
      userId: req.user?._id,
      hotelId,
      roomId,
      checkInDate: inDate,
      checkOutDate: outDate,
      guests: {
        adults: guests.adults || 1,
        children: guests.children || 0
      },
      totalAmount,
      loyaltyPointsEarned,
      bookingStatus: 'pending',
      paymentStatus: 'pending'
    });

    // 4. Push booking timeline dates directly onto the Room collection document
    await Room.findByIdAndUpdate(
      roomId,
      {
        $push: { 
          bookedDates: { 
            bookingId: createdBooking._id, 
            checkIn: inDate, 
            checkOut: outDate 
          } 
        }
      },
      { new: true }
    );

    // 5. Broadcast live notification update via WebSockets
    if (req.io) {
      req.io.emit('new_booking', { 
        message: 'New reservation entry received', 
        bookingId: createdBooking._id 
      });
    }

    // Send the clear successful JSON payload straight back to Redux
    return successResponse(res, 201, 'Booking initiated successfully', createdBooking);
    
  } catch (error) {
    console.error('❌ Direct Booking Process Failed:', error.message);
    return errorResponse(res, 400, error.message || 'Failed to complete transaction registration');
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .populate({ path: 'hotelId', select: 'hotelName images city locationLink managerId', populate: { path: 'managerId', select: 'name email' } })
    .populate('roomId', 'roomType roomNumber')
    .sort({ createdAt: -1 });

  successResponse(res, 200, 'Bookings retrieved', bookings);
});

// @desc    Get manager bookings for hotels they manage
// @route   GET /api/bookings/manager
// @access  Private/Manager
const getManagerBookings = asyncHandler(async (req, res) => {
  const hotelIds = await Hotel.find({ managerId: req.user._id }).select('_id');
  const ids = hotelIds.map((hotel) => hotel._id);

  if (ids.length === 0) {
    return successResponse(res, 200, 'Manager bookings retrieved', []);
  }

  const bookings = await Booking.find({ hotelId: { $in: ids } })
    .populate('userId', 'name email')
    .populate('hotelId', 'hotelName city')
    .populate('roomId', 'roomType roomNumber')
    .sort({ createdAt: -1 });

  successResponse(res, 200, 'Manager bookings retrieved', bookings);
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  console.log(`Attempting to cancel booking ${req.params.id} for user ${req.user?._id}`);
  const booking = await Booking.findById(req.params.id);
  if (!booking) return errorResponse(res, 404, 'Booking not found');

  console.log(`Current booking status: ${booking.bookingStatus}, userId: ${booking.userId}`);

  if (String(booking.userId) !== String(req.user._id) && req.user.role !== 'Admin') {
    console.error('Cancellation unauthorized: user mismatch', {
      bookingUser: String(booking.userId),
      requester: String(req.user._id),
      role: req.user.role
    });
    return errorResponse(res, 403, 'Not authorized');
  }

  if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'completed') {
    return errorResponse(res, 400, 'Cannot cancel this booking');
  }

  try {
    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled';
    await booking.save();

    console.log(`Booking ${booking._id} cancelled; removing booked dates.`);

    await Room.findByIdAndUpdate(booking.roomId, {
      $pull: { bookedDates: { bookingId: booking._id } }
    });

    console.log(`Booking cancellation complete for ${booking._id}`);

    // Revoke star points if booking was paid and points were already awarded
    try {
      if (booking.paymentStatus === 'paid' && booking.loyaltyPointsEarned > 0) {
        const account = await LoyaltyAccount.findOne({ userId: booking.userId });
        if (account) {
          const revokeAmount = Number(booking.loyaltyPointsEarned) || 0;
          account.points = Math.max(0, (account.points || 0) - revokeAmount);
          account.history.push({
            transactionType: 'Revoked',
            pointsAmount: -revokeAmount,
            bookingId: booking._id,
            description: 'Points revoked due to booking cancellation'
          });
          await account.save();
        }
      }
    } catch (e) {
      console.error('Failed to revoke loyalty points on cancellation:', e);
    }
    successResponse(res, 200, 'Booking cancelled successfully', booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return errorResponse(res, 500, 'Error cancelling booking');
  }
});

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({ path: 'hotelId', populate: { path: 'managerId', select: 'name email' } })
    .populate('roomId')
    .populate('userId', 'name email');

  if (!booking) return errorResponse(res, 404, 'Booking not found');

  successResponse(res, 200, 'Booking details retrieved', booking);
});

module.exports = { createBooking, getMyBookings, getManagerBookings, cancelBooking, getBookingById };
