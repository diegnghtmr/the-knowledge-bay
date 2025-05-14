// client/src/services/authApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const authApi = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Add token to headers
authApi.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Enviando token en cabecera:', token);
    } else {
      console.log('No se encontró token en sessionStorage');
    }
    return config;
  },
  (error) => {
    // This typically shouldn't happen with request setup, but good practice
    console.error('Request Error:', error);
    return Promise.reject({
      success: false,
      message: error.message || 'Request configuration error',
    });
  }
);

// Response Interceptor: Handle successful responses and errors consistently
authApi.interceptors.response.use(
  (response) => {
    // Assume successful responses have data in response.data
    // Wrap successful response in the desired structure
    return {
      success: true,
      data: response.data,
    };
  },
  (error) => {
    // Handle API errors (e.g., 4xx, 5xx responses)
    console.error('API Error:', error.response || error.message);
    const message = error.response?.data?.message || // Specific message from backend
                    error.message || // General Axios error message
                    'An unexpected error occurred';
    const errorData = error.response?.data || null; // Include full error data if available

    // Return the standardized error structure
    // Use Promise.resolve so the calling function receives the structured error,
    // rather than having to catch a rejection.
    return Promise.resolve({
      success: false,
      message: message,
      data: errorData,
    });
  }
);

// --- API Functions :D ---

// Register user
export const register = async (userData) => {
  // Interceptor handles success/error formatting
  return await authApi.post('/api/auth/register', userData);
};

// Login user
export const login = async (credentials) => {
  // Interceptor handles success/error formatting
  return await authApi.post('/api/auth/login', credentials);
};

// Logout user
export const logout = async () => {
  // Interceptor handles success/error formatting
  // The request interceptor adds the token automatically
  return await authApi.post('/api/auth/logout');
};

export default authApi; // Export the configured instance