const express = require('express');
const router = express.Router();
const { addReview, getHotelReviews, deleteReview, getManagerReviews, replyToReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, addReview);

router.route('/hotel/:hotelId')
  .get(getHotelReviews);

router.route('/:id')
  .delete(protect, deleteReview);

router.route('/manager')
  .get(protect, authorizeRoles('Manager', 'Admin'), getManagerReviews);

router.route('/:id/reply')
  .put(protect, authorizeRoles('Manager', 'Admin'), replyToReview);

module.exports = router;
