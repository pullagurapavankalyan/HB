import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../store/slices/hotelSlice';
import FeaturedHotelCard from '../components/hotel/FeaturedHotelCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const dispatch = useDispatch();
  const { hotels, loading, error } = useSelector((state) => state.hotel);

  useEffect(() => {
    // Fetch top featured hotels
    dispatch(fetchHotels({ limit: 3, sortBy: 'rating_desc' }));
  }, [dispatch]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary text-white text-center py-5 shadow-sm" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">Find Your Perfect Stay</h1>
          <p className="lead mb-5">Discover luxury hotels, affordable rooms, and unforgettable experiences globally.</p>
          <div className="mx-auto" style={{ maxWidth: '600px' }}>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="container py-5">
        <h2 className="fw-bold mb-4 text-center">Top Rated Destinations</h2>
        
        {loading ? <Loader /> : error ? <ErrorMessage message={error} /> : (
          <div className="row g-4">
            {hotels?.map((hotel) => (
              <div className="col-12 col-md-4" key={hotel._id}>
                <FeaturedHotelCard hotel={hotel} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Promotional Section */}
      <section className="bg-light py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-3">Earn Rewards on Every Stay</h3>
          <p className="text-muted mb-4">Join our loyalty program and get up to 10% back in points.</p>
          <a href="/register" className="btn btn-primary btn-lg fw-bold">Sign Up Now</a>
        </div>
      </section>
    </div>
  );
};

export default Home;
