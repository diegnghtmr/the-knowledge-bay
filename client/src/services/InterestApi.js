import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // Adjusted to include /api prefix for interests

const interestApiInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Optional: Add interceptors if needed, similar to authApi.js
// For now, keeping it simple as it's just for fetching interests

const interestApi = {
  getAllInterests: async () => {
    try {
      // Using the created instance for the request
      const response = await interestApiInstance.get('/interests');
      // The backend directly returns the array of interests in response.data
      return response.data;
    } catch (error) {
      // Log the error or handle it as per application's error handling strategy
      console.error('Error fetching interests in interestApi:', error.response?.data || error.message || error);
      // Re-throw or return a structured error. For simplicity, re-throwing the relevant part.
      // The component calling this should handle the case where data might not be an array.
      throw error.response?.data || { success: false, message: error.message || 'Failed to fetch interests' };
    }
  },
};

export default interestApi; 