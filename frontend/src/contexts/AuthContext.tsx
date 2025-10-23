/**
 * Contexto de autenticação
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginResponse, Company } from '../types';
import { authService } from '../services/authService';

interface AuthContextData {
  user: User | null;
  selectedCompany: Company | null;
  companies: Company[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  selectCompany: (companyId: number) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário e empresa do localStorage
    const storedUser = authService.getCurrentUser();
    const storedCompany = localStorage.getItem('@MES:company');
    const storedToken = localStorage.getItem('@MES:token');
    
    if (storedUser && storedToken) {
      setUser(storedUser);
      
      if (storedCompany) {
        try {
          setSelectedCompany(JSON.parse(storedCompany));
        } catch (error) {
          console.error('Erro ao parse da empresa:', error);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await authService.login(email, password);
    setUser(response.user);
    setCompanies(response.companies);
    
    // Se tem token (usuário com apenas 1 empresa), salvar empresa
    if (response.token && response.companies.length === 1) {
      const company = response.companies[0];
      setSelectedCompany(company);
      localStorage.setItem('@MES:company', JSON.stringify(company));
    }
    
    return response;
  };

  const selectCompany = async (companyId: number): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const response = await authService.selectCompany(user.id, companyId);
    
    // Salvar token, usuário e empresa
    localStorage.setItem('@MES:token', response.token);
    localStorage.setItem('@MES:user', JSON.stringify(response.user));
    localStorage.setItem('@MES:company', JSON.stringify(response.company));
    
    // Atualizar estados do React
    setUser(response.user);
    setSelectedCompany(response.company);
    
    console.log('🏢 [AuthContext] Empresa selecionada:', response.company.name);
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('@MES:company');
    setUser(null);
    setSelectedCompany(null);
    setCompanies([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        selectedCompany,
        companies,
        isAuthenticated: !!user,
        isLoading,
        login,
        selectCompany,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


