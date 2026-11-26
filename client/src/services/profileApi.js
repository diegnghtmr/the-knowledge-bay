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

// Fetch other user profile by userId
export const getProfileByUserId = (userId) => authApi.get(`/api/profile/${encodeURIComponent(userId)}`);

const followPath = (userId) => `/api/users/${encodeURIComponent(userId)}/follow`;

export const followUser = (userId) => authApi.post(followPath(userId));
export const unfollowUser = (userId) => authApi.delete(followPath(userId));

/**
 * Obtener lista de seguidores del usuario actual
 */
export const getFollowers = async () => {
  try {
    return await authApi.get('/api/profile/followers');
  } catch (error) {
    console.error('Error en getFollowers:', error);
    return { 
      success: false, 
      message: error.message || 'Error al obtener seguidores' 
    };
  }
};

/**
 * Obtener lista de usuarios seguidos por el usuario actual
 */
export const getFollowing = async () => {
  try {
    return await authApi.get('/api/profile/following');
  } catch (error) {
    console.error('Error en getFollowing:', error);
    return { 
      success: false, 
      message: error.message || 'Error al obtener seguidos' 
    };
  }
};

export default {
  getProfile,
  updateProfile,
  getProfileByUserId,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};