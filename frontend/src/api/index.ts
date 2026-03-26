import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const buildApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) return envUrl;

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:5000/api`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  if (Platform.OS === 'ios') return 'http://localhost:5000/api';
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = buildApiBaseUrl();

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ─── Attach JWT to every request ──────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Handle expired sessions ───────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const hadToken = await storage.getToken();
      if (hadToken) {
        await storage.clearAll();
        // Navigation reset handled via AuthContext listener
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Drivers ──────────────────────────────────────────────────────────────
export const driverAPI = {
  getAll: () => api.get('/drivers'),
  getById: (id: string) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  update: (id: string, data: any) => api.put(`/drivers/${id}`, data),
  delete: (id: string) => api.delete(`/drivers/${id}`),
};

// ─── Vehicles ─────────────────────────────────────────────────────────────
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id: string) => api.get(`/vehicles/${id}`),
  create: (data: any) => api.post('/vehicles', data),
  update: (id: string, data: any) => api.put(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
};

// ─── Trips ────────────────────────────────────────────────────────────────
export const tripAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/trips', { params }),
  getById: (id: string) => api.get(`/trips/${id}`),
  create: (data: any) => api.post('/trips', data),
  update: (id: string, data: any) => api.put(`/trips/${id}`, data),
  complete: (id: string) => api.patch(`/trips/${id}/complete`),
  delete: (id: string) => api.delete(`/trips/${id}`),
};

// ─── Users (admin) ────────────────────────────────────────────────────────
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data: { name: string; email: string; password: string }) =>
    api.post('/users', data),
  update: (
    id: string,
    data: { name?: string; email?: string; password?: string }
  ) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
