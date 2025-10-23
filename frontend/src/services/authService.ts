/**
 * Serviço de autenticação
 */

import api from './api';
import { AuthResponse, LoginResponse, Company, User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    
    // Salvar usuário no localStorage
    localStorage.setItem('@MES:user', JSON.stringify(response.data.user));
    
    // Se tem token (usuário com apenas 1 empresa), salvar
    if (response.data.token) {
      localStorage.setItem('@MES:token', response.data.token);
    }
    
    return response.data;
  },

  selectCompany: async (userId: number, companyId: number): Promise<{ token: string; user: User; company: Company }> => {
    const response = await api.post<{ token: string; user: User; company: Company }>('/auth/select-company', {
      userId,
      companyId,
    });
    return response.data;
  },

  register: async (email: string, password: string, name: string, role: string = 'OPERATOR'): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { 
      email, 
      password, 
      name, 
      role 
    });
    
    localStorage.setItem('@MES:token', response.data.token);
    localStorage.setItem('@MES:user', JSON.stringify(response.data.user));
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('@MES:token');
    localStorage.removeItem('@MES:user');
    localStorage.removeItem('@MES:company');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('@MES:user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('@MES:token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('@MES:token');
  },
};


