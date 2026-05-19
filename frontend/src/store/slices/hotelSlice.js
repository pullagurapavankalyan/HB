import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchHotels = createAsyncThunk('hotel/fetchAll', async (params, thunkAPI) => {
  try {
    const { page = 1, limit = 10, keyword = '', amenities = '', minRating = '', sortBy = '' } = params || {};
    const response = await api.get(`/hotels?page=${page}&limit=${limit}&keyword=${keyword}&amenities=${amenities}&minRating=${minRating}&sortBy=${sortBy}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch hotels');
  }
});

export const fetchHotelDetails = createAsyncThunk('hotel/fetchDetails', async (id, thunkAPI) => {
  try {
    const response = await api.get(`/hotels/${id}`);
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch hotel details');
  }
});

const initialState = {
  hotels: [],
  hotelDetails: null,
  pagination: { page: 1, pages: 1, total: 0 },
  loading: false,
  detailsLoading: false,
  error: null,
};

const hotelSlice = createSlice({
  name: 'hotel',
  initialState,
  reducers: {
    clearHotelDetails: (state) => {
      state.hotelDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Hotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.hotels;
        state.pagination = { page: action.payload.page, pages: action.payload.pages, total: action.payload.total };
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Hotel Details
      .addCase(fetchHotelDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.hotelDetails = action.payload;
      })
      .addCase(fetchHotelDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHotelDetails } = hotelSlice.actions;
export default hotelSlice.reducer;
