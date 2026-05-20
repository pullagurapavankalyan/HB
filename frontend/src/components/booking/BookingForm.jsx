import React, { useState } from 'react';
import FormInput from '../shared/FormInput';
import CustomButton from '../shared/CustomButton';

const BookingForm = ({ room, onSubmit, loading }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // Simple validation to ensure checkout is after checkin
  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * room.price : 0;
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (new Date(checkIn) >= new Date(checkOut)) {
      alert('Check-out date must be after Check-in date.');
      return;
    }
    const totalAmount = calculateTotal();
    onSubmit({ checkInDate: checkIn, checkOutDate: checkOut, guests: { adults: parseInt(adults), children: parseInt(children) }, totalAmount });
  };

  const total = calculateTotal();

  return (
    <div className="card shadow-sm border-0 p-4">
      <h4 className="fw-bold mb-4">Book {room.roomType}</h4>
      <form onSubmit={handleBook}>
        <FormInput 
          label="Check-in Date" 
          type="date" 
          id="checkIn" 
          value={checkIn} 
          onChange={(e) => setCheckIn(e.target.value)} 
          required 
        />
        <FormInput 
          label="Check-out Date" 
          type="date" 
          id="checkOut" 
          value={checkOut} 
          onChange={(e) => setCheckOut(e.target.value)} 
          required 
        />
        <div className="row">
          <div className="col-md-6">
            <FormInput 
              label="Number of Adults" 
              type="number" 
              id="adults" 
              value={adults} 
              onChange={(e) => setAdults(Math.max(1, e.target.value))} 
              required 
              min="1"
            />
          </div>
          <div className="col-md-6">
            <FormInput 
              label="Number of Children" 
              type="number" 
              id="children" 
              value={children} 
              onChange={(e) => setChildren(Math.max(0, e.target.value))} 
              min="0"
            />
          </div>
        </div>
        
        <hr />
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-muted">Total Amount</span>
          <h4 className="fw-bold text-success m-0">₹{total}</h4>
        </div>

        <CustomButton type="submit" loading={loading} className="w-100 btn-lg" disabled={total <= 0}>
          Proceed to Payment
        </CustomButton>
      </form>
    </div>
  );
};

export default BookingForm;
