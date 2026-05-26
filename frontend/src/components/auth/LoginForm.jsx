import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import FormInput from '../shared/FormInput';
import CustomButton from '../shared/CustomButton';
import ErrorMessage from '../ErrorMessage';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) newErrors.email = 'Please enter a valid email address.';
    if (!password || password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      const userData = resultAction.payload;
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
    <div className="card shadow-sm border-0 p-4 w-100 max-w-md mx-auto" style={{ maxWidth: '400px' }}>
      <h3 className="text-center mb-4 fw-bold">Welcome Back</h3>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit}>
        <FormInput
          label="Email Address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          error={errors.email}
        />
        <FormInput
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          error={errors.password}
        />
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-muted">
            Don't have an account? <a href="/register" className="text-primary">Register</a>
          </small>
          <CustomButton type="submit" loading={loading} className="ms-2">
            Sign In
          </CustomButton>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
