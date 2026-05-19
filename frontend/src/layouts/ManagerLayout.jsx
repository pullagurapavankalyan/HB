import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';

const ManagerLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active bg-primary text-white' : 'text-dark';

  return (
    <Container className="py-4">
      <Row>
        <Col md={3} className="mb-4">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <h5 className="p-3 mb-0 bg-light border-bottom">Manager Panel</h5>
              <Nav className="flex-column nav-pills p-3">
                <Nav.Link as={Link} to="/manager/dashboard" className={`mb-2 rounded ${isActive('/manager/dashboard')}`}>Overview Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/manager/hotels" className={`mb-2 rounded ${isActive('/manager/hotels')}`}>My Hotels</Nav.Link>
                <Nav.Link as={Link} to="/manager/rooms" className={`mb-2 rounded ${isActive('/manager/rooms')}`}>Manage Rooms</Nav.Link>
                <Nav.Link as={Link} to="/manager/bookings" className={`mb-2 rounded ${isActive('/manager/bookings')}`}>Hotel Bookings</Nav.Link>
                <Nav.Link as={Link} to="/manager/analytics" className={`mb-2 rounded ${isActive('/manager/analytics')}`}>Revenue Analytics</Nav.Link>
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

export default ManagerLayout;
