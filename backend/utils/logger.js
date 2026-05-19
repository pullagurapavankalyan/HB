/**
 * Centralized Logger Utility
 */

const info = (message) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
  }
};

const error = (message, err = null) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (err) console.error(err);
  }
};

const warn = (message) => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
};

module.exports = { info, error, warn };
