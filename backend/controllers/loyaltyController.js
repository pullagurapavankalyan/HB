const LoyaltyAccount = require('../models/LoyaltyAccount');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get user's loyalty account
// @route   GET /api/loyalty
// @access  Private
const getLoyaltyAccount = asyncHandler(async (req, res) => {
  let account = await LoyaltyAccount.findOne({ userId: req.user._id });
  
  if (!account) {
    account = await LoyaltyAccount.create({ userId: req.user._id, points: 0, tier: 'Bronze' });
  }

  successResponse(res, 200, 'Loyalty account retrieved', account);
});

// @desc    Redeem loyalty points
// @route   POST /api/loyalty/redeem
// @access  Private
const redeemPoints = asyncHandler(async (req, res) => {
  const { pointsToRedeem, bookingId } = req.body;
  const pointsValue = Number(pointsToRedeem);
  
  if (!Number.isInteger(pointsValue) || pointsValue <= 0 || pointsValue % 10 !== 0) {
    return errorResponse(res, 400, 'Points must be redeemed in multiples of 10');
  }

  const account = await LoyaltyAccount.findOne({ userId: req.user._id });
  if (!account || account.points < pointsToRedeem) {
    return errorResponse(res, 400, 'Insufficient points');
  }

  account.points -= pointsValue;
  account.history.push({
    transactionType: 'Redeemed',
    pointsAmount: pointsValue,
    bookingId,
    description: 'Redeemed for booking'
  });

  // Record redemption count for booking reference
  if (bookingId) {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(bookingId);
      if (booking) {
      if (booking.paymentStatus === 'paid') {
        return errorResponse(res, 400, 'Cannot redeem points after payment has been completed');
      }

      const totalRedeemedPoints = (booking.loyaltyPointsRedeemed || 0) + pointsValue;
      const discountPercent = (totalRedeemedPoints / 10) * 7;
      const baseAmount = booking.originalAmount || booking.totalAmount;
      booking.originalAmount = booking.originalAmount || booking.totalAmount;
      const discountedAmount = Math.max(Math.round((baseAmount * (1 - discountPercent / 100)) * 100) / 100, 0);
      booking.totalAmount = Math.max(discountedAmount, 0);
      booking.loyaltyPointsRedeemed = totalRedeemedPoints;
      await booking.save();
    }
  }

  await account.save();
  successResponse(res, 200, 'Points redeemed successfully', account);
});

module.exports = { getLoyaltyAccount, redeemPoints };
