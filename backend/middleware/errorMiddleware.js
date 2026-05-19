const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Check for Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    message = 'Resource not found or invalid ID format';
    statusCode = 404;
  }

  // Check for Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered. A record with this data already exists.';
    statusCode = 400;
  }

  // Check for Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map((val) => val.message).join(', ');
    statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Not authorized, token failed or is invalid';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Not authorized, token has expired';
    statusCode = 401;
  }

  // Handle Multer payload too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    message = 'File size exceeds the limit of 5MB';
    statusCode = 400;
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${err.name}: ${err.message}`);
    console.error(err.stack);
  }

  errorResponse(
    res, 
    statusCode, 
    message, 
    process.env.NODE_ENV === 'production' ? null : err.stack
  );
};

module.exports = errorHandler;
