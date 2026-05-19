import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ title = 'No Data Found', message = 'There is nothing here yet.', icon = 'bi-inbox', actionLink = null, actionText = 'Go Back' }) => {
  return (
    <div className="text-center py-5">
      <i className={`bi ${icon} display-1 text-muted mb-3`}></i>
      <h3 className="text-secondary">{title}</h3>
      <p className="text-muted">{message}</p>
      {actionLink && (
        <Link to={actionLink} className="btn btn-primary mt-3">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
