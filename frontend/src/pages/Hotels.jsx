import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchHotels } from '../store/slices/hotelSlice';
import HotelCard from '../components/hotel/HotelCard';
import HotelFilters from '../components/search/HotelFilters';
import SortDropdown from '../components/search/SortDropdown';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const Hotels = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { hotels, pagination, loading, error } = useSelector((state) => state.hotel);

  const queryParams = new URLSearchParams(location.search);
  const keywordParams = queryParams.get('keyword') || '';

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('recommended');
  const [filters, setFilters] = useState({ minRating: '', amenities: '' });

  useEffect(() => {
    dispatch(fetchHotels({
      page,
      limit: 9,
      keyword: keywordParams,
      minRating: filters.minRating,
      amenities: filters.amenities,
      sortBy: sort
    }));
  }, [dispatch, page, sort, filters, keywordParams]);

  useEffect(() => {
    setPage(1);
  }, [keywordParams]);

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on new filter
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="container py-4">
      <div className="row mb-3 align-items-center">
        <div className="col-6 col-md-6">
          <h2 className="fw-bold mb-3 fs-5 fs-md-4">
            {keywordParams ? `Search Results for "${keywordParams}"` : 'Explore Hotels'}
          </h2>
        </div>
        <div className="col-6 col-md-6 d-flex justify-content-end justify-content-md-end gap-2 mt-2 mt-md-0">
          <button 
            className="btn btn-sm btn-outline-secondary d-lg-none" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <i className="bi bi-funnel"></i> Filter
          </button>
          <SortDropdown sortBy={sort} onSortChange={setSort} />
        </div>
      </div>

      <div className="row">
        {/* Sidebar Filters - Hidden on mobile, visible on desktop */}
        <div className={`col-12 col-lg-3 mb-4 ${showFilters ? 'd-block' : 'd-none'} d-lg-block`}>
          <HotelFilters onFilterApply={handleFilterApply} onClose={() => setShowFilters(false)} />
        </div>

        {/* Main Content */}
        <div className="col-12 col-lg-9">
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : hotels.length === 0 ? (
            <EmptyState title="No Hotels Found" message="Try adjusting your filters or search terms." />
          ) : (
            <>
              <div className="row g-4">
                {hotels.map(hotel => (
                  <div className="col-md-6 col-xl-4" key={hotel._id}>
                    <HotelCard hotel={hotel} />
                  </div>
                ))}
              </div>
              <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hotels;
