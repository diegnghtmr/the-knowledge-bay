import apiClient from './apiClient.js';

export const register = (userData) =>
  apiClient.post('/api/auth/register', userData, { publicRequest: true });

export const login = (credentials) =>
  apiClient.post('/api/auth/login', credentials, { publicRequest: true });

export const getSession = (signal) =>
  apiClient.get('/api/auth/session', { signal });

export const logout = () => apiClient.post('/api/auth/logout');

// Older feature services still import their transport from this module.
export default apiClient;
