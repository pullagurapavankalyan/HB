const express = require('express');
const router = express.Router();
const { getHotelRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, authorizeRoles('Manager', 'Admin'), upload.array('images', 5), createRoom);

router.route('/hotel/:hotelId')
  .get(getHotelRooms);

router.route('/:id')
  .put(protect, authorizeRoles('Manager', 'Admin'), upload.array('images', 5), updateRoom)
  .delete(protect, authorizeRoles('Manager', 'Admin'), deleteRoom);

module.exports = router;
