import apiClient, { requireData } from './apiClient.js';

const REQUESTS = '/api/help-requests';
const path = (id) => `${REQUESTS}/${encodeURIComponent(id)}`;

export const helpRequestApi = {
  createHelpRequest: (data) => requireData(apiClient.post(REQUESTS, data), 'Error al crear la solicitud de ayuda'),
  getAllHelpRequests: () => requireData(apiClient.get(REQUESTS), 'Error al obtener las solicitudes de ayuda'),
  getHelpRequestById: (id) => requireData(apiClient.get(path(id)), 'Error al obtener la solicitud de ayuda'),
  markAsCompleted: (id) => requireData(apiClient.put(`${path(id)}/complete`), 'Error al marcar como completada'),
  getUserHelpRequests: () => requireData(apiClient.get(`${REQUESTS}/my-requests`), 'Error al obtener las solicitudes de ayuda del usuario'),
};
