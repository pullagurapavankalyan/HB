import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import hotelReducer from './slices/hotelSlice';
import bookingReducer from './slices/bookingSlice';
import paymentReducer from './slices/paymentSlice';
import wishlistReducer from './slices/wishlistSlice';
import loyaltyReducer from './slices/loyaltySlice';
import notificationReducer from './slices/notificationSlice';
import analyticsReducer from './slices/analyticsSlice';
import supportReducer from './slices/supportSlice';

const appReducer = combineReducers({
  auth: authReducer,
  hotel: hotelReducer,
  booking: bookingReducer,
  payment: paymentReducer,
  wishlist: wishlistReducer,
  loyalty: loyaltyReducer,
  notification: notificationReducer,
  analytics: analyticsReducer,
  support: supportReducer,
});

const rootReducer = (state, action) => {
  // Clear all data in redux store to initial.
  if (action.type === 'auth/logout/fulfilled') {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production',
});
