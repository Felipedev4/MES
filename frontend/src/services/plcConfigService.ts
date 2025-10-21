/**
 * Serviço para gerenciar configurações de CLP
 */

import api from './api';
import { PlcConfig, PlcRegister } from '../types';

export const plcConfigService = {
  // Listar todas as configurações
  async list(): Promise<PlcConfig[]> {
    const response = await api.get<PlcConfig[]>('/plc-config');
    return response.data;
  },

  // Obter configuração por ID
  async getById(id: number): Promise<PlcConfig> {
    const response = await api.get<PlcConfig>(`/plc-config/${id}`);
    return response.data;
  },

  // Obter configuração ativa
  async getActive(): Promise<PlcConfig | null> {
    const response = await api.get<PlcConfig | null>('/plc-config/active');
    return response.data;
  },

  // Criar nova configuração
  async create(data: Partial<PlcConfig>): Promise<PlcConfig> {
    const response = await api.post<PlcConfig>('/plc-config', data);
    return response.data;
  },

  // Atualizar configuração
  async update(id: number, data: Partial<PlcConfig>): Promise<PlcConfig> {
    const response = await api.put<PlcConfig>(`/plc-config/${id}`, data);
    return response.data;
  },

  // Deletar configuração
  async delete(id: number): Promise<void> {
    await api.delete(`/plc-config/${id}`);
  },

  // Ativar configuração
  async activate(id: number): Promise<PlcConfig> {
    const response = await api.post<PlcConfig>(`/plc-config/${id}/activate`);
    return response.data;
  },

  // Testar conexão
  async testConnection(data: {
    host: string;
    port: number;
    unitId: number;
    timeout: number;
  }): Promise<{ success: boolean; message: string; latency?: number }> {
    const response = await api.post('/plc-config/test-connection', data);
    return response.data;
  },

  // Criar registro
  async createRegister(data: Partial<PlcRegister>): Promise<PlcRegister> {
    const response = await api.post<PlcRegister>('/plc-config/registers', data);
    return response.data;
  },

  // Atualizar registro
  async updateRegister(id: number, data: Partial<PlcRegister>): Promise<PlcRegister> {
    const response = await api.put<PlcRegister>(`/plc-config/registers/${id}`, data);
    return response.data;
  },

  // Deletar registro
  async deleteRegister(id: number): Promise<void> {
    await api.delete(`/plc-config/registers/${id}`);
  },
};


