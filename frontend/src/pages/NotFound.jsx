import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '80vh' }}>
      <h1 className="display-1 fw-bold text-primary">404</h1>
      <h2 className="mb-4">Page Not Found</h2>
      <p className="text-muted mb-4 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary btn-lg px-5 rounded-pill">Return to Home</Link>
    </div>
  );
};

export default NotFound;
