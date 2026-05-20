import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Table, Modal, Alert } from 'react-bootstrap';
import api from '../api/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ManageHotel = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [hotel, setHotel] = useState(null);
  const [hotelName, setHotelName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  const [rooms, setRooms] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ type: 'Standard', price: 0, quantity: 1 });
  
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user.role !== 'Manager') {
      navigate('/login');
      return;
    }

    const fetchMyHotel = async () => {
      try {
        // Fetch all hotels and find the one managed by this user
        const { data } = await api.get('/hotels');
        const myHotel = data.find(h => h.manager === user._id);
        
        if (myHotel) {
          setHotel(myHotel);
          setHotelName(myHotel.name);
          setLocation(myHotel.location);
          setDescription(myHotel.description);

          // Fetch rooms for this hotel
          const roomsRes = await api.get(`/rooms/hotel/${myHotel._id}`);
          setRooms(roomsRes.data);
        }
      } catch (error) {
        console.error('Error fetching hotel info', error);
      }
    };
    fetchMyHotel();
  }, [isAuthenticated, user, navigate]);

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    try {
      if (hotel) {
        const { data } = await api.put(`/hotels/${hotel._id}`, {
          name: hotelName,
          location,
          description
        });
        setHotel(data);
        setMessage({ type: 'success', text: 'Hotel updated successfully!' });
      } else {
        const { data } = await api.post('/hotels', {
          name: hotelName,
          location,
          description
        });
        setHotel(data);
        setMessage({ type: 'success', text: 'Hotel created successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Error saving hotel' });
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!hotel) return alert('Please save your hotel info first!');

    try {
      const { data } = await api.post('/rooms', {
        ...newRoom, hotel: hotel._id
      });
      
      setRooms([...rooms, data]);
      setShowRoomModal(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding room');
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await api.delete(`/rooms/${id}`);
      setRooms(rooms.filter(r => r._id !== id));
    } catch (error) {
      alert('Error deleting room');
    }
  };

  return (
    <Container className="py-5" style={{ color: 'var(--text-color)' }}>
      <h2 className="mb-4">Manage Hotel Profile</h2>
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      
      <Row>
        <Col md={5}>
          <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} className="mb-4">
            <Card.Body>
              <Card.Title>{hotel ? 'Update Hotel Information' : 'Create Hotel'}</Card.Title>
              <Form onSubmit={handleUpdateHotel}>
                <Form.Group className="mb-3">
                  <Form.Label>Hotel Name</Form.Label>
                  <Form.Control type="text" value={hotelName} onChange={(e) => setHotelName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
                </Form.Group>
                <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
                  {hotel ? 'Update Info' : 'Create Hotel'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={7}>
          <Card style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title className="mb-0">Room Inventory</Card.Title>
                <Button variant="outline-primary" size="sm" onClick={() => setShowRoomModal(true)} disabled={!hotel}>
                  + Add Room Type
                </Button>
              </div>
              <Table hover responsive variant={document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Price/Night</th>
                    <th>Quantity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 && <tr><td colSpan="4">No rooms added yet.</td></tr>}
                  {rooms.map(room => (
                    <tr key={room._id}>
                      <td>{room.type}</td>
                        <td>₹{room.price}</td>
                      <td>{room.quantity}</td>
                      <td>
                        <Button variant="sm" className="btn-outline-danger" onClick={() => handleDeleteRoom(room._id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Room Modal */}
      <Modal show={showRoomModal} onHide={() => setShowRoomModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Room Type</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddRoom}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Room Type</Form.Label>
              <Form.Select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price per Night (₹)</Form.Label>
              <Form.Control type="number" required min="1" value={newRoom.price} onChange={(e) => setNewRoom({...newRoom, price: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity Available</Form.Label>
              <Form.Control type="number" required min="1" value={newRoom.quantity} onChange={(e) => setNewRoom({...newRoom, quantity: e.target.value})} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoomModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add Room</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default ManageHotel;
