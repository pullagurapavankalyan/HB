const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateAccessToken, generateRefreshToken, clearTokenCookie } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return errorResponse(res, 400, 'User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: role || 'User',
  });

  if (user) {
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(res, user._id);
    
    // Save refresh token to user doc
    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, 201, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: accessToken,
    });
  } else {
    errorResponse(res, 400, 'Invalid user data');
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
 
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) return errorResponse(res, 403, 'Account is disabled');

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(res, user._id);
    
    user.refreshToken = refreshToken;
    await user.save();

    successResponse(res, 200, 'Logged in successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      token: accessToken,
    });
  } else {
    errorResponse(res, 401, 'Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  if (req.user) {
    req.user.refreshToken = '';
    await req.user.save();
  }
  successResponse(res, 200, 'Logged out successfully');
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return errorResponse(res, 401, 'No refresh token, authorization denied');

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return errorResponse(res, 403, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    successResponse(res, 200, 'Token refreshed', { token: accessToken });
  } catch (err) {
    return errorResponse(res, 403, 'Refresh token expired or invalid');
  }
});

module.exports = { register, login, logout, refreshToken };
