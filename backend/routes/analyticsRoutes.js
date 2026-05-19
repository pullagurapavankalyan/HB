const express = require('express');
const router = express.Router();
const { getRevenueAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/revenue')
  .get(protect, authorizeRoles('Admin', 'Manager'), getRevenueAnalytics);

module.exports = router;
