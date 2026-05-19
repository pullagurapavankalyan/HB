const User = require('../models/User');
const Hotel = require('../models/Hotel');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  successResponse(res, 200, 'Users retrieved', users);
});

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 404, 'User not found');
  
  user.isActive = req.body.isActive;
  await user.save();
  
  successResponse(res, 200, 'User status updated', user);
});

// @desc    Get all hotels (Admin view)
// @route   GET /api/admin/hotels
// @access  Private/Admin
const getAllHotelsAdmin = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({}).populate('managerId', 'name email');
  successResponse(res, 200, 'Hotels retrieved', hotels);
});

module.exports = { getAllUsers, updateUserStatus, getAllHotelsAdmin };
