const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/add')
  .post(protect, addToWishlist);

router.route('/remove/:hotelId')
  .delete(protect, removeFromWishlist);

router.route('/')
  .get(protect, getWishlist);

module.exports = router;
