import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const createBooking = createAsyncThunk('booking/create', async (bookingData, thunkAPI) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create booking');
  }
});

export const fetchMyBookings = createAsyncThunk('booking/fetchMine', async (_, thunkAPI) => {
  try {
    const response = await api.get('/bookings/mybookings');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
  }
});

export const cancelBooking = createAsyncThunk('booking/cancel', async (bookingId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
    const response = await api.put(`/bookings/${bookingId}/cancel`, {}, config);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
  }
});

const initialState = {
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,
  success: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    resetBookingState: (state) => {
      state.error = null;
      state.success = false;
      state.currentBooking = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentBooking = action.payload;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Update the status in the local state array
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        state.success = true;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
