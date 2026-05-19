const express = require('express');
const router = express.Router();
const { getHotels, getHotel, createHotel, updateHotel, deleteHotel, getHotelImage } = require('../controllers/hotelController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getHotels)
  .post(protect, authorizeRoles('Manager', 'Admin'), upload.array('images', 5), createHotel);

router.route('/:id')
  .get(getHotel)
  .put(protect, authorizeRoles('Manager', 'Admin'), upload.array('images', 5), updateHotel)
  .delete(protect, authorizeRoles('Manager', 'Admin'), deleteHotel);

// Image serving from MongoDB
router.route('/:hotelId/images/:imageId')
  .get(getHotelImage);

module.exports = router;
