import React, { useState } from 'react';

const HotelFilters = ({ onFilterApply }) => {
  const [minRating, setMinRating] = useState('');
  const [amenities, setAmenities] = useState([]);

  const amenityOptions = ['WiFi', 'Pool', 'Gym', 'Spa', 'Parking', 'Restaurant'];

  const handleAmenityChange = (e) => {
    const value = e.target.value;
    setAmenities(prev => 
      prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]
    );
  };

  const applyFilters = () => {
    onFilterApply({ minRating, amenities: amenities.join(',') });
  };

  return (
    <div className="card border-0 shadow-sm p-3 mb-4">
      <h6 className="fw-bold mb-3">Filter By</h6>
      
      <div className="mb-3">
        <label className="form-label text-muted small fw-semibold">Minimum Rating</label>
        <select className="form-select" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
          <option value="">Any Rating</option>
          <option value="4">4 Stars & Up</option>
          <option value="3">3 Stars & Up</option>
          <option value="2">2 Stars & Up</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label text-muted small fw-semibold">Amenities</label>
        {amenityOptions.map(option => (
          <div className="form-check" key={option}>
            <input 
              className="form-check-input" 
              type="checkbox" 
              value={option} 
              id={`amenity-${option}`} 
              checked={amenities.includes(option)}
              onChange={handleAmenityChange}
            />
            <label className="form-check-label" htmlFor={`amenity-${option}`}>
              {option}
            </label>
          </div>
        ))}
      </div>

      <button className="btn btn-outline-primary w-100" onClick={applyFilters}>Apply Filters</button>
    </div>
  );
};

export default HotelFilters;
