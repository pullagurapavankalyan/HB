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
  
  const account = await LoyaltyAccount.findOne({ userId: req.user._id });
  if (!account || account.points < pointsToRedeem) {
    return errorResponse(res, 400, 'Insufficient points');
  }

  account.points -= pointsToRedeem;
  account.history.push({
    transactionType: 'Redeemed',
    pointsAmount: pointsToRedeem,
    bookingId,
    description: 'Redeemed for booking'
  });

  await account.save();
  successResponse(res, 200, 'Points redeemed successfully', account);
});

module.exports = { getLoyaltyAccount, redeemPoints };
