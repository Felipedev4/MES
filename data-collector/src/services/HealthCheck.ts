import express, { Application } from 'express';
import { Server } from 'http';
import { logger } from '../utils/logger';
import { ApiClient } from './ApiClient';
import { PlcPoolManager } from './PlcPoolManager';
import { ProductionMonitor } from './ProductionMonitor';

/**
 * Servidor HTTP simples para health check
 */
export class HealthCheck {
  private app: Application;
  private server: Server | null = null;
  private port: number;
  private apiClient: ApiClient;
  private plcPoolManager: PlcPoolManager;
  private productionMonitor: ProductionMonitor;
  private startTime: Date;

  constructor(
    port: number,
    apiClient: ApiClient,
    plcPoolManager: PlcPoolManager,
    productionMonitor: ProductionMonitor
  ) {
    this.port = port;
    this.apiClient = apiClient;
    this.plcPoolManager = plcPoolManager;
    this.productionMonitor = productionMonitor;
    this.startTime = new Date();
    this.app = express();

    this.setupRoutes();
  }

  /**
   * Configurar rotas
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      try {
        const plcStatus = this.plcPoolManager.getStatus();
        const productionStats = this.productionMonitor.getStats();
        const backendHealthy = await this.apiClient.checkBackendHealth();

        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
          backend: {
            connected: backendHealthy,
            url: process.env.BACKEND_API_URL,
          },
          plcs: {
            total: plcStatus.total,
            connected: plcStatus.connected,
            disconnected: plcStatus.disconnected,
            connections: plcStatus.connections.map(c => ({
              id: c.id,
              name: c.name,
              connected: c.connected,
              host: c.host,
              port: c.port,
              registers: c.registers,
            })),
          },
          production: {
            activeOrders: productionStats.totalActiveOrders,
            orders: productionStats.orders,
          },
        };

        res.json(health);
      } catch (error: any) {
        logger.error('❌ Erro no health check:', error);
        res.status(500).json({
          status: 'unhealthy',
          error: error.message,
        });
      }
    });

    // Status simplificado
    this.app.get('/status', (req, res) => {
      const plcStatus = this.plcPoolManager.getStatus();
      
      res.json({
        status: plcStatus.connected > 0 ? 'online' : 'offline',
        plcs: {
          total: plcStatus.total,
          connected: plcStatus.connected,
        },
        uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
      });
    });

    // Endpoint para forçar reload de configurações
    this.app.post('/reload', async (req, res) => {
      try {
        logger.info('🔄 Recarregando configurações (via API)...');
        await this.plcPoolManager.reloadConfigurations();
        res.json({ success: true, message: 'Configurações recarregadas' });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        service: 'MES Data Collector',
        version: '2.0.0',
        endpoints: {
          health: '/health',
          status: '/status',
          reload: 'POST /reload',
        },
      });
    });
  }

  /**
   * Iniciar servidor
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          logger.info(`🏥 Health Check server rodando na porta ${this.port}`);
          resolve();
        });

        this.server.on('error', (error) => {
          logger.error('❌ Erro no servidor Health Check:', error);
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Parar servidor
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          logger.info('🏥 Health Check server encerrado');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
