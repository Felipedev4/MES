import axios, { AxiosInstance, AxiosError } from 'axios';
import { logger } from '../utils/logger';

export interface PlcConfigResponse {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  sectorId?: number | null;
  active: boolean;
  registers: PlcRegisterResponse[];
}

export interface PlcRegisterResponse {
  id: number;
  plcConfigId: number;
  registerName: string;
  registerAddress: number;
  description?: string | null;
  dataType: string;
  enabled: boolean;
}

export interface PlcDataPayload {
  plcRegisterId: number;
  registerAddress: number;
  registerName: string;
  value: number;
  timestamp: Date;
  connected: boolean;
  errorMessage?: string | null;
}

export interface ProductionOrderResponse {
  id: number;
  orderNumber: string;
  itemId: number;
  status: string;
  producedQuantity: number;
}

export interface ProductionAppointmentPayload {
  productionOrderId: number;
  quantity: number;
  timestamp: Date;
  plcDataId?: number | null;
}

/**
 * Cliente HTTP para comunicação com o Backend API
 */
export class ApiClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.apiKey = apiKey;
    
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey, // Autenticação via API Key
      },
    });

    // Interceptor para log de erros
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        logger.error('API Request Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });
        throw error;
      }
    );

    logger.info(`🔗 API Client configurado: ${baseURL}`);
  }

  /**
   * Buscar todas as configurações de CLP ativas
   */
  async getActivePlcConfigs(): Promise<PlcConfigResponse[]> {
    try {
      const response = await this.client.get<PlcConfigResponse[]>('/api/data-collector/plc-configs');
      logger.debug(`📥 Recebidas ${response.data.length} configurações de CLP`);
      return response.data;
    } catch (error) {
      logger.error('❌ Erro ao buscar configurações de CLP:', error);
      return [];
    }
  }

  /**
   * Buscar uma configuração de CLP específica
   */
  async getPlcConfig(id: number): Promise<PlcConfigResponse | null> {
    try {
      const response = await this.client.get<PlcConfigResponse>(`/api/data-collector/plc-configs/${id}`);
      return response.data;
    } catch (error) {
      logger.error(`❌ Erro ao buscar configuração CLP ${id}:`, error);
      return null;
    }
  }

  /**
   * Enviar dados coletados do CLP para o backend
   */
  async sendPlcData(data: PlcDataPayload): Promise<boolean> {
    try {
      await this.client.post('/api/data-collector/plc-data', data);
      logger.debug(`📤 Dados enviados: ${data.registerName} = ${data.value}`);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar dados do CLP:', error);
      return false;
    }
  }

  /**
   * Enviar múltiplos dados de uma vez (batch)
   */
  async sendPlcDataBatch(dataArray: PlcDataPayload[]): Promise<boolean> {
    try {
      await this.client.post('/api/data-collector/plc-data/batch', { data: dataArray });
      logger.debug(`📤 Batch enviado: ${dataArray.length} registros`);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar batch de dados:', error);
      return false;
    }
  }

  /**
   * Buscar ordens de produção ativas
   */
  async getActiveProductionOrders(): Promise<ProductionOrderResponse[]> {
    try {
      const response = await this.client.get<ProductionOrderResponse[]>('/api/data-collector/production-orders/active');
      logger.debug(`📥 Recebidas ${response.data.length} ordens de produção ativas`);
      return response.data;
    } catch (error) {
      logger.error('❌ Erro ao buscar ordens de produção:', error);
      return [];
    }
  }

  /**
   * Enviar apontamento de produção
   */
  async sendProductionAppointment(appointment: ProductionAppointmentPayload): Promise<boolean> {
    try {
      await this.client.post('/api/data-collector/production-appointments', appointment);
      logger.info(`✅ Apontamento enviado: OP ${appointment.productionOrderId} - ${appointment.quantity} peças`);
      return true;
    } catch (error) {
      logger.error('❌ Erro ao enviar apontamento de produção:', error);
      return false;
    }
  }

  /**
   * Health check do backend
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.warn('⚠️  Backend não está respondendo');
      return false;
    }
  }
}

