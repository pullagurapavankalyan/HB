import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, thunkAPI) => {
  try {
    const response = await api.get('/wishlist');
    return response.data.data.hotels;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load wishlist');
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async ({ hotelId, isAdded }, thunkAPI) => {
  try {
    if (isAdded) {
      await api.delete(`/wishlist/remove/${hotelId}`);
    } else {
      await api.post('/wishlist/add', { hotelId });
    }
    // Return payload to update local state optimistically
    return { hotelId, isAdded };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update wishlist');
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        const { hotelId, isAdded } = action.payload;
        if (isAdded) {
          state.items = state.items.filter(h => h._id !== hotelId);
        } else {
          // Simplified optimistic UI: adding just the ID if full object isn't returned
          // In Phase 8, we will refetch or structure this better
          state.items.push({ _id: hotelId });
        }
      });
  },
});

export default wishlistSlice.reducer;
