import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const AUTH_SESSION_INVALIDATED_EVENT = 'orbem:auth-session-invalidated';

let authFailureHandled = false;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: false
});

function isPublicAuthRequest(url = '') {
  return ['/api/auth/login', '/api/auth/register'].some((path) => String(url).startsWith(path));
}

function clearStoredSession() {
  localStorage.removeItem('orbem_token');
  localStorage.removeItem('orbem_user');
}

function invalidateSession(message) {
  clearStoredSession();

  if (authFailureHandled) return;
  authFailureHandled = true;

  window.dispatchEvent(
    new CustomEvent(AUTH_SESSION_INVALIDATED_EVENT, {
      detail: {
        message: message || 'Your session is no longer valid. Please sign in again.'
      }
    })
  );
}

api.interceptors.request.use((config) => {
  if (config.url?.startsWith('/') && !config.url.startsWith('/api/')) {
    config.url = `/api${config.url}`;
  }

  const token = localStorage.getItem('orbem_token');
  if (token && !isPublicAuthRequest(config.url)) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (isPublicAuthRequest(response.config?.url)) {
      authFailureHandled = false;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && !isPublicAuthRequest(error.config?.url)) {
      invalidateSession(error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  // Request timed out — Render free tier often cold-starts slowly
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'The server is taking too long to respond. It may be starting up — please wait a moment and try again.';
  }

  // Network error — no response at all
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error' || !error.response) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  if (error.response?.status === 401) {
    return error.response?.data?.message || 'Invalid email or password.';
  }

  if (error.response?.status === 503) {
    return 'The server is starting up. Please wait a moment and refresh the page.';
  }

  if (error.response?.status >= 500) {
    return error.response?.data?.message || 'A server error occurred. Please try again in a moment.';
  }

  return error.response?.data?.message || error.message || 'Request failed. Please try again.';
}

export async function downloadFile(path, filename) {
  const response = await api.get(path, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default api;
