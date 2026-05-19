const Coupon = require('../models/Coupon');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
  const existing = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (existing) return errorResponse(res, 400, 'Coupon code already exists');

  const coupon = await Coupon.create(req.body);
  successResponse(res, 201, 'Coupon created', coupon);
});

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, purchaseAmount } = req.body;
  
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  
  if (!coupon) return errorResponse(res, 404, 'Invalid or inactive coupon');
  if (new Date() > new Date(coupon.expiryDate)) return errorResponse(res, 400, 'Coupon has expired');
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return errorResponse(res, 400, 'Coupon usage limit reached');
  if (purchaseAmount < coupon.minPurchaseAmount) return errorResponse(res, 400, `Minimum purchase amount of $${coupon.minPurchaseAmount} required`);

  successResponse(res, 200, 'Coupon is valid', coupon);
});

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  successResponse(res, 200, 'Coupons retrieved', coupons);
});

module.exports = { createCoupon, validateCoupon, getCoupons };
