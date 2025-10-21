/**
 * Gerencia pool de conexões com múltiplos CLPs
 */

import { EventEmitter } from 'events';
import { prisma } from '../config/database';
import { PlcConnection } from './PlcConnection';
import { logger } from '../utils/logger';

interface PlcConfigData {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  sectorId: number | null;
  active: boolean;
  registers: Array<{
    id: number;
    registerName: string;
    registerAddress: number;
    description: string | null;
    dataType: string;
    enabled: boolean;
  }>;
}

/**
 * Gerenciador de pool de conexões com CLPs
 */
export class PlcPoolManager extends EventEmitter {
  private connections: Map<number, PlcConnection> = new Map();
  private configReloadInterval: NodeJS.Timeout | null = null;
  private lastConfigUpdate: Date = new Date(0);

  constructor() {
    super();
  }

  /**
   * Inicializa o pool manager
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('🚀 Inicializando Pool Manager de CLPs...');

      // Carregar configurações ativas do banco
      await this.loadConfigurations();

      // Agendar reload periódico de configurações
      this.scheduleConfigReload();

      logger.info(`✅ Pool Manager inicializado com ${this.connections.size} CLP(s)`);
    } catch (error) {
      logger.error('❌ Erro ao inicializar Pool Manager:', error);
      throw error;
    }
  }

  /**
   * Carrega configurações do banco de dados
   */
  public async loadConfigurations(): Promise<void> {
    try {
      const configs = await prisma.plcConfig.findMany({
        where: { active: true },
        include: {
          registers: {
            where: { enabled: true },
            orderBy: { registerAddress: 'asc' },
          },
        },
      });

      if (configs.length === 0) {
        logger.warn('⚠️ Nenhuma configuração de CLP ativa encontrada no banco de dados');
        return;
      }

      logger.info(`📋 ${configs.length} configuração(ões) de CLP encontrada(s)`);

      // Processar cada configuração
      for (const config of configs) {
        await this.processConfiguration(config);
      }

      // Remover conexões de CLPs que foram desativados
      await this.removeInactiveConnections(configs.map(c => c.id));
      
    } catch (error) {
      logger.error('Erro ao carregar configurações:', error);
      throw error;
    }
  }

  /**
   * Processa uma configuração (criar ou atualizar conexão)
   */
  private async processConfiguration(config: any): Promise<void> {
    const existingConnection = this.connections.get(config.id);

    if (existingConnection) {
      // Atualizar conexão existente
      existingConnection.updateConfig(config);
      logger.info(`🔄 Configuração do CLP "${config.name}" atualizada`);
    } else {
      // Criar nova conexão
      const connection = new PlcConnection(config);
      
      // Escutar eventos
      connection.on('connected', (cfg) => {
        this.emit('plcConnected', cfg);
      });

      connection.on('disconnected', (cfg) => {
        this.emit('plcDisconnected', cfg);
      });

      connection.on('error', (data) => {
        this.emit('plcError', data);
      });

      connection.on('valueChanged', (data) => {
        // Repassar evento para ProductionMonitor
        this.emit('registerValueChanged', data);
      });

      // Adicionar ao pool
      this.connections.set(config.id, connection);
      
      // Conectar
      try {
        await connection.connect();
      } catch (error) {
        logger.error(`Erro ao conectar CLP "${config.name}":`, error);
      }
    }
  }

  /**
   * Remove conexões de CLPs inativos
   */
  private async removeInactiveConnections(activeIds: number[]): Promise<void> {
    const currentIds = Array.from(this.connections.keys());
    
    for (const id of currentIds) {
      if (!activeIds.includes(id)) {
        const connection = this.connections.get(id);
        if (connection) {
          connection.disconnect();
          this.connections.delete(id);
          logger.info(`🗑️ Conexão com CLP ID ${id} removida (inativo)`);
        }
      }
    }
  }

  /**
   * Recarrega configurações periodicamente
   */
  private scheduleConfigReload(): void {
    const interval = parseInt(process.env.CONFIG_RELOAD_INTERVAL || '30000');
    
    this.configReloadInterval = setInterval(async () => {
      try {
        // Verificar se houve mudanças
        const latestUpdate = await prisma.plcConfig.findFirst({
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true },
        });

        if (latestUpdate && latestUpdate.updatedAt > this.lastConfigUpdate) {
          logger.info('🔄 Configurações alteradas, recarregando...');
          await this.loadConfigurations();
          this.lastConfigUpdate = latestUpdate.updatedAt;
        }
      } catch (error) {
        logger.error('Erro ao verificar atualizações de configuração:', error);
      }
    }, interval);

    logger.info(`⏱️ Verificação de configurações agendada a cada ${interval / 1000}s`);
  }

  /**
   * Obtém status de todas as conexões
   */
  public getStatus() {
    const connections = Array.from(this.connections.values()).map(conn => conn.getStatus());
    
    return {
      total: connections.length,
      connected: connections.filter(c => c.connected).length,
      disconnected: connections.filter(c => !c.connected).length,
      connections,
    };
  }

  /**
   * Desliga o pool manager
   */
  public async shutdown(): Promise<void> {
    logger.info('🛑 Desligando Pool Manager...');

    // Parar reload de configurações
    if (this.configReloadInterval) {
      clearInterval(this.configReloadInterval);
      this.configReloadInterval = null;
    }

    // Desconectar todos os CLPs
    for (const connection of this.connections.values()) {
      connection.disconnect();
    }

    this.connections.clear();
    logger.info('✅ Pool Manager desligado');
  }
}

