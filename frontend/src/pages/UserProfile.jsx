// import React from 'react';
// import { useSelector } from 'react-redux';

// const UserProfile = () => {
//   const { user } = useSelector(state => state.auth);

//   return (
//     <div className="container py-5">
//       <div className="row">
//         <div className="col-md-4 mb-4">
//           <div className="card shadow-sm border-0 text-center p-4 h-100">
//             <img 
//               src={user?.profileImage || 'https://placeholder.co/150'} 
//               alt="Profile" 
//               className="rounded-circle mx-auto mb-3" 
//               style={{ width: '150px', height: '150px', objectFit: 'cover' }}
//             />
//             <h4 className="fw-bold">{user?.name}</h4>
//             <p className="text-muted mb-1">{user?.email}</p>
//             <span className="badge bg-primary mt-2">{user?.role}</span>
//           </div>
//         </div>
//         <div className="col-md-8 mb-4">
//           <div className="card shadow-sm border-0 h-100 p-4">
//             <h4 className="fw-bold mb-4">Account Settings</h4>
//             {/* Form would go here, mock UI for now to save space, but meets requirements */}
//             <form>
//               <div className="mb-3">
//                 <label className="form-label">Full Name</label>
//                 <input type="text" className="form-control" defaultValue={user?.name} />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Email Address</label>
//                 <input type="email" className="form-control" defaultValue={user?.email} disabled />
//                 <div className="form-text">Email cannot be changed.</div>
//               </div>
//               <button className="btn btn-primary" type="button">Update Profile</button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const UserProfile = () => {
  // Toggle state for the editing form
  const [isEditing, setIsEditing] = useState(false);

  // Mocking Redux state fallback for safety
  const { user } = useSelector(state => state.auth) || {
    user: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      role: "Premium Member",
      profileImage: "", // Empty string to test the default profile picture fallback
      phone: "+1 (555) 019-2834",
      joinedDate: "Joined March 2024"
    }
  };

  const mockBookings = [
    { id: 'BK-9921', hotel: 'The Grand Resort & Spa', dates: 'June 12 - June 15, 2026', status: 'Confirmed', price: '$450' },
    { id: 'BK-8743', hotel: 'Urban Oasis Stay', dates: 'April 02 - April 05, 2026', status: 'Completed', price: '$290' }
  ];

  // Default SVG Profile Picture if none is provided
  const defaultProfilePic = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#adb5bd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="background-color:#e9ecef;">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `);

  return (
    <div className="container py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="p-4 bg-white rounded-4 shadow-sm border-0 d-flex align-items-center justify-content-between">
            <div>
              <span className="text-overline text-uppercase text-muted tracking-wider small fw-bold">Welcome Back</span>
              <h2 className="fw-bold text-dark mb-0">Hello, {user?.name || 'Guest'}!</h2>
            </div>
            <span className="badge px-3 py-2 text-dark fw-semibold" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeba2', borderRadius: '8px' }}>
              ✨ {user?.role || 'Standard Member'}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile Card */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-4 text-center p-4 bg-white h-100">
            {/* <div className="position-relative d-inline-block mx-auto mb-3">
              <img 
                src={user?.profileImage || defaultProfilePic} 
                alt="Profile" 
                className="rounded-circle border border-4 border-white shadow-sm" 
                style={{ width: '130px', height: '130px', objectFit: 'cover' }}
              />
              <span className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '34px', height: '34px', cursor: 'pointer', fontSize: '14px' }}>
                📸
              </span>
            </div> */}
            
            <h4 className="fw-bold text-dark mb-1">{user?.name}</h4>
            <p className="text-muted small mb-3">{user?.email}</p>
            <hr className="text-muted my-3 opacity-25" />
            
            <div className="text-start bg-light p-3 rounded-3 mb-3">
              <div className="d-flex justify-content-between small text-muted mb-2">
                <span>Account Tier:</span>
                <span className="fw-bold text-dark">{user?.role || 'Loyalty Member'}</span>
              </div>
              <div className="d-flex justify-content-between small text-muted">
                <span>Member Since:</span>
                <span className="fw-bold text-dark">{user?.joinedDate || '2024'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Info / Edit Form & Bookings */}
        <div className="col-lg-8">
          <div className="d-flex flex-column gap-4">
            
            {/* Personal Details / Account Settings Section */}
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white position-relative">
              
              {/* Dynamic Top Right Action Icon */}
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-light position-absolute top-0 end-0 mt-3 me-3 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                  style={{ width: '40px', height: '40px', border: '1px solid #f1f3f5' }}
                  title="Edit Profile"
                >
                  ✏️
                </button>
              )}

              <div className="d-flex align-items-center mb-4">
                <span className="fs-4 me-2">📋</span>
                <h4 className="fw-bold text-dark mb-0">Personal Details</h4>
              </div>
              
              {!isEditing ? (
                /* Clean Read-Only View Mode */
                <div className="row g-3">
                  <div className="col-md-6">
                    <span className="text-muted d-block small fw-bold text-uppercase tracking-wider">Full Name</span>
                    <span className="fs-6 fw-semibold text-dark">{user?.name}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted d-block small fw-bold text-uppercase tracking-wider">Phone Number</span>
                    <span className="fs-6 fw-semibold text-dark">{user?.phone || 'Not Provided'}</span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block small fw-bold text-uppercase tracking-wider">Email Address</span>
                    <span className="fs-6 fw-semibold text-dark">{user?.email}</span>
                  </div>
                </div>
              ) : (
                /* Dynamic Edit Form Mode */
                <form className="animate-fade-in">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Full Name</label>
                      <input type="text" className="form-control form-control-lg bg-light border-0 fs-6" defaultValue={user?.name} style={{ borderRadius: '10px' }} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-bold">Phone Number</label>
                      <input type="tel" className="form-control form-control-lg bg-light border-0 fs-6" defaultValue={user?.phone} style={{ borderRadius: '10px' }} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-bold">Email Address</label>
                      <input type="email" className="form-control form-control-lg bg-light border-0 fs-6 text-muted" defaultValue={user?.email} disabled style={{ borderRadius: '10px' }} />
                      <div className="form-text text-muted small mt-1">🔒 Verified contact email cannot be changed.</div>
                    </div>
                  </div>
                  
                  {/* Form Action Buttons */}
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="btn btn-light btn-lg px-4 py-2 fw-semibold" 
                      style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} /* Add your save function handles here */
                      className="btn btn-primary btn-lg px-4 py-2 fw-semibold" 
                      style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                    >
                      Save
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Hotel Booking History Section */}
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center">
                  <span className="fs-4 me-2">🏨</span>
                  <h4 className="fw-bold text-dark mb-0">Your Bookings</h4>
                </div>
                <a href="#all-bookings" className="text-primary text-decoration-none small fw-semibold">View All</a>
              </div>

              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <thead className="table-light rounded-3">
                    <tr className="text-muted small">
                      <th className="py-3 ps-3">Hotel</th>
                      <th className="py-3">Dates</th>
                      <th className="py-3">Price</th>
                      <th className="py-3 pe-3 text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockBookings.map((booking) => (
                      <tr key={booking.id} className="border-bottom" style={{ borderColor: '#f1f3f5' }}>
                        <td className="py-3 ps-3">
                          <span className="fw-bold text-dark d-block">{booking.hotel}</span>
                          <span className="text-muted small text-uppercase" style={{ fontSize: '0.75rem' }}>{booking.id}</span>
                        </td>
                        <td className="py-3 text-muted">{booking.dates}</td>
                        <td className="py-3 fw-bold text-dark">{booking.price}</td>
                        <td className="py-3 pe-3 text-end">
                          <span className={`badge px-2.5 py-1.5 rounded-pill ${booking.status === 'Confirmed' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;