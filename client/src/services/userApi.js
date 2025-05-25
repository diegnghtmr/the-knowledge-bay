const API_BASE_URL = 'http://localhost:8080/api';

// Función helper para incluir headers de autorización
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Obtener todos los usuarios con filtros
export const getAllUsers = async (search = '', interest = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (interest) params.append('interest', interest);

    const url = `${API_BASE_URL}/users${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Buscar usuarios
export const searchUsers = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Seguir usuario
export const followUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

// Dejar de seguir usuario
export const unfollowUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};