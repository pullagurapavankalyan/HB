import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const ManagerHotels = () => {
  const { user } = useSelector((state) => state.auth);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    hotelName: '',
    city: '',
    country: '',
    state: '',
    address: '',
    description: '',
    amenities: '',
    locationLink: '',
    mainImage: null,
    galleryImages: []
  });
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setEditingHotel(null);
    setFormData({
      hotelName: '',
      city: '',
      country: '',
      state: '',
      address: '',
      description: '',
      amenities: '',
      locationLink: '',
      mainImage: null,
      galleryImages: []
    });
  };

  const loadHotels = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const response = await api.get(`/hotels?managerId=${user?._id}`);
      setHotels(response.data.data.hotels || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadHotels();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'mainImage' && files?.length > 0) {
      setFormData((prev) => ({ ...prev, mainImage: files[0] }));
    } else if (name === 'galleryImages' && files?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        galleryImages: Array.from(files)
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const populateForEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      hotelName: hotel.hotelName || '',
      city: hotel.city || '',
      country: hotel.country || '',
      state: hotel.state || '',
      address: hotel.address || '',
      description: hotel.description || '',
      amenities: (hotel.amenities || []).join(', '),
      locationLink: hotel.locationLink ||
        (hotel.location?.coordinates ?
          `https://www.google.com/maps/search/?api=1&query=${hotel.location.coordinates[1]},${hotel.location.coordinates[0]}`
          : '')
    });
    setShowForm(true);
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!formData.hotelName?.trim()) {
      setError('Hotel name is required');
      return;
    }
    if (!formData.city?.trim()) {
      setError('City is required');
      return;
    }
    if (!formData.country?.trim()) {
      setError('Country is required');
      return;
    }
    if (!formData.state?.trim()) {
      setError('State is required');
      return;
    }
    if (!formData.address?.trim()) {
      setError('Address is required');
      return;
    }
    if (!formData.description?.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.locationLink?.trim()) {
      setError('Location link is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    const formDataToSend = new FormData();
    formDataToSend.append('hotelName', formData.hotelName);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('country', formData.country);
    formDataToSend.append('state', formData.state);
    formDataToSend.append('address', formData.address);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('amenities', JSON.stringify(formData.amenities.split(',').map((item) => item.trim()).filter(Boolean)));
    formDataToSend.append('locationLink', formData.locationLink);
    formDataToSend.append('isActive', true);
    
    if (formData.mainImage) {
      formDataToSend.append('images', formData.mainImage);
    }
    if (formData.galleryImages && formData.galleryImages.length > 0) {
      formData.galleryImages.forEach((file) => {
        formDataToSend.append('images', file);
      });
    }

    try {
      if (editingHotel) {
        await api.put(`/hotels/${editingHotel._id}`, formDataToSend);
        setSuccessMessage('Hotel details updated successfully.');
      } else {
        await api.post('/hotels', formDataToSend);
        setSuccessMessage('Hotel property added successfully.');
      }
      resetForm();
      setShowForm(false);
      await loadHotels();
    } catch (err) {
      console.error('Hotel submission error:', err);
      setError(err.response?.data?.message || err.message || 'Could not save the hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
    setError(null);
    setSuccessMessage('');
  };

  const renderHotelCard = (hotel) => (
    <div key={hotel._id} className="col-md-6 col-xl-4">
      <div className="card shadow-sm border-0 h-100">
        <img
          src={
            hotel.images?.[0]?._id 
              ? `${BACKEND_HOST}/api/hotels/${hotel._id}/images/${hotel.images[0]._id}`
              : hotel.images?.[0]?.url?.startsWith('/')
                ? `${BACKEND_HOST}${hotel.images[0].url}`
                : hotel.images?.[0]?.url || 'https://placeholder.co/500x300?text=Hotel+Image'
          }
          className="card-img-top"
          alt={hotel.hotelName}
          style={{ height: '220px', objectFit: 'cover' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{hotel.hotelName}</h5>
          <p className="text-muted small mb-2">{hotel.city}, {hotel.country}</p>
          <p className="text-secondary small flex-grow-1">{hotel.description?.slice(0, 120)}{hotel.description?.length > 120 ? '...' : ''}</p>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="badge bg-primary">{hotel.rating > 0 ? hotel.rating?.toFixed(1) : 'No Reviews Yet'}</span>
            <button className="btn btn-sm btn-outline-primary" onClick={() => populateForEdit(hotel)}>
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">My Hotels</h2>
          <p className="text-muted mb-0">Manage your property listings, rooms, and hotel details from one place.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => { setShowForm(true); setEditingHotel(null); setSuccessMessage(''); setError(null); resetForm(); }}
            disabled={hotels.length >= 1}
            title={hotels.length >= 1 ? 'You can only manage one hotel' : 'Add a new property'}
          >
            Add Property
          </button>
        </div>
      </div>

      {loading && <Loader />}
      {error && <ErrorMessage message={error} />}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {showForm && (
        <div className="card shadow-sm border-0 mb-5">
          <div className="card-body">
            <h4 className="fw-bold mb-4">{editingHotel ? 'Update Hotel Details' : 'Add New Hotel'}</h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Hotel Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="hotelName"
                    value={formData.hotelName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Location Link</label>
                  <input
                    type="url"
                    className="form-control"
                    name="locationLink"
                    value={formData.locationLink}
                    onChange={handleChange}
                    placeholder="https://www.google.com/maps/place/..."
                    required
                  />
                  <small className="text-muted">Enter the hotel location link instead of latitude and longitude.</small>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Amenities</label>
                  <input
                    type="text"
                    className="form-control"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleChange}
                    placeholder="Separate with commas"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Main Image</label>
                  <input
                    type="file"
                    className="form-control"
                    name="mainImage"
                    onChange={handleChange}
                    accept="image/*"
                    {...(editingHotel ? {} : { required: true })}
                  />
                  <small className="text-muted">Upload the main hotel image</small>
                  {formData.mainImage && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(formData.mainImage)} 
                        alt="Main preview" 
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                      />
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Gallery Images</label>
                  <input
                    type="file"
                    multiple
                    className="form-control"
                    name="galleryImages"
                    onChange={handleChange}
                    accept="image/*"
                  />
                  <small className="text-muted">Upload additional hotel images (optional)</small>
                  {formData.galleryImages && formData.galleryImages.length > 0 && (
                    <div className="mt-2 d-flex gap-2 flex-wrap">
                      {Array.from(formData.galleryImages).map((file, idx) => (
                        <img 
                          key={idx}
                          src={URL.createObjectURL(file)} 
                          alt={`Gallery preview ${idx + 1}`} 
                          style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '4px' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="col-12 d-flex align-items-end justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn btn-success">
                    {editingHotel ? 'Save Changes' : 'Create Hotel'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loading && !showForm && hotels.length === 0 && !error && (
        <EmptyState
          title="No Hotels Assigned"
          message="You do not have a property yet. Add a hotel to start managing rooms, bookings, and revenue."
          icon="bi-building"
        />
      )}

      {!loading && hotels.length > 0 && (
        <div className="row g-4">
          {hotels.map(renderHotelCard)}
        </div>
      )}
    </div>
  );
};

export default ManagerHotels;
