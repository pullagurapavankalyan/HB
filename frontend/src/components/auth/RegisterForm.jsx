import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import FormInput from '../shared/FormInput';
import CustomButton from '../shared/CustomButton';
import ErrorMessage from '../ErrorMessage';

const RegisterForm = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '', 
    role: 'User' // Default role
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleChange = (e) => {
    const { id, name, value } = e.target;
    const fieldId = name || id; // Use name attribute if available (for radio buttons)
    setFormData({ ...formData, [fieldId]: value });
    // Clear field error when user starts typing
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;
    const resultAction = await dispatch(registerUser(dataToSend));
    if (registerUser.fulfilled.match(resultAction)) {
      const userData = resultAction.payload;
      // Role-based navigation
      if (userData.role === 'Manager') {
        navigate('/manager/dashboard');
      } else if (userData.role === 'Admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/hotels');
      }
    }
  };

  return (
    <div className="card shadow-lg border-0 p-5 w-100 mx-auto" style={{ maxWidth: '500px' }}>
      <h3 className="text-center mb-4 fw-bold text-primary">Create Your Account</h3>
      
      {error && <ErrorMessage message={error} />}
      
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label fw-semibold">Full Name</label>
          <input
            type="text"
            id="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
          />
          {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
        </div>

        {/* Email Field */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
        </div>

        {/* Phone Field */}
        <div className="mb-3">
          <label htmlFor="phone" className="form-label fw-semibold">Phone Number</label>
          <input
            type="tel"
            id="phone"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
          {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
        </div>

        {/* Password Field */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label fw-semibold">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            id="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
          />
          {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
        </div>

        {/* Confirm Password Field */}
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label htmlFor="role" className="form-label fw-semibold">Account Type</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="roleUser"
                name="role"
                value="User"
                checked={formData.role === 'User'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="roleUser">
                <strong>Guest</strong>
                <div className="small text-muted">Browse and book hotels</div>
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                id="roleManager"
                name="role"
                value="Manager"
                checked={formData.role === 'Manager'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="roleManager">
                <strong>Manager</strong>
                <div className="small text-muted">Manage hotels & properties</div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <CustomButton type="submit" loading={loading} className="w-100 mb-3 btn-lg">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </CustomButton>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-muted">
            Already have an account? 
            <a href="/login" className="ms-2 text-primary fw-semibold text-decoration-none">
              Login here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
