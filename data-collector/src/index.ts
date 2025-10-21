import * as dotenv from 'dotenv';
import { logger } from './utils/logger';
import { ApiClient } from './services/ApiClient';
import { PlcPoolManager } from './services/PlcPoolManager';
import { ProductionMonitor } from './services/ProductionMonitor';
import { HealthCheck } from './services/HealthCheck';

// Carregar variáveis de ambiente
dotenv.config();

// Validar variáveis obrigatórias
const requiredEnvVars = ['BACKEND_API_URL', 'API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`❌ Variável de ambiente ${envVar} não configurada`);
    process.exit(1);
  }
}

// Configurações
const BACKEND_API_URL = process.env.BACKEND_API_URL!;
const API_KEY = process.env.API_KEY!;
const HEALTH_CHECK_PORT = parseInt(process.env.HEALTH_CHECK_PORT || '3002');

// Serviços globais
let apiClient: ApiClient;
let plcPoolManager: PlcPoolManager;
let productionMonitor: ProductionMonitor;
let healthCheck: HealthCheck;

/**
 * Inicializar aplicação
 */
async function initialize(): Promise<void> {
  try {
    logger.info('');
    logger.info('================================================');
    logger.info('  MES DATA COLLECTOR - Iniciando');
    logger.info('================================================');
    logger.info('');

    // 1. Criar API Client
    logger.info('🔗 Inicializando API Client...');
    apiClient = new ApiClient(BACKEND_API_URL, API_KEY);

    // 2. Testar conexão com backend
    logger.info('🏥 Testando conexão com backend...');
    const backendHealthy = await apiClient.checkBackendHealth();
    if (!backendHealthy) {
      logger.warn('⚠️  Backend não está respondendo. Continuando mesmo assim...');
    } else {
      logger.info('✅ Backend está respondendo');
    }

    // 3. Inicializar PLC Pool Manager
    logger.info('🔌 Inicializando PLC Pool Manager...');
    plcPoolManager = new PlcPoolManager(apiClient);
    await plcPoolManager.start();
    logger.info('✅ PLC Pool Manager iniciado');

    // 4. Inicializar Production Monitor
    logger.info('📊 Inicializando Production Monitor...');
    productionMonitor = new ProductionMonitor(apiClient);
    await productionMonitor.start();
    logger.info('✅ Production Monitor iniciado');

    // 5. Inicializar Health Check Server
    logger.info('🏥 Inicializando Health Check Server...');
    healthCheck = new HealthCheck(
      HEALTH_CHECK_PORT,
      apiClient,
      plcPoolManager,
      productionMonitor
    );
    await healthCheck.start();
    logger.info(`✅ Health Check Server rodando na porta ${HEALTH_CHECK_PORT}`);

    logger.info('');
    logger.info('================================================');
    logger.info('  ✅ MES DATA COLLECTOR INICIADO COM SUCESSO');
    logger.info('================================================');
    logger.info('');
    logger.info(`📡 Backend API: ${BACKEND_API_URL}`);
    logger.info(`🏥 Health Check: http://localhost:${HEALTH_CHECK_PORT}/health`);
    logger.info('');
    
  } catch (error: any) {
    logger.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

/**
 * Encerrar aplicação gracefully
 */
async function shutdown(): Promise<void> {
  logger.info('');
  logger.info('⏳ Encerrando Data Collector...');
  
  try {
    // Parar serviços na ordem inversa
    if (healthCheck) {
      await healthCheck.stop();
    }
    
    if (productionMonitor) {
      productionMonitor.stop();
    }
    
    if (plcPoolManager) {
      await plcPoolManager.stop();
    }

    logger.info('✅ Data Collector encerrado com sucesso');
    logger.info('');
    
    process.exit(0);
  } catch (error: any) {
    logger.error('❌ Erro ao encerrar:', error);
    process.exit(1);
  }
}

// Event handlers para encerramento graceful
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handler para erros não tratados
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection:', reason);
  shutdown();
});

// Inicializar aplicação
initialize();
