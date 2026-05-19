import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const createPaymentIntent = createAsyncThunk('payment/createIntent', async (bookingId, thunkAPI) => {
  try {
    const response = await api.post('/payments/create-intent', { bookingId });
    return response.data.data; // returns clientSecret
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to initialize payment');
  }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    clientSecret: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetPayment: (state) => {
      state.clientSecret = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload could be { clientSecret } or the entire data object
        state.clientSecret = action.payload.clientSecret || action.payload;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
