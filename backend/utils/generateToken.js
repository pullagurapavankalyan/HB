const jwt = require('jsonwebtoken');

/**
 * Generates an Access Token (short-lived, returned in response payload)
 */
const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

/**
 * Generates a Refresh Token (long-lived, attached to HTTP-Only Cookie)
 */
const generateRefreshToken = (res, id) => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

  // Set HTTP-Only Cookie
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return refreshToken;
};

/**
 * Clears the Refresh Token Cookie on Logout
 */
const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
};

module.exports = { generateAccessToken, generateRefreshToken, clearTokenCookie };
