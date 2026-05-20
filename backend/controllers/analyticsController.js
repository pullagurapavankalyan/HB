const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse } = require('../utils/apiResponse');

// @desc    Get Admin Revenue Analytics
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const revenueData = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $month: '$createdAt' },
        totalRevenue: { $sum: '$totalAmount' },
        bookingsCount: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const totalUsers = await User.countDocuments();
  const totalHotels = await Hotel.countDocuments();
  const totalRevenueAllTime = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);

  // Count total bookings (all bookings regardless of payment status)
  const totalBookings = await Booking.countDocuments();

  successResponse(res, 200, 'Analytics retrieved', {
    revenueData,
    totalUsers,
    totalHotels,
    totalRevenue: totalRevenueAllTime[0] ? totalRevenueAllTime[0].total : 0,
    totalBookings
  });
});

module.exports = { getRevenueAnalytics };
