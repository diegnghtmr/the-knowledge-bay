import axios from 'axios';
import { clearSession, getSessionToken } from '../context/session.js';

// Callers use /api/... paths. An override may be an origin or end in /api.
const baseURL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '').replace(/\/api$/, '');

const apiClient = axios.create({ baseURL, timeout: 10_000, allowAbsoluteUrls: false });

apiClient.interceptors.request.use((config) => {
  const token = config.publicRequest ? null : getSessionToken();
  if (token) config.headers.setAuthorization(`Bearer ${token}`);
  config.sessionToken = token;
  return config;
}, undefined, { synchronous: true });

apiClient.interceptors.response.use(
  (response) => ({ success: true, data: response.data }),
  (error) => {
    const { status, data } = error.response ?? {};
    if (status === 401) clearSession(error.config?.sessionToken);

    return {
      success: false,
      status,
      message: data?.message || error.message || 'Ocurrió un error inesperado',
      data: data ?? null,
    };
  },
);

export async function openAuthenticatedStream(path, signal) {
  const token = getSessionToken();
  if (!token) return null;
  const response = await fetch(apiClient.getUri({ url: path }), {
    headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token}` },
    signal, cache: 'no-store', credentials: 'omit', redirect: 'error',
  });
  if (response.status === 401) clearSession(token);
  return response;
}

export async function requireData(request, fallback) {
  const response = await request;
  if (!response.success) throw new Error(response.data?.message || fallback);
  return response.data;
}

export default apiClient;
