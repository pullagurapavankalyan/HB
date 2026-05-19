import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../store/slices/wishlistSlice';
import HotelCard from '../components/hotel/HotelCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4">My Wishlist</h2>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : items.length === 0 ? (
        <EmptyState title="Wishlist is Empty" message="Save your favorite hotels here for quick access later." actionLink="/hotels" actionText="Browse Hotels" icon="bi-heart" />
      ) : (
        <div className="row g-4">
          {items.map(hotel => (
            <div className="col-md-6 col-lg-4" key={hotel._id}>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
