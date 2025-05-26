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
  // Endpoint real: GET /api/user/{userId}/profile
  // Como el backend aún no tiene implementada esta ruta, usaremos datos mock
  // En una implementación real, descomentar el try/catch y usar la API real
  
  // Mock data para desarrollo y pruebas
  console.log(`Usando datos mock para el perfil del usuario ${userId}`);
  return {
    success: true,
    data: {
      firstName: 'Usuario',
      lastName: 'Ejemplo',
      username: `usuario${userId}`,
      biography: 'Esta es una biografía de ejemplo para un perfil de usuario.',
      email: `usuario${userId}@example.com`,
      dateBirth: '1990-01-01',
      interests: ['Programación', 'JavaScript', 'React'],
      stats: {
        following: 42,
        followers: 120,
        groups: 5,
        content: 18,
        requests: 3
      }
    }
  };
  
  /* Descomentar cuando el backend implemente esta ruta
  try {
    return await authApi.get(`/api/user/${userId}/profile`);
  } catch (error) {
    console.error(`Error al obtener el perfil del usuario ${userId}:`, error);
    
    // Fallback con datos mock
    return {
      success: true,
      data: {
        firstName: 'Usuario',
        lastName: 'Ejemplo',
        username: `usuario${userId}`,
        biography: 'Esta es una biografía de ejemplo para un perfil de usuario.',
        email: `usuario${userId}@example.com`,
        dateBirth: '1990-01-01',
        interests: ['Programación', 'JavaScript', 'React'],
        stats: {
          following: 42,
          followers: 120,
          groups: 5,
          content: 18,
          requests: 3
        }
      }
    };
  }
  */
};

// Get follow status with a user
export const getFollowStatus = async (userId) => {
  // Endpoint real: GET /api/user/{userId}/follow-status
  // Como el backend aún no tiene implementada esta ruta, usaremos datos mock
  
  // Datos mock para desarrollo y pruebas (aleatorio para simular diferentes estados)
  console.log(`Usando datos mock para el estado de seguimiento del usuario ${userId}`);
  return {
    success: true,
    data: {
      isFollowing: Math.random() > 0.5 // 50% probabilidad de que sea true
    }
  };
  
  /* Descomentar cuando el backend implemente esta ruta
  try {
    return await authApi.get(`/api/user/${userId}/follow-status`);
  } catch (error) {
    console.error(`Error al obtener el estado de seguimiento para el usuario ${userId}:`, error);
    
    // Fallback con datos mock
    return {
      success: true,
      data: {
        isFollowing: Math.random() > 0.5 // 50% probabilidad de que sea true
      }
    };
  }
  */
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

export default {
  getProfile,
  updateProfile,
  getProfileByUserId,
  getFollowStatus,
  followUser,
  unfollowUser
};