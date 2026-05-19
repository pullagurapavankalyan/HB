const cron = require('node-cron');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const logger = require('../utils/logger');

/**
 * Initializes all background Cron Jobs
 */
const initCronJobs = () => {
  logger.info('Initializing Cron Jobs...');

  // 1. Cleanup expired 'pending' bookings that never paid (runs every hour)
  cron.schedule('0 * * * *', async () => {
    logger.info('CRON: Running pending bookings cleanup task...');
    
    // Find bookings pending for more than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const expiredBookings = await Booking.find({
      paymentStatus: 'pending',
      createdAt: { $lt: twoHoursAgo }
    });

    for (const booking of expiredBookings) {
      // Release room availability
      await Room.findByIdAndUpdate(booking.roomId, {
        $pull: { bookedDates: { bookingId: booking._id } }
      });

      // Update booking status
      booking.bookingStatus = 'cancelled';
      booking.cancellationReason = 'Payment timeout';
      await booking.save();
    }

    if (expiredBookings.length > 0) {
      logger.info(`CRON: Cleaned up ${expiredBookings.length} expired pending bookings.`);
    }
  });

  // Add more cron jobs here (e.g., checkout reminders, review requests)
};

module.exports = { initCronJobs };
