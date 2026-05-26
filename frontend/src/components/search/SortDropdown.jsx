import React from 'react';
import Select from 'react-select';

const SortDropdown = ({ sortBy, onSortChange }) => {
  const options = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    { value: 'rating_desc', label: 'Top Rated' }
  ];

  const selected = options.find(o => o.value === sortBy) || options[0];

  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
      <span className="text-muted me-2 small fw-semibold">Sort By:</span>
      <div style={{ minWidth: 220 }}>
        <Select
          options={options}
          value={selected}
          onChange={(opt) => onSortChange(opt.value)}
          isSearchable={false}
        />
      </div>
    </div>
  );
};

export default SortDropdown;
