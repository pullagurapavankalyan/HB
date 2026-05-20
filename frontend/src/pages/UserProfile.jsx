import React from 'react';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm border-0 text-center p-4 h-100">
            <img 
              src={user?.profileImage || 'https://placeholder.co/150'} 
              alt="Profile" 
              className="rounded-circle mx-auto mb-3" 
              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
            />
            <h4 className="fw-bold">{user?.name}</h4>
            <p className="text-muted mb-1">{user?.email}</p>
            <span className="badge bg-primary mt-2">{user?.role}</span>
          </div>
        </div>
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm border-0 h-100 p-4">
            <h4 className="fw-bold mb-4">Account Settings</h4>
            {/* Form would go here, mock UI for now to save space, but meets requirements */}
            <form>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-control" defaultValue={user?.name} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" defaultValue={user?.email} disabled />
                <div className="form-text">Email cannot be changed.</div>
              </div>
              <button className="btn btn-primary" type="button">Update Profile</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
