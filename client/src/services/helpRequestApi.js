const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const helpRequestApi = {
  // Crear una nueva solicitud de ayuda
  createHelpRequest: async (helpRequestData) => {
    try {
      // Try both localStorage and sessionStorage to find the token
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Token encontrado en storage:', token);
      
      const response = await fetch(`${API_BASE_URL}/api/help-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(helpRequestData),
      });

      if (!response.ok) {
        let errorMessage = 'Error al crear la solicitud de ayuda';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating help request:', error);
      throw error;
    }
  },

  // Obtener todas las solicitudes de ayuda
  getAllHelpRequests: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/help-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes de ayuda');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
  },

  // Obtener una solicitud de ayuda por ID
  getHelpRequestById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/help-requests/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener la solicitud de ayuda');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching help request:', error);
      throw error;
    }
  },

  // Marcar una solicitud de ayuda como completada
  markAsCompleted: async (id) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/help-requests/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error al marcar como completada');
      }

      return data;
    } catch (error) {
      console.error('Error marking help request as completed:', error);
      throw error;
    }
  },

  // Obtener solicitudes de ayuda del usuario actual
  getUserHelpRequests: async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/help-requests/my-requests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener las solicitudes de ayuda del usuario');
      }

      const userRequests = await response.json();
      return userRequests;
    } catch (error) {
      console.error('Error fetching user help requests:', error);
      throw error;
    }
  },
};