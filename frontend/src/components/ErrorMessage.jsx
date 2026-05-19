import React from 'react';

const ErrorMessage = ({ message, variant = 'danger' }) => {
  if (!message) return null;

  return (
    <div className={`alert alert-${variant} text-center`} role="alert">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>
      {message}
    </div>
  );
};

export default ErrorMessage;
