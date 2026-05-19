const asyncHandler = require('./asyncHandler');

/**
 * Validates if the authenticated user has the required roles.
 * Must be used AFTER the `protect` middleware.
 * @param  {...String} roles Allowed roles (e.g., 'Admin', 'Manager')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      const error = new Error(`Role (${req.user?.role || 'None'}) is not allowed to access this resource`);
      return next(error);
    }
    next();
  };
};

module.exports = { authorizeRoles };
