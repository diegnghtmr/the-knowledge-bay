// client/src/services/profileApi.js
import authApi from './authApi';

// Fetch current user profile
export const getProfile = async () => {
  // Interceptor handles success/error formatting
  return await authApi.get('/api/profile');
};

// Update user profile
export const updateProfile = async (profileData) => {
  // Interceptor handles success/error formatting
  return await authApi.put('/api/profile', profileData);
};

export default {
  getProfile,
  updateProfile,
};