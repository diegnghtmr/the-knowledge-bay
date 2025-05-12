// client/src/services/profileApi.js
import authApi from './authApi';

// Fetch current user profile
export const getProfile = async () => {
  try {
    // Obtener datos del perfil real
    return await authApi.get('/api/profile');
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return {
      success: false,
      message: 'No se pudo obtener el perfil. Verifica la conexión y el token de autenticación.'
    };
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    // Actualizar el perfil real
    return await authApi.put('/api/profile', profileData);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return {
      success: false,
      message: 'No se pudo actualizar el perfil. Verifica la conexión y el token de autenticación.'
    };
  }
};

export default {
  getProfile,
  updateProfile,
};