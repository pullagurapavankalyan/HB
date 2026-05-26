import React, { useState, useEffect } from 'react';
import Select from 'react-select';
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
    quantity: 1,
    adults: 2,
    children: 0,
    amenities: '',
    description: '',
    roomImage: null
  });
  const [editingRoom, setEditingRoom] = useState(null);

  const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

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
    const { name, value, files } = e.target;
    if (name === 'roomImage' && files?.length > 0) {
      setFormData({ ...formData, roomImage: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    try {
      if (!formData.hotelId) throw new Error('Please select a hotel');
      
      const payloadObj = {
        hotelId: formData.hotelId,
        roomNumber: formData.roomNumber,
        roomType: formData.roomType,
        price: Number(formData.price), // backend expects `price`
        quantity: Number(formData.quantity),
        capacity: { adults: Number(formData.adults), children: Number(formData.children) },
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        description: formData.description
      };

      let res;
      // If image provided, send as multipart/form-data
      if (formData.roomImage) {
        const fd = new FormData();
        Object.keys(payloadObj).forEach((k) => {
          if (k === 'amenities') {
            fd.append(k, JSON.stringify(payloadObj[k]));
          } else if (k === 'capacity') {
            // Unpack object manually so fields append correctly over HTTP form post
            fd.append('capacity[adults]', payloadObj.capacity.adults);
            fd.append('capacity[children]', payloadObj.capacity.children);
          } else if (typeof payloadObj[k] === 'object' && payloadObj[k] !== null) {
            fd.append(k, JSON.stringify(payloadObj[k]));
          } else {
            fd.append(k, payloadObj[k]);
          }
        });
        fd.append('images', formData.roomImage);

        if (editingRoom) {
          res = await api.put(`/rooms/${editingRoom._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          setSuccessMessage('Room updated successfully.');
        } else {
          res = await api.post('/rooms', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          setSuccessMessage('Room created successfully.');
        }
      } else {
        // No image, send JSON directly
        if (editingRoom) {
          res = await api.put(`/rooms/${editingRoom._id}`, payloadObj);
          setSuccessMessage('Room updated successfully.');
        } else {
          res = await api.post('/rooms', payloadObj);
          setSuccessMessage('Room created successfully.');
        }
      }
      
      // Refresh list for selected hotel
      await loadRooms(formData.hotelId);
      setFormData({ hotelId: formData.hotelId, roomNumber: '', roomType: '', price: '', quantity: 1, adults: 2, children: 0, amenities: '', description: '', roomImage: null });
      setShowForm(false);
      setEditingRoom(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not save room.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setShowForm(true);
    setError(null);
    setSuccessMessage('');
    setFormData({
      hotelId: room.hotelId || room.hotel?._id || formData.hotelId,
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || '',
      price: room.pricePerNight || room.price || '',
      adults: room.capacity?.adults || 2,
      children: room.capacity?.children || 0,
      quantity: room.quantity || 1,
      amenities: (room.amenities || []).join(', '),
      description: room.description || '',
      roomImage: null
    });
  };

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/rooms/${roomId}`);
      setSuccessMessage('Room deleted successfully.');
      await loadRooms(formData.hotelId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete room.');
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
          onClick={() => { setShowForm(!showForm); setSuccessMessage(''); setError(null); setEditingRoom(null); }}
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
            <h5 className="card-title mb-3">{editingRoom ? 'Edit Room' : 'Add New Room'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Select Hotel</label>
                  <Select
                    options={hotels.map(h => ({ value: h._id, label: `${h.hotelName} — ${h.city}` }))}
                    value={hotels.find(h => h._id === formData.hotelId) ? { value: formData.hotelId, label: hotels.find(h => h._id === formData.hotelId).hotelName + ' — ' + hotels.find(h => h._id === formData.hotelId).city } : null}
                    onChange={(opt) => { setFormData({ ...formData, hotelId: opt?.value || '' }); if (opt?.value) loadRooms(opt.value); }}
                    isSearchable
                  />
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
                <div className="col-md-6">
                  <label className="form-label">Quantity Available</label>
                  <input type="number" className="form-control" name="quantity" value={formData.quantity} onChange={handleChange} min={1} required />
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
                <div className="col-md-6">
                  <label className="form-label">Room Image</label>
                  <input type="file" className="form-control" name="roomImage" onChange={handleChange} accept="image/*" />
                  {formData.roomImage && (
                    <div className="mt-2">
                      <img src={URL.createObjectURL(formData.roomImage)} alt="preview" style={{ maxWidth: '180px', maxHeight: '120px', borderRadius: '6px' }} />
                    </div>
                  )}
                  {!formData.roomImage && editingRoom && editingRoom.images && editingRoom.images.length > 0 && (
                    <div className="mt-2">
                      <img src={editingRoom.images[0].startsWith('/') ? `${BACKEND_HOST}${editingRoom.images[0]}` : editingRoom.images[0]} alt="current" style={{ maxWidth: '180px', maxHeight: '120px', borderRadius: '6px' }} />
                    </div>
                  )}
                </div>
                <div className="col-12 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setShowForm(false); setError(null); setSuccessMessage(''); setEditingRoom(null); }}>Cancel</button>
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
                {room.images && room.images.length > 0 && (
                  <img src={room.images[0].startsWith('/') ? `${BACKEND_HOST}${room.images[0]}` : room.images[0]} alt="room" style={{ height: '180px', objectFit: 'cover', width: '100%' }} />
                )}
                <div className="card-body">
                  <h5 className="card-title">{room.roomType} — {room.roomNumber}</h5>
                  <p className="text-muted small mb-2">Available units: {room.quantity || 1}</p>
                  <p className="text-muted mb-2">Capacity: {room.capacity?.adults || 0} Adults, {room.capacity?.children || 0} Children</p>
                  <p className="text-primary fw-bold mb-3">₹{room.pricePerNight || room.price}/night</p>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(room)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(room._id)}>Delete</button>
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