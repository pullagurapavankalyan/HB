import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const ManagerRooms = () => {
  const { user } = useSelector((state) => state.auth);
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    hotelId: '',
    roomNumber: '',
    roomType: '',
    price: '',
    adults: 2,
    children: 0,
    amenities: '',
    description: ''
  });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user) return;
        const res = await api.get(`/hotels?managerId=${user._id}`);
        const myHotels = res.data.data.hotels || [];
        setHotels(myHotels);
        if (myHotels.length > 0) {
          // default select first hotel
          setFormData((f) => ({ ...f, hotelId: myHotels[0]._id }));
          await loadRooms(myHotels[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load manager hotels.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user]);

  const loadRooms = async (hotelId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/rooms/hotel/${hotelId}`);
      setRooms(res.data.data.rooms || res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load rooms for selected hotel.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      if (!formData.hotelId) throw new Error('Please select a hotel');
      const payload = {
        hotelId: formData.hotelId,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        price: Number(formData.price),
        capacity: { adults: Number(formData.adults), children: Number(formData.children) },
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        description: formData.description
      };

      const res = await api.post('/rooms', payload);
      setSuccessMessage('Room created successfully.');
      // Refresh list for selected hotel
      await loadRooms(formData.hotelId);
      setFormData({ hotelId: formData.hotelId, roomNumber: '', roomType: '', price: '', adults: 2, children: 0, amenities: '', description: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not create room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Manage Rooms</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => { setShowForm(!showForm); setSuccessMessage(''); setError(null); }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          {showForm ? 'Cancel' : 'Add Room'}
        </button>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!loading && hotels.length === 0 && (
        <EmptyState
          title="No Property Found"
          message={<span>You do not have any hotels yet. <a href="/manager/hotels">Add a hotel</a> to start adding rooms.</span>}
        />
      )}

      {showForm && hotels.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Add New Room</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Select Hotel</label>
                  <select className="form-select" name="hotelId" value={formData.hotelId} onChange={handleChange} required>
                    {hotels.map(h => (
                      <option key={h._id} value={h._id}>{h.hotelName} — {h.city}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Room Number</label>
                  <input type="text" className="form-control" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Room Type</label>
                  <input type="text" className="form-control" name="roomType" value={formData.roomType} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Price per Night</label>
                  <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Adults</label>
                  <input type="number" className="form-control" name="adults" value={formData.adults} onChange={handleChange} min={1} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Children</label>
                  <input type="number" className="form-control" name="children" value={formData.children} onChange={handleChange} min={0} />
                </div>
                <div className="col-12">
                  <label className="form-label">Amenities (comma-separated)</label>
                  <input type="text" className="form-control" name="amenities" value={formData.amenities} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows={3}></textarea>
                </div>
                <div className="col-12 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowForm(false); setError(null); setSuccessMessage(''); }}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save Room</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loading && rooms.length === 0 && hotels.length > 0 && (
        <EmptyState title="No Rooms Yet" message="Start by adding your first room to your hotel." />
      )}

      {!loading && rooms.length > 0 && (
        <div className="row g-4">
          {rooms.map((room) => (
            <div className="col-md-6 lg-4" key={room._id}>
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title">{room.roomType} — {room.roomNumber}</h5>
                  <p className="text-muted mb-2">Capacity: {room.capacity?.adults || 0} Adults, {room.capacity?.children || 0} Children</p>
                  <p className="text-primary fw-bold mb-3">${room.price}/night</p>
                  <button className="btn btn-sm btn-warning me-2">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerRooms;
