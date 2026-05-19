import React from 'react';

const Loader = ({ fullscreen = false }) => {
  if (fullscreen) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center p-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
