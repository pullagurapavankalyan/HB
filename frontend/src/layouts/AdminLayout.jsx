import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';

const AdminLayout = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active bg-primary text-white' : 'text-dark';

  return (
    <Container fluid className="py-4 px-4">
      <Row>
        <Col md={2} className="mb-4">
          <div className="card shadow-sm h-100 border-0 bg-light">
            <div className="card-body p-0">
              <h5 className="p-3 mb-0 border-bottom text-primary fw-bold">Admin Panel</h5>
              <Nav className="flex-column nav-pills p-2">
                <Nav.Link as={Link} to="/admin/dashboard" className={`mb-2 rounded ${isActive('/admin/dashboard')}`}>System Overview</Nav.Link>
                <Nav.Link as={Link} to="/admin/users" className={`mb-2 rounded ${isActive('/admin/users')}`}>Manage Users</Nav.Link>
                <Nav.Link as={Link} to="/admin/hotels" className={`mb-2 rounded ${isActive('/admin/hotels')}`}>Manage Hotels</Nav.Link>
                <Nav.Link as={Link} to="/admin/bookings" className={`mb-2 rounded ${isActive('/admin/bookings')}`}>All Bookings</Nav.Link>
                <Nav.Link as={Link} to="/admin/analytics" className={`mb-2 rounded ${isActive('/admin/analytics')}`}>Platform Analytics</Nav.Link>
              </Nav>
            </div>
          </div>
        </Col>
        <Col md={10}>
          <div className="card shadow-sm h-100 border-0">
            <div className="card-body">
              <Outlet />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminLayout;
