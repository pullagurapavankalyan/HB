import React from 'react';

const DashboardStats = ({ stats }) => {
  const cards = [
    { title: 'Total Revenue', value: `$${stats?.totalRevenue || 0}`, icon: 'bi-currency-dollar', color: 'primary' },
    { title: 'Total Bookings', value: stats?.bookingsCount || 0, icon: 'bi-journal-check', color: 'success' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: 'bi-people', color: 'info' },
    { title: 'Total Hotels', value: stats?.totalHotels || 0, icon: 'bi-building', color: 'warning' },
  ];

  return (
    <div className="row g-4 mb-4">
      {cards.map((c, i) => (
        <div className="col-12 col-sm-6 col-xl-3" key={i}>
          <div className={`card border-0 shadow-sm border-start border-${c.color} border-4 h-100`}>
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                  <div className="text-muted small fw-bold text-uppercase mb-1">{c.title}</div>
                  <div className="h3 mb-0 fw-bold text-dark">{c.value}</div>
                </div>
                <div className="flex-shrink-0">
                  <i className={`bi ${c.icon} fa-2x text-${c.color} opacity-50 display-6`}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
