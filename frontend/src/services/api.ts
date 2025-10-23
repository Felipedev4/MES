/**
 * Configuração e cliente HTTP da API
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@MES:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 [API] Token sendo enviado:', token.substring(0, 50) + '...');
    } else {
      console.warn('⚠️ [API] Token não encontrado no localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token inválido, expirado ou sem permissão
      localStorage.removeItem('@MES:token');
      localStorage.removeItem('@MES:user');
      localStorage.removeItem('@MES:company');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


