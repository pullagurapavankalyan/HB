import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/users', icon: 'bi-people', label: 'Users' },
    { to: '/admin/hotels', icon: 'bi-building', label: 'Hotels' },
    { to: '/admin/coupons', icon: 'bi-tags', label: 'Coupons' },
    { to: '/admin/analytics', icon: 'bi-graph-up', label: 'Analytics' }
  ];

  const managerLinks = [
    { to: '/manager/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/manager/my-hotels', icon: 'bi-building', label: 'My Hotels' },
    { to: '/manager/bookings', icon: 'bi-journal-check', label: 'Bookings' },
  ];

  const links = role === 'Admin' ? adminLinks : managerLinks;

  return (
    <div className="bg-dark text-white flex-column p-3 vh-100 shadow" style={{ width: '250px', position: 'sticky', top: 0 }}>
      <h5 className="text-muted text-uppercase mb-4 mt-2 px-2">{role} Panel</h5>
      <ul className="nav nav-pills flex-column mb-auto gap-2">
        {links.map((link, index) => (
          <li className="nav-item" key={index}>
            <NavLink 
              to={link.to} 
              className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-primary' : ''}`}
            >
              <i className={`bi ${link.icon} me-3 fs-5`}></i>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
