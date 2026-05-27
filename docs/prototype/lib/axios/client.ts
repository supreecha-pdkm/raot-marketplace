import axios, { type AxiosInstance } from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem('raot_auth');
    if (raw) {
      try {
        const session = JSON.parse(raw) as { token?: string };
        if (session?.token) config.headers.set('Authorization', `Bearer ${session.token}`);
      } catch {
        // ignore malformed session
      }
    }
  }
  return config;
});

let refreshing: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;
    if (status === 401 && original && !original._retry) {
      original._retry = true;
      refreshing ??= fetch('/api/refresh', { method: 'POST', credentials: 'include' })
        .then(() => undefined)
        .finally(() => {
          refreshing = null;
        });
      await refreshing;
      return api(original);
    }
    return Promise.reject(error);
  },
);
