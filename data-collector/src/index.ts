/**
 * MES Data Collector Service - Entry Point
 * 
 * Serviço independente para coleta de dados de CLPs via Modbus TCP
 * Roda no Raspberry Pi 5 e se comunica com banco de dados PostgreSQL
 */

import dotenv from 'dotenv';
import express from 'express';
import { connectDatabase, disconnectDatabase } from './config/database';
import { PlcPoolManager } from './services/PlcPoolManager';
import { ProductionMonitor } from './services/ProductionMonitor';
import { getHealthStatus } from './services/HealthCheck';
import { logger } from './utils/logger';

// Carregar variáveis de ambiente
dotenv.config();

// Instâncias dos serviços
const plcPoolManager = new PlcPoolManager();
const productionMonitor = new ProductionMonitor();

// Express app para health check
const app = express();
const PORT = process.env.PORT || 3001;

/**
 * Endpoint de health check
 */
app.get('/health', async (req, res) => {
  try {
    const health = await getHealthStatus(plcPoolManager);
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Erro no health check:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar saúde do sistema',
    });
  }
});

/**
 * Endpoint de status resumido
 */
app.get('/status', (req, res) => {
  const status = plcPoolManager.getStatus();
  res.json({
    uptime: process.uptime(),
    plcs: {
      total: status.total,
      connected: status.connected,
      disconnected: status.disconnected,
    },
  });
});

/**
 * Inicializa a aplicação
 */
async function initialize() {
  try {
    logger.info('╔════════════════════════════════════════╗');
    logger.info('║   MES Data Collector Service v1.0.0   ║');
    logger.info('╚════════════════════════════════════════╝');
    logger.info('');

    // 1. Conectar ao banco de dados
    await connectDatabase();

    // 2. Inicializar Pool Manager de CLPs
    await plcPoolManager.initialize();

    // 3. Conectar eventos do Pool Manager ao Production Monitor
    plcPoolManager.on('registerValueChanged', async (data) => {
      await productionMonitor.handleValueChange(data);
    });

    // 4. Iniciar servidor HTTP (health check)
    if (process.env.ENABLE_HEALTH_CHECK !== 'false') {
      app.listen(PORT, () => {
        logger.info(`🌐 Health check disponível em http://localhost:${PORT}/health`);
      });
    }

    logger.info('');
    logger.info('✅ Data Collector inicializado com sucesso!');
    logger.info('');

  } catch (error) {
    logger.error('❌ Erro ao inicializar Data Collector:', error);
    process.exit(1);
  }
}

/**
 * Desliga graciosamente
 */
async function shutdown(signal: string) {
  logger.info('');
  logger.info(`📥 Sinal ${signal} recebido, desligando...`);

  try {
    // Desligar Pool Manager
    await plcPoolManager.shutdown();

    // Desconectar banco de dados
    await disconnectDatabase();

    logger.info('✅ Data Collector desligado com sucesso');
    process.exit(0);
  } catch (error) {
    logger.error('Erro ao desligar:', error);
    process.exit(1);
  }
}

// Tratar sinais de término
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Tratar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Iniciar aplicação
initialize();

