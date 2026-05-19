const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Handles errors from express-validator checks.
 * Place this at the end of the validation chain in route definitions.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format errors to a readable string or array
    const extractedErrors = errors.array().map((err) => err.msg);
    return errorResponse(res, 400, 'Validation Error', extractedErrors);
  }
  next();
};

module.exports = { validate };
