const express = require('express');
const router = express.Router();
const { getHotelRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .post(protect, authorizeRoles('Manager', 'Admin'), createRoom);

router.route('/hotel/:hotelId')
  .get(getHotelRooms);

router.route('/:id')
  .put(protect, authorizeRoles('Manager', 'Admin'), updateRoom)
  .delete(protect, authorizeRoles('Manager', 'Admin'), deleteRoom);

module.exports = router;
