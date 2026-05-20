import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
  // Map raw DB data to chart format if needed. 
  // Expecting data to look like: [{ month: 'Jan', revenue: 4000 }, ...]
  const chartData = data || [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 }
  ];

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
        <h5 className="card-title fw-bold">Revenue Overview</h5>
      </div>
      <div className="card-body">
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#8884d8" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Area type="monotone" dataKey="revenue" stroke="#0d6efd" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
