// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));

  // Effect to sync state with sessionStorage on initial load
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedRole = sessionStorage.getItem('role');
    if (storedToken) {
      setToken(storedToken);
      setUserRole(storedRole);
      setIsAuthenticated(true);
    } else {
      // Ensure state is clear if sessionStorage is empty
      setToken(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  }, []); 

  const login = async (credentials) => {
    console.log('AuthContext login called with credentials:', credentials);
    const response = await apiLogin(credentials); // Call the updated API

    if (response.success) {
      const { token: responseToken, role: responseRole } = response.data; // Destructure from data
      sessionStorage.setItem('token', responseToken);
      sessionStorage.setItem('role', responseRole);
      setToken(responseToken);
      setUserRole(responseRole);
      setIsAuthenticated(true);
      return { success: true, role: responseRole }; // Return success and role
    } else {
      // API call was successful but login failed (e.g., bad credentials)
      setIsAuthenticated(false); // Ensure state reflects failed login
      // Return the response which contains { success: false, message: '...' }
      return response;
    }
  };

  const register = async (userData) => {
    // Directly return the result from apiRegister, which matches the desired structure
    const response = await apiRegister(userData);
    return response;
  };

  const logout = async () => {
    try {
      // Attempt API logout, but don't strictly depend on its success for client cleanup
      await apiLogout();
    } catch (error) {
      // Log if the API call itself failed unexpectedly (e.g., network issue)
      // authApi should ideally catch internal errors, so this might be rare.
      console.error("Logout API call failed unexpectedly:", error);
    } finally {
      // Always clear session storage and reset state regardless of API call outcome
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      setToken(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    token,
    userRole,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};