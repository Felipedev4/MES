import { logger } from '../utils/logger';
import { ApiClient, PlcConfigResponse } from './ApiClient';
import { PlcConnection } from './PlcConnection';
import { ProductionMonitor } from './ProductionMonitor';

/**
 * Gerencia múltiplas conexões de CLP
 * Busca configurações do backend via API e mantém conexões ativas
 */
export class PlcPoolManager {
  private connections: Map<number, PlcConnection> = new Map();
  private apiClient: ApiClient;
  private productionMonitor: ProductionMonitor | null = null;
  private configPollInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(apiClient: ApiClient, productionMonitor?: ProductionMonitor) {
    this.apiClient = apiClient;
    this.productionMonitor = productionMonitor || null;
  }

  /**
   * Iniciar o gerenciador
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⚠️  PlcPoolManager já está rodando');
      return;
    }

    this.isRunning = true;
    logger.info('🔌 PlcPoolManager: Iniciando...');

    // Carregar configurações iniciais
    await this.loadConfigurations();

    // Iniciar polling de configurações
    const pollInterval = parseInt(process.env.CONFIG_POLL_INTERVAL || '30000');
    
    this.configPollInterval = setInterval(async () => {
      await this.loadConfigurations();
    }, pollInterval);

    logger.info(`🔌 PlcPoolManager: Iniciado (polling a cada ${pollInterval}ms)`);
  }

  /**
   * Parar o gerenciador
   */
  async stop(): Promise<void> {
    logger.info('🔌 PlcPoolManager: Parando...');
    
    this.isRunning = false;

    // Parar polling de configurações
    if (this.configPollInterval) {
      clearInterval(this.configPollInterval);
      this.configPollInterval = null;
    }

    // Desconectar todos os CLPs
    for (const [id, connection] of this.connections.entries()) {
      logger.info(`🔌 Desconectando CLP ${id}...`);
      connection.disconnect();
    }

    this.connections.clear();
    logger.info('🔌 PlcPoolManager: Parado');
  }

  /**
   * Carregar configurações de CLP do backend
   */
  private async loadConfigurations(): Promise<void> {
    try {
      const configs = await this.apiClient.getActivePlcConfigs();
      
      logger.debug(`📥 Recebidas ${configs.length} configurações de CLP ativas`);

      // Processar configurações
      await this.processConfigurations(configs);
      
    } catch (error: any) {
      logger.error('❌ Erro ao carregar configurações:', error.message);
    }
  }

  /**
   * Processar configurações recebidas
   */
  private async processConfigurations(configs: PlcConfigResponse[]): Promise<void> {
    const currentIds = new Set(this.connections.keys());
    const newIds = new Set(configs.map(c => c.id));

    // Remover conexões que não existem mais
    for (const id of currentIds) {
      if (!newIds.has(id)) {
        logger.info(`❌ Removendo CLP ${id} (não está mais ativo)`);
        const connection = this.connections.get(id);
        if (connection) {
          connection.disconnect();
          this.connections.delete(id);
        }
      }
    }

    // Adicionar ou atualizar conexões
    for (const config of configs) {
      const existingConnection = this.connections.get(config.id);

      if (existingConnection) {
        // Verificar se configuração mudou
        if (this.hasConfigChanged(existingConnection, config)) {
          logger.info(`🔄 Atualizando CLP ${config.id}`);
          existingConnection.updateConfig(config);
        }
      } else {
        // Criar nova conexão
        logger.info(`➕ Adicionando CLP ${config.id}: ${config.name}`);
        const connection = new PlcConnection(config, this.apiClient, this.productionMonitor || undefined);
        this.connections.set(config.id, connection);
        await connection.connect();
      }
    }
  }

  /**
   * Verificar se a configuração mudou
   */
  private hasConfigChanged(connection: PlcConnection, newConfig: PlcConfigResponse): boolean {
    const status = connection.getStatus();
    
    return (
      status.host !== newConfig.host ||
      status.port !== newConfig.port ||
      status.registers !== newConfig.registers.filter(r => r.enabled).length
    );
  }

  /**
   * Obter status de todas as conexões
   */
  getStatus(): {
    total: number;
    connected: number;
    disconnected: number;
    connections: Array<{
      id: number;
      name: string;
      connected: boolean;
      host: string;
      port: number;
      registers: number;
    }>;
  } {
    const connections = Array.from(this.connections.values());
    const connected = connections.filter(c => c.getStatus().connected).length;

    return {
      total: connections.length,
      connected,
      disconnected: connections.length - connected,
      connections: connections.map(c => ({
        id: c.getId(),
        name: c.getName(),
        ...c.getStatus(),
      })),
    };
  }

  /**
   * Obter uma conexão específica
   */
  getConnection(id: number): PlcConnection | undefined {
    return this.connections.get(id);
  }

  /**
   * Forçar recarregamento de configurações
   */
  async reloadConfigurations(): Promise<void> {
    logger.info('🔄 Recarregando configurações manualmente...');
    await this.loadConfigurations();
  }

  /**
   * Testar conexão com um PLC (sem adicionar à pool)
   */
  async testConnection(config: {
    host: string;
    port: number;
    unitId: number;
    timeout: number;
  }): Promise<{
    success: boolean;
    message: string;
    latency?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Criar configuração temporária
      const tempConfig: PlcConfigResponse = {
        id: -1, // ID temporário
        name: 'Teste de Conexão',
        host: config.host,
        port: config.port,
        unitId: config.unitId,
        timeout: config.timeout,
        pollingInterval: 1000,
        reconnectInterval: 5000,
        timeDivisor: 1,
        active: true,
        registers: [],
      };

      // ✅ Criar conexão temporária SEM reconexão automática
      const tempConnection = new PlcConnection(tempConfig, this.apiClient, undefined, false);
      
      // Tentar conectar
      const connected = await tempConnection.connect();
      
      const latency = Date.now() - startTime;
      
      // Desconectar imediatamente
      tempConnection.disconnect();
      
      if (connected) {
        logger.info(`✅ Teste de conexão bem-sucedido: ${config.host}:${config.port} (${latency}ms)`);
        return {
          success: true,
          message: `Conexão estabelecida com sucesso (Latência: ${latency}ms)`,
          latency,
        };
      } else {
        logger.warn(`⚠️  Teste de conexão falhou: ${config.host}:${config.port}`);
        return {
          success: false,
          message: 'Não foi possível conectar ao PLC',
          error: 'Timeout ou recusa de conexão',
        };
      }
    } catch (error: any) {
      const latency = Date.now() - startTime;
      logger.error(`❌ Erro no teste de conexão: ${error.message}`);
      
      return {
        success: false,
        message: 'Erro ao testar conexão',
        latency,
        error: error.message || 'Erro desconhecido',
      };
    }
  }
}
