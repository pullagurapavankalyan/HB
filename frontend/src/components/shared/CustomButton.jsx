import React from 'react';

const CustomButton = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  loading = false, 
  disabled = false, 
  className = '', 
  icon = null 
}) => {
  return (
    <button 
      type={type} 
      className={`btn btn-${variant} ${className} d-flex align-items-center justify-content-center gap-2`} 
      onClick={onClick} 
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Processing...
        </>
      ) : (
        <>
          {icon && <i className={`bi ${icon}`}></i>}
          {children}
        </>
      )}
    </button>
  );
};

export default CustomButton;
