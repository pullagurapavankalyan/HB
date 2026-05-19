import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchLoyalty = createAsyncThunk('loyalty/fetch', async (_, thunkAPI) => {
  try {
    const response = await api.get('/loyalty');
    return response.data.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load loyalty account');
  }
});

const loyaltySlice = createSlice({
  name: 'loyalty',
  initialState: {
    account: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoyalty.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLoyalty.fulfilled, (state, action) => {
        state.loading = false;
        state.account = action.payload;
      })
      .addCase(fetchLoyalty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default loyaltySlice.reducer;
