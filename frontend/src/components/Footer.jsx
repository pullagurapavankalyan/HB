import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-auto border-top border-secondary">
      <div className="container">
        {/* Changed row layout to force 2x2 wrapping on small mobile screens */}
        <div className="row g-4 justify-content-between">
          
          {/* Box 1: Brand (Takes up half screen on mobile) */}
          <div className="col-6 col-lg-4">
            <h5 className="text-primary fw-bold mb-3 small-brand-text">
              <i className="bi bi-buildings me-2"></i>SmartBooking
            </h5>
            <p className="text-white-50 small mb-2 d-none d-sm-block">
              Discover and book world-class hotels effortlessly.
            </p>
            <div className="d-flex gap-2 gap-sm-3 mt-2">
              <a href="#" className="text-white-50 text-primary-hover fs-6"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white-50 text-primary-hover fs-6"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="text-white-50 text-primary-hover fs-6"><i className="bi bi-instagram"></i></a>
            </div>
          </div>

          {/* Box 2: Quick Links (Takes up half screen on mobile) */}
          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3 small-title-text">Explore</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/hotels" className="text-white-50 text-decoration-none text-white-hover">Hotels</Link>
              </li>
              <li className="mb-2">
                <Link to="/loyalty" className="text-white-50 text-decoration-none text-white-hover">Rewards</Link>
              </li>
              <li className="mb-2">
                <Link to="/profile" className="text-white-50 text-decoration-none text-white-hover">Profile</Link>
              </li>
            </ul>
          </div>

          {/* Box 3: For Partners (Takes up half screen on mobile) */}
          <div className="col-6 col-lg-2">
            <h6 className="text-white fw-bold mb-3 small-title-text">Partners</h6>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link to="/manager/dashboard" className="text-white-50 text-decoration-none text-white-hover">Manager</Link>
              </li>
              <li className="mb-2">
                <Link to="/register" className="text-white-50 text-decoration-none text-white-hover">List Hotel</Link>
              </li>
              <li className="mb-2">
                <Link to="/admin/dashboard" className="text-white-50 text-decoration-none text-white-hover">Admin</Link>
              </li>
            </ul>
          </div>

          {/* Box 4: Contact (Takes up half screen on mobile) */}
          <div className="col-6 col-lg-4">
            <h6 className="text-white fw-bold mb-3 small-title-text">Contact</h6>
            <ul className="list-unstyled small text-white-50">
              <li className="mb-2 text-truncate">
                <i className="bi bi-telephone text-primary me-1"></i> +1 (555) 019
              </li>
              <li className="mb-2 text-truncate">
                <i className="bi bi-envelope text-primary me-1"></i> support@sb.com
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="my-4 border-secondary" />

        {/* Bottom Bar */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start small text-white-50">
            © {new Date().getFullYear()} SmartBooking. All rights reserved.
          </div>
          <div className="col-md-6 text-center text-md-end small text-white-50 mt-2 mt-md-0">
            Built with <span className="text-primary fw-semibold">MERN Stack</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;