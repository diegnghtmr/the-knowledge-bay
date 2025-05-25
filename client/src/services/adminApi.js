const API_BASE_URL = 'http://localhost:8080/api';

// Función helper para incluir headers de autorización
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Obtener estadísticas administrativas
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

// Obtener todos los usuarios (admin)
export const getAllUsersAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
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

// Obtener todo el contenido (admin)
export const getAllContentAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/content`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};

// Obtener todas las solicitudes de ayuda (admin)
export const getAllHelpRequestsAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/help-requests`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching help requests:', error);
    throw error;
  }
};

// Eliminar contenido (admin)
export const deleteContent = async (contentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};

// Eliminar solicitud de ayuda (admin)
export const deleteHelpRequest = async (requestId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/help-requests/${requestId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting help request:', error);
    throw error;
  }
};