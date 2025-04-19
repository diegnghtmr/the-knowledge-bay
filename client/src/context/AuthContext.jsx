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
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      if (data.token && data.role) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('role', data.role);
        setToken(data.token);
        setUserRole(data.role);
        setIsAuthenticated(true);
        return { success: true, role: data.role }; // Return success and role
      } else {
        // Handle cases where API returns success:false or unexpected structure
        setIsAuthenticated(false); // Ensure state reflects failed login
        return data; // Return the error message from API { success, message }
      }
    } catch (error) {
      console.error("Login context error:", error);
      setIsAuthenticated(false); // Ensure state reflects failed login
      // Return a generic error structure if API call itself failed badly
      return { success: false, message: error.message || 'An unexpected error occurred during login.' };
    }
  };

  const register = async (userData) => {
    try {
      const data = await apiRegister(userData);
      // Registration doesn't log the user in automatically in this setup
      // It just returns success/failure message
      return data;
    } catch (error) {
      console.error("Register context error:", error);
      return { success: false, message: error.message || 'An unexpected error occurred during registration.' };
    }
  };

  const logout = async () => {
    try {
      // Attempt to logout via API, but clear client-side session regardless
      await apiLogout();
    } catch (error) {
      // Log the error but proceed with client-side cleanup
      console.error("Logout API call failed, proceeding with client cleanup:", error);
    } finally {
      // Always clear session storage and reset state
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