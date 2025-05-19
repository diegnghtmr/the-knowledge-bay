// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Inicializar con valores de sessionStorage, con student como fallback
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [userRole, setUserRole] = useState(sessionStorage.getItem('role') || 'student');
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('token'));

  // Información de depuración para el contexto de autenticación
  console.log("AuthContext - Initial userRole:", userRole);
  console.log("AuthContext - Role from sessionStorage:", sessionStorage.getItem('role'));

  // Effect to sync state with sessionStorage on initial load
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedRole = sessionStorage.getItem('role');
    
    console.log("AuthContext - useEffect storedRole:", storedRole);
    
    if (storedToken) {
      setToken(storedToken);
      // Garantizar que siempre haya un rol válido y normalizado
      const originalRole = storedRole || 'student';
      const normalizedRole = originalRole.toLowerCase();
      
      console.log("AuthContext - Original stored role:", originalRole);
      console.log("AuthContext - Normalized role:", normalizedRole);
      
      setUserRole(normalizedRole);
      // Asegurar que el rol esté también en sessionStorage y normalizado
      if (!storedRole || storedRole !== normalizedRole) {
        sessionStorage.setItem('role', normalizedRole);
        console.log("AuthContext - Updated sessionStorage with normalized role");
      }
      setIsAuthenticated(true);
      
      console.log("AuthContext - useEffect authenticated with role:", normalizedRole);
    } else {
      // Ensure state is clear if sessionStorage is empty
      setToken(null);
      setUserRole('student'); // Default role
      setIsAuthenticated(false);
      
      console.log("AuthContext - useEffect not authenticated, reset to student");
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials); // Call the updated API

      if (response.success) {
        const { token: responseToken, role: responseRole } = response.data; // Destructure from data
        
        // Asegurar que haya un rol válido y normalizar a minúsculas
        const originalRole = responseRole || 'student';
        const normalizedRole = originalRole.toLowerCase();
        
        console.log("AuthContext - Login successful with original role:", originalRole);
        console.log("AuthContext - Normalized role for consistency:", normalizedRole);
        
        // Guardar en sessionStorage
        sessionStorage.setItem('token', responseToken);
        sessionStorage.setItem('role', normalizedRole);
        sessionStorage.setItem('userId', credentials.email);
        
        // Actualizar estado
        setToken(responseToken);
        setUserRole(normalizedRole);
        setIsAuthenticated(true);
        
        return { success: true, role: normalizedRole }; // Return success and role
      } else {
        // API call was successful but login failed (e.g., bad credentials)
        console.log("AuthContext - Login failed:", response.message);
        setIsAuthenticated(false); // Ensure state reflects failed login
        // Return the response which contains { success: false, message: '...' }
        return response;
      }
    } catch (error) {
      console.error("AuthContext - Login error:", error);
      return { success: false, message: "Error de conexión al intentar iniciar sesión" };
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
      sessionStorage.removeItem('userId');
      setToken(null);
      setUserRole('student'); // Reset to default role
      setIsAuthenticated(false);
    }
  };

  const value = {
    token,
    userRole,
    isAuthenticated,
    login,
    register,
    logout
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