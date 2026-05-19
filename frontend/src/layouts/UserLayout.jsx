import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';

const UserLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active bg-primary text-white' : 'text-dark';

  return (
    <Container className="py-4">
      <Row>
        <Col md={3} className="mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <Nav className="flex-column nav-pills p-3">
                <Nav.Link as={Link} to="/dashboard" className={`mb-2 rounded ${isActive('/dashboard')}`}>Profile</Nav.Link>
                <Nav.Link as={Link} to="/dashboard/bookings" className={`mb-2 rounded ${isActive('/dashboard/bookings')}`}>My Bookings</Nav.Link>
                <Nav.Link as={Link} to="/dashboard/wishlist" className={`mb-2 rounded ${isActive('/dashboard/wishlist')}`}>Wishlist</Nav.Link>
                <Nav.Link as={Link} to="/dashboard/loyalty" className={`mb-2 rounded ${isActive('/dashboard/loyalty')}`}>Loyalty Points</Nav.Link>
                <Nav.Link as={Link} to="/dashboard/support" className={`mb-2 rounded ${isActive('/dashboard/support')}`}>Support Tickets</Nav.Link>
              </Nav>
            </div>
          </div>
        </Col>
        <Col md={9}>
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLayout;
