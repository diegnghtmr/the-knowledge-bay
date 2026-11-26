import apiClient, { requireData } from './apiClient.js';

const CONTENT = '/api/content';
const path = (id) => `${CONTENT}/${encodeURIComponent(id)}`;

export const contentApi = {
  async createContent(contentData, file = null) {
    const formData = new FormData();
    formData.append('content', new Blob([JSON.stringify(contentData)], { type: 'application/json' }));
    if (file) formData.append('file', file);
    return requireData(apiClient.post(CONTENT, formData), 'Error al crear el contenido');
  },
  downloadAttachment: (id) => requireData(apiClient.get(`${path(id)}/attachment`, { responseType: 'blob' }),
    'No se pudo descargar el archivo.'),
  getAllContent: () => requireData(apiClient.get(CONTENT), 'Error al obtener el contenido'),
  getContentById: (id) => requireData(apiClient.get(path(id)), 'Error al obtener el contenido'),
  likeContent: (id) => requireData(apiClient.post(`${path(id)}/like`), 'Error al dar like'),
  unlikeContent: (id) => requireData(apiClient.delete(`${path(id)}/like`), 'Error al quitar like'),
  getUserContent: () => requireData(apiClient.get(`${CONTENT}/my-content`), 'Error al obtener el contenido del usuario'),
};
