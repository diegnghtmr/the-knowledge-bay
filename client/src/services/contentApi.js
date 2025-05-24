const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const contentApi = {
  // Crear nuevo contenido
  createContent: async (contentData, file = null) => {
    try {
      // Try both localStorage and sessionStorage to find the token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Token encontrado en storage:', token);
      
      // Crear FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar los datos del contenido como JSON
      formData.append('content', new Blob([JSON.stringify(contentData)], {
        type: 'application/json'
      }));
      
      // Agregar archivo si existe
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`${API_BASE_URL}/api/content`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // No establecer Content-Type para FormData, el navegador lo hace automáticamente
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el contenido');
      }

      return data;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  },

  // Obtener todo el contenido
  getAllContent: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/content`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el contenido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  // Obtener contenido por ID
  getContentById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/content/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener el contenido');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  // Dar like a un contenido
  likeContent: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/content/${id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al dar like');
      }

      return data;
    } catch (error) {
      console.error('Error liking content:', error);
      throw error;
    }
  },

  // Quitar like de un contenido
  unlikeContent: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/content/${id}/like`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al quitar like');
      }

      return data;
    } catch (error) {
      console.error('Error unliking content:', error);
      throw error;
    }
  },
};