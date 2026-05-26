import React, { useState } from 'react';
import Select from 'react-select';

const HotelFilters = ({ onFilterApply, onClose }) => {
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
    if (onClose) onClose();
  };

  return (
    <div className="card border-0 shadow-sm p-3 mb-4">
      <h6 className="fw-bold mb-3">Filter By</h6>
      
      <div className="mb-3">
        <label className="form-label text-muted small fw-semibold">Minimum Rating</label>
        <Select
          options={[
            { value: '', label: 'Any Rating' },
            { value: '4', label: '4 Stars & Up' },
            { value: '3', label: '3 Stars & Up' },
            { value: '2', label: '2 Stars & Up' }
          ]}
          value={minRating ? { value: minRating, label: `${minRating} Stars & Up` } : { value: '', label: 'Any Rating' }}
          onChange={(opt) => setMinRating(opt?.value || '')}
          isSearchable={false}
        />
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

      <div className="d-flex gap-2">
        <button className="btn btn-outline-primary flex-grow-1" onClick={applyFilters}>Apply</button>
        {onClose && <button className="btn btn-outline-secondary d-lg-none" onClick={onClose}>Close</button>}
      </div>
    </div>
  );
};

export default HotelFilters;
