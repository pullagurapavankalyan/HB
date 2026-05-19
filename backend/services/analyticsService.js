const Booking = require('../models/Booking');

/**
 * Aggregation pipeline builder for advanced analytics
 */
const generateRevenueReport = async (startDate, endDate) => {
  const pipeline = [
    { $match: { paymentStatus: 'paid' } }
  ];

  if (startDate && endDate) {
    pipeline[0].$match.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  pipeline.push({
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      },
      dailyRevenue: { $sum: '$totalAmount' },
      bookings: { $sum: 1 }
    }
  });

  pipeline.push({ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } });

  return await Booking.aggregate(pipeline);
};

module.exports = { generateRevenueReport };
