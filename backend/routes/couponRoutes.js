const express = require('express');
const router = express.Router();
const { createCoupon, validateCoupon, getCoupons } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, authorizeRoles('Admin'), getCoupons)
  .post(protect, authorizeRoles('Admin'), createCoupon);

router.route('/validate')
  .post(protect, validateCoupon);

module.exports = router;
