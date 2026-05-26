const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const LoyaltyAccount = require('../models/LoyaltyAccount');
const { calculateLoyaltyPoints, upgradeTierIfNeeded } = require('../services/loyaltyService');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Process Card Payment
// @route   POST /api/payments/process
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { bookingId, pointsToRedeem = 0, cardHolderName, cardNumber, expiryMonth, expiryYear, cvc } = req.body;
  const normalizedCardNumber = String(cardNumber || '').replace(/\s+/g, '');
  const normalizedName = String(cardHolderName || '').trim();
  const expiryMonthNum = Number(expiryMonth);
  let expiryYearNum = Number(expiryYear);

  if (!bookingId || !normalizedName || !normalizedCardNumber || !expiryMonth || !expiryYear || !cvc) {
    return errorResponse(res, 400, 'Please provide booking, card and expiry details.');
  }

  if (!/^\d{12,19}$/.test(normalizedCardNumber)) {
    return errorResponse(res, 400, 'Please enter a valid card number.');
  }

  if (!/^(0[1-9]|1[0-2])$/.test(String(expiryMonthNum).padStart(2, '0'))) {
    return errorResponse(res, 400, 'Expiry month must be between 01 and 12.');
  }

  if (!/^[0-9]{2,4}$/.test(String(expiryYearNum))) {
    return errorResponse(res, 400, 'Expiry year must be in YY or YYYY format.');
  }

  if (expiryYearNum < 100) expiryYearNum += 2000;

  const current = new Date();
  const expiryDate = new Date(expiryYearNum, expiryMonthNum - 1, 1);
  if (expiryDate < new Date(current.getFullYear(), current.getMonth(), 1)) {
    return errorResponse(res, 400, 'Card expiry must be in the future.');
  }

  if (!/^\d{3,4}$/.test(String(cvc))) {
    return errorResponse(res, 400, 'CVC must be 3 or 4 digits.');
  }

  const pointsToRedeemNum = Number(pointsToRedeem || 0);
  const booking = await Booking.findById(bookingId);
  if (!booking) return errorResponse(res, 404, 'Booking not found');
  if (booking.paymentStatus === 'paid') return errorResponse(res, 400, 'Booking is already paid');

  const baseAmount = booking.originalAmount || booking.totalAmount;
  let discountedAmount = Math.round(baseAmount * 100) / 100;
  let discountPercent = (booking.loyaltyPointsRedeemed || 0) / 10 * 7;
  const totalRedeemedPoints = (booking.loyaltyPointsRedeemed || 0) + pointsToRedeemNum;

  if (pointsToRedeemNum > 0) {
    if (!Number.isInteger(pointsToRedeemNum) || pointsToRedeemNum <= 0 || pointsToRedeemNum % 10 !== 0) {
      return errorResponse(res, 400, 'Points must be redeemed in multiples of 10');
    }

    const account = await LoyaltyAccount.findOne({ userId: req.user._id });
    if (!account || account.points < pointsToRedeemNum) {
      return errorResponse(res, 400, 'Insufficient star points');
    }
    discountPercent = (totalRedeemedPoints / 10) * 7;
    discountedAmount = Math.max(Math.round((baseAmount * (1 - discountPercent / 100)) * 100) / 100, 0);
  }

  const payment = await Payment.create({
    bookingId: booking._id,
    userId: req.user._id,
    paymentGateway: 'Card',
    paymentId: `card_${Date.now()}`,
    amount: discountedAmount,
    pointsRedeemed: pointsToRedeemNum,
    transactionStatus: 'succeeded',
    currency: 'INR',
    cardLast4: normalizedCardNumber.slice(-4),
  });

  const confirmedBooking = await processSuccessfulPayment(payment, bookingId);

  successResponse(res, 200, 'Payment processed successfully', {
    booking: confirmedBooking,
    payment,
  });
});

const processSuccessfulPayment = async (payment, bookingId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return null;

  const pointsRedeemed = payment.pointsRedeemed || 0;
  const baseAmount = booking.originalAmount || booking.totalAmount;
  if (!booking.originalAmount) booking.originalAmount = booking.totalAmount;

  if (pointsRedeemed > 0) {
    const discountPercent = (pointsRedeemed / 10) * 7;
    booking.totalAmount = Math.max(Math.round((baseAmount * (1 - discountPercent / 100)) * 100) / 100, 0);
    booking.loyaltyPointsRedeemed = pointsRedeemed;
    const account = await LoyaltyAccount.findOne({ userId: booking.userId });
    if (account) {
      account.points = Math.max(0, account.points - pointsRedeemed);
      account.history.push({
        transactionType: 'Redeemed',
        pointsAmount: -pointsRedeemed,
        bookingId: booking._id,
        description: 'Redeemed for booking payment'
      });
      await account.save();
    }
  }

  booking.paymentStatus = 'paid';
  booking.bookingStatus = 'confirmed';
  await booking.save();

  if (booking.loyaltyPointsEarned > 0) {
    await calculateLoyaltyPoints(booking.userId, booking.loyaltyPointsEarned, booking._id);
    await upgradeTierIfNeeded(booking.userId);
  }

  return booking;
};
module.exports = { processPayment };