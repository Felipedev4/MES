/**
 * Health check service
 */

import { checkDatabaseHealth } from '../config/database';
import { PlcPoolManager } from './PlcPoolManager';

/**
 * Verifica saúde geral do sistema
 */
export async function getHealthStatus(poolManager: PlcPoolManager) {
  const dbHealthy = await checkDatabaseHealth();
  const plcStatus = poolManager.getStatus();
  
  const healthy = dbHealthy && plcStatus.connected > 0;

  return {
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbHealthy,
    },
    plcs: {
      total: plcStatus.total,
      connected: plcStatus.connected,
      disconnected: plcStatus.disconnected,
      details: plcStatus.connections,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
  };
}

