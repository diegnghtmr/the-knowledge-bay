import apiClient, { requireData } from './apiClient.js';

const GROUPS = '/api/studygroups';
const groupPath = (groupId) => `${GROUPS}/${encodeURIComponent(groupId)}`;
const postPath = (groupId, postId) => `${groupPath(groupId)}/posts/${encodeURIComponent(postId)}`;
const withImage = (group) => ({
  ...group,
  heroImage: `https://placehold.co/600x300/4A5568/FFFFFF?text=${encodeURIComponent(group.interest || 'Grupo')}`,
});

export async function getAllGroups(signal) {
  const response = await apiClient.get(GROUPS, { signal });
  return response.success && Array.isArray(response.data) ? response.data.map(withImage) : [];
}

export async function getGroupById(groupId) {
  const response = await apiClient.get(groupPath(groupId));
  return response.success && response.data ? withImage(response.data) : null;
}

export async function getPostsByGroupId(groupId, page = 0, size = 10, signal) {
  const data = await requireData(apiClient.get(`${groupPath(groupId)}/posts`, {
    params: { page, size }, signal,
  }), 'No se pudieron cargar las publicaciones.');
  return Array.isArray(data) ? data : [];
}

export function likePost(groupId, postId, liked) {
  const path = `${postPath(groupId, postId)}/like`;
  return requireData(liked ? apiClient.post(path) : apiClient.delete(path), 'No se pudo actualizar el me gusta.');
}

export function addCommentToPost(groupId, postId, text) {
  return requireData(apiClient.post(`${postPath(groupId, postId)}/comments`, { text }), 'No se pudo guardar el comentario.');
}
