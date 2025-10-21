/**
 * Serviço de autenticação
 */

import api from './api';
import { AuthResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    
    // Salvar token e usuário no localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  register: async (email: string, password: string, name: string, role: string = 'OPERATOR'): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { 
      email, 
      password, 
      name, 
      role 
    });
    
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};


