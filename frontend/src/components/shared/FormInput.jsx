import React from 'react';

const FormInput = ({ label, type = 'text', id, value, onChange, placeholder, required = false, error, disabled = false }) => {
  return (
    <div className="mb-3 text-start">
      {label && <label htmlFor={id} className="form-label fw-semibold">{label} {required && <span className="text-danger">*</span>}</label>}
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default FormInput;
