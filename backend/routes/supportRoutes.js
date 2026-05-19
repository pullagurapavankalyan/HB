const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, replyToTicket } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createTicket)
  .get(protect, getMyTickets);

router.route('/:id/reply')
  .post(protect, replyToTicket);

module.exports = router;
