const User = require('../models/User');
const Booking = require('../models/Booking');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return errorResponse(res, 404, 'User not found');
  
  successResponse(res, 200, 'Profile retrieved', user);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.profileImage) user.profileImage = req.body.profileImage;

    if (req.body.password) {
      user.password = req.body.password; // Pre-save hook hashes it
    }

    const updatedUser = await user.save();
    successResponse(res, 200, 'Profile updated', {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
    });
  } else {
    errorResponse(res, 404, 'User not found');
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.isActive = false; // Soft delete
    await user.save();
    res.clearCookie('jwt');
    successResponse(res, 200, 'Account deactivated successfully');
  } else {
    errorResponse(res, 404, 'User not found');
  }
});

module.exports = { getProfile, updateProfile, deleteAccount };