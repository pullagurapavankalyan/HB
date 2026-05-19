import React from 'react';
import { Link } from 'react-router-dom';

const BACKEND_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const FeaturedHotelCard = ({ hotel }) => {
  return (
    <div className="card text-white border-0 shadow-lg overflow-hidden" style={{ borderRadius: '15px', height: '400px' }}>
      <img 
        src={
          hotel.images?.[0]?._id 
            ? `${BACKEND_HOST}/api/hotels/${hotel._id}/images/${hotel.images[0]._id}`
            : hotel.images?.[0]?.url?.startsWith('/')
              ? `${BACKEND_HOST}${hotel.images[0].url}`
              : hotel.images?.[0]?.url || 'https://via.placeholder.com/800x400?text=Featured'
        } 
        className="card-img h-100" 
        alt={hotel.hotelName} 
        style={{ objectFit: 'cover', filter: 'brightness(0.6)' }}
      />
      <div className="card-img-overlay d-flex flex-column justify-content-end p-4">
        <div className="badge bg-warning text-dark mb-2 align-self-start">Featured</div>
        <h3 className="card-title fw-bold display-6">{hotel.hotelName}</h3>
        <p className="card-text lead"><i className="bi bi-geo-alt me-2"></i>{hotel.city}, {hotel.country}</p>
        <div className="d-flex align-items-center mt-3">
          <div className="bg-primary text-white px-3 py-1 rounded me-3 fw-bold fs-5">
            <i className="bi bi-star-fill me-2"></i>{hotel.rating?.toFixed(1)}
          </div>
          <Link to={`/hotels/${hotel._id}`} className="btn btn-light fw-bold px-4">
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedHotelCard;
