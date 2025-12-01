import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.endsWith('/api/login')) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
      toast.error('Sua sessão expirou. Por favor, faça login novamente.');
    }
    
    return Promise.reject(error);
  }
);

export default api;