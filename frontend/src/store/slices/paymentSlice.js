import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {
    resetPayment: (state) => {
      state.status = 'idle';
      state.error = null;
    }
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
