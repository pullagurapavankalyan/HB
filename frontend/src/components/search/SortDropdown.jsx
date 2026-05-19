import React from 'react';

const SortDropdown = ({ sortBy, onSortChange }) => {
  return (
    <div className="d-flex align-items-center">
      <span className="text-muted me-2 small fw-semibold text-nowrap">Sort By:</span>
      <select 
        className="form-select form-select-sm border-0 bg-light" 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value)}
        style={{ cursor: 'pointer', outline: 'none', boxShadow: 'none' }}
      >
        <option value="recommended">Recommended</option>
        <option value="price_asc">Price (Low to High)</option>
        <option value="price_desc">Price (High to Low)</option>
        <option value="rating_desc">Top Rated</option>
      </select>
    </div>
  );
};

export default SortDropdown;
