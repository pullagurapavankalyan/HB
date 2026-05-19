const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, cancelBooking, getBookingById, getManagerBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, createBooking);

router.route('/mybookings')
  .get(protect, getMyBookings);

router.route('/manager')
  .get(protect, authorizeRoles('Manager', 'Admin'), getManagerBookings);

router.route('/:id')
  .get(protect, getBookingById);

router.route('/:id/cancel')
  .put(protect, cancelBooking);

module.exports = router;
