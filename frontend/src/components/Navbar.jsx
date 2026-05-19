import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, logoutUser } from '../store/slices/authSlice';
import SearchBar from './SearchBar';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // 1. Replaced the ref with a clean React state
  const [isNavOpen, setIsNavOpen] = useState(false);

  const showSearchBar = !user || user.role !== 'Manager';

  const handleLogout = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    closeNavbar(); // Close menu on logout too
    dispatch(logout());
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      // still log out locally if API call fails
    }
    navigate('/login');
  };

  // 2. Clear helper functions to toggle state cleanly
  const toggleNavbar = () => setIsNavOpen(!isNavOpen);
  const closeNavbar = () => setIsNavOpen(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-primary" to="/" onClick={closeNavbar}>
          <i className="bi bi-buildings me-2"></i>
          SmartBooking
        </Link>
        
        {/* 3. Wire up the button toggle to our React State */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNavbar}
          aria-expanded={isNavOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* 4. Use conditional class styling to inject 'show' if the state is open */}
        <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="mainNavbar">
          {showSearchBar && (
            <div className="mx-auto flex-grow-1 px-4 d-none d-lg-block">
              <SearchBar />
            </div>
          )}

          <ul className="navbar-nav ms-auto align-items-center">
            {user?.role !== 'Manager' && (
              <li className="nav-item">
                <Link className="nav-link" to="/hotels" onClick={closeNavbar}>Hotels</Link>
              </li>
            )}
            
            {isAuthenticated ? (
              <>
                {/* Guest-specific links */}
                {user?.role === 'User' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-bookings" onClick={closeNavbar}>My Bookings</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/loyalty" onClick={closeNavbar}>Rewards</Link>
                    </li>
                  </>
                )}

                {/* Manager-specific links */}
                {user?.role === 'Manager' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manager/my-hotels" onClick={closeNavbar}>Hotels</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manager/rooms" onClick={closeNavbar}>Rooms</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manager/bookings" onClick={closeNavbar}>Bookings</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manager/dashboard" onClick={closeNavbar}>Dashboard</Link>
                    </li>
                  </>
                )}

                {/* Admin-specific links */}
                {user?.role === 'Admin' && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard" onClick={closeNavbar}>Admin Dashboard</Link>
                    </li>
                  </>
                )}

                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle fs-5 me-1"></i>
                    {user?.name}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow">
                    <li><Link className="dropdown-item" to="/profile" onClick={closeNavbar}>My Profile</Link></li>
                    {user?.role === 'User' && (
                      <li><Link className="dropdown-item" to="/wishlist" onClick={closeNavbar}>Wishlist</Link></li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li><button type="button" className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </li>
                <li className="nav-item ms-2">
                  <Link to="/notifications" className="nav-link position-relative" onClick={closeNavbar}>
                    <i className="bi bi-bell fs-5"></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.65rem'}}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={closeNavbar}>Login</Link>
                </li>
                <li className="nav-item ms-2">
                  <Link className="btn btn-primary" to="/register" onClick={closeNavbar}>Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;