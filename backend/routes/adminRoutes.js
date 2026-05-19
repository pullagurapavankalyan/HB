const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserStatus, getAllHotelsAdmin } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Apply protection and Admin authorization to all routes in this file
router.use(protect);
router.use(authorizeRoles('Admin'));

router.route('/users')
  .get(getAllUsers);

router.route('/users/:id/status')
  .put(updateUserStatus);

router.route('/hotels')
  .get(getAllHotelsAdmin);

module.exports = router;
