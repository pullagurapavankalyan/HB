const express = require('express');
const router = express.Router();
const { getLoyaltyAccount, redeemPoints } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLoyaltyAccount);

router.route('/redeem')
  .post(protect, redeemPoints);

module.exports = router;
