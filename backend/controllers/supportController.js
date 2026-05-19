const SupportTicket = require('../models/SupportTicket');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Create a support ticket
// @route   POST /api/support
// @access  Private
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, priority } = req.body;
  const ticket = await SupportTicket.create({
    userId: req.user._id,
    subject,
    description,
    priority: priority || 'Medium'
  });
  successResponse(res, 201, 'Ticket created', ticket);
});

// @desc    Get user tickets
// @route   GET /api/support
// @access  Private
const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user._id }).sort({ createdAt: -1 });
  successResponse(res, 200, 'Tickets retrieved', tickets);
});

// @desc    Add response to ticket
// @route   POST /api/support/:id/reply
// @access  Private
const replyToTicket = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const isStaff = req.user.role === 'Admin' || req.user.role === 'Manager';
  
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return errorResponse(res, 404, 'Ticket not found');

  if (!isStaff && ticket.userId.toString() !== req.user._id.toString()) {
    return errorResponse(res, 403, 'Not authorized');
  }

  ticket.responses.push({ responderId: req.user._id, message, isStaff });
  ticket.status = isStaff ? 'In Progress' : 'Open';
  await ticket.save();

  successResponse(res, 200, 'Reply added', ticket);
});

module.exports = { createTicket, getMyTickets, replyToTicket };
