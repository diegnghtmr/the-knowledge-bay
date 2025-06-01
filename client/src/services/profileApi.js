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
export const getProfileByUserId = async (userId) => {
  try {
    console.log(`🔍 [ProfileAPI] Obteniendo perfil real para el usuario ${userId}`);
    const response = await authApi.get(`/api/profile/${userId}`);
    console.log(`✅ [ProfileAPI] Respuesta exitosa para usuario ${userId}:`, response);
    return response;
  } catch (error) {
    console.error(`❌ [ProfileAPI] Error al obtener el perfil del usuario ${userId}:`, error);
    console.error(`❌ [ProfileAPI] Error details:`, error.response?.data || error.message);
    
    // NO usar fallback mock - propagar el error para que se vea
    throw error;
  }
};

// Get follow status with a user
export const getFollowStatus = async (userId) => {
  try {
    console.log(`Obteniendo estado de seguimiento para el usuario ${userId}`);
    // En lugar de un endpoint separado, usamos la información del perfil que ya incluye currentUserFollowing
    const profileResponse = await authApi.get(`/api/profile/${userId}`);
    if (profileResponse.success) {
      return {
        success: true,
        data: {
          isFollowing: profileResponse.data.currentUserFollowing || false
        }
      };
    } else {
      throw new Error('No se pudo obtener el perfil del usuario');
    }
  } catch (error) {
    console.error(`Error al obtener el estado de seguimiento para el usuario ${userId}:`, error);
    
    // Fallback con datos mock
    console.log(`Usando datos mock como fallback para el estado de seguimiento del usuario ${userId}`);
    return {
      success: true,
      data: {
        isFollowing: false // Default fallback
      }
    };
  }
};

// Follow a user
export const followUser = async (userId) => {
  // Endpoint real: POST /api/user/{userId}/follow
  // Como el backend aún no tiene implementada esta ruta, usaremos datos mock
  
  console.log(`Siguiendo al usuario ${userId} (modo mock)`);
  return {
    success: true,
    message: `Ahora estás siguiendo al usuario ${userId}`
  };
  
  /* Descomentar cuando el backend implemente esta ruta
  try {
    return await authApi.post(`/api/user/${userId}/follow`);
  } catch (error) {
    console.error(`Error al seguir al usuario ${userId}:`, error);
    
    // Fallback con datos mock
    return {
      success: true,
      message: `Ahora estás siguiendo al usuario ${userId}`
    };
  }
  */
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  // Endpoint real: POST /api/user/{userId}/unfollow
  // o también podría ser: DELETE /api/user/{userId}/follow
  // Como el backend aún no tiene implementada esta ruta, usaremos datos mock
  
  console.log(`Dejando de seguir al usuario ${userId} (modo mock)`);
  return {
    success: true,
    message: `Has dejado de seguir al usuario ${userId}`
  };

  /* Descomentar cuando el backend implemente esta ruta  
  try {
    return await authApi.post(`/api/user/${userId}/unfollow`);
  } catch (error) {
    console.error(`Error al dejar de seguir al usuario ${userId}:`, error);
    
    // Fallback con datos mock
    return {
      success: true,
      message: `Has dejado de seguir al usuario ${userId}`
    };
  }
  */
};

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
  getFollowStatus,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
};