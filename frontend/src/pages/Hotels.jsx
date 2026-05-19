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

  const handleFilterApply = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to page 1 on new filter
  };

  return (
    <div className="container py-5">
      <div className="row mb-4 align-items-center">
        <div className="col-md-6">
          <h2 className="fw-bold mb-0">
            {keywordParams ? `Search Results for "${keywordParams}"` : 'Explore Hotels'}
          </h2>
        </div>
        <div className="col-md-6 d-flex justify-content-md-end mt-3 mt-md-0">
          <SortDropdown sortBy={sort} onSortChange={setSort} />
        </div>
      </div>

      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-lg-3 mb-4">
          <HotelFilters onFilterApply={handleFilterApply} />
        </div>

        {/* Main Content */}
        <div className="col-lg-9">
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
