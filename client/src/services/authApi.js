// client/src/services/authApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const authApi = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor to add the token to requests
authApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const register = async (userData) => {
  try {
    const response = await authApi.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    // Return error response data or a generic error object
    return error.response?.data || { success: false, message: 'Registration failed' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await authApi.post('/api/auth/login', credentials);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Login failed' };
  }
};

// Logout doesn't strictly need the interceptor if it's already applied,
// but explicitly adding it here ensures it works even if interceptors change.
// However, the interceptor *should* handle this automatically.
export const logout = async () => {
   // The interceptor will add the token header automatically
  try {
    const response = await authApi.post('/api/auth/logout');
    return response.data;
  } catch (error) {
     // Even if logout API fails, we might want to clear client-side session
    console.error("Logout API call failed:", error.response?.data || error.message);
    // Decide if you want to return failure or a specific structure
    return error.response?.data || { success: false, message: 'Logout failed on server' };
  }
};

export default authApi; // Export the configured instance if needed elsewhere