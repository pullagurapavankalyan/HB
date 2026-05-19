const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.delete('/account', protect, deleteAccount);

module.exports = router;
