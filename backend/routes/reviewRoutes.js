const express = require('express');
const router = express.Router();
const { addReview, getHotelReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addReview);

router.route('/hotel/:hotelId')
  .get(getHotelReviews);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;
