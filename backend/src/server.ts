/**
 * Servidor principal da aplicação MES
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Server as SocketServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

// Configuração
dotenv.config();

// Database
import { connectDatabase, disconnectDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import rolePermissionRoutes from './routes/rolePermissionRoutes';
import itemRoutes from './routes/itemRoutes';
import moldRoutes from './routes/moldRoutes';
import productionOrderRoutes from './routes/productionOrderRoutes';
import downtimeRoutes from './routes/downtimeRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import productionRoutes from './routes/productionRoutes';
import plcConfigRoutes from './routes/plcConfigRoutes';
import companyRoutes from './routes/companyRoutes';
import sectorRoutes from './routes/sectorRoutes';
import activityTypeRoutes from './routes/activityTypeRoutes';
import defectRoutes from './routes/defectRoutes';
import productionDefectRoutes from './routes/productionDefectRoutes';
import referenceTypeRoutes from './routes/referenceTypeRoutes';
import dataCollectorRoutes from './routes/dataCollectorRoutes';
import cycleChangeRoutes from './routes/cycleChangeRoutes';
import colorRoutes from './routes/colorRoutes';
import emailConfigRoutes from './routes/emailConfigRoutes';
import maintenanceAlertRoutes from './routes/maintenanceAlertRoutes';
import reportsRoutes from './routes/reports';
import shiftsRoutes from './routes/shifts';

// Services
import { modbusService } from './services/modbusService';
import { productionService } from './services/productionService';

// Schedulers
import { startMaintenanceAlertScheduler, stopMaintenanceAlertScheduler } from './schedulers/maintenanceAlertScheduler';

// Criar aplicação Express
const app: Application = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
const ENABLE_HTTPS = process.env.ENABLE_HTTPS === 'true';

// Criar servidor HTTP
const httpServer = createServer(app);

// Criar servidor HTTPS (se habilitado)
let httpsServer: any = null;
if (ENABLE_HTTPS) {
  try {
    const certPath = join(__dirname, '..', 'ssl', 'cert.pem');
    const keyPath = join(__dirname, '..', 'ssl', 'key.pem');
    
    const httpsOptions = {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath)
    };
    
    httpsServer = createHttpsServer(httpsOptions, app);
    console.log('🔐 HTTPS habilitado');
  } catch (error) {
    console.warn('⚠️  Certificados SSL não encontrados. HTTPS desabilitado.');
    console.warn('   Execute: npm run generate-ssl');
  }
}

// Configurar Socket.io com CORS permissivo para dispositivos móveis
const socketCorsOptions = process.env.FRONTEND_URL === '*'
  ? {
      origin: true, // Permite qualquer origem
      methods: ['GET', 'POST'],
      credentials: true,
    }
  : {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    };

// Usar servidor HTTPS para Socket.IO se disponível, senão HTTP
const io = new SocketServer(httpsServer || httpServer, {
  cors: socketCorsOptions,
});

// Middlewares de segurança
app.use(helmet());

// Configuração de CORS para permitir acesso de dispositivos móveis
const corsOptions = process.env.FRONTEND_URL === '*' 
  ? { 
      origin: true, // Permite qualquer origem
      credentials: true,
    }
  : {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    };

app.use(cors(corsOptions));

// Rate limiting (configuração mais permissiva para desenvolvimento)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // máximo de 1000 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MES API Documentation',
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    service: 'MES API',
    version: '1.0.0',
    modbus: {
      connected: modbusService.isConnected(),
      lastValue: modbusService.getLastValue(),
    },
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permissions', rolePermissionRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/molds', moldRoutes);
app.use('/api/production-orders', productionOrderRoutes);
app.use('/api/downtimes', downtimeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/plc-config', plcConfigRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/activity-types', activityTypeRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/production-defects', productionDefectRoutes);
app.use('/api/reference-types', referenceTypeRoutes);
app.use('/api/data-collector', dataCollectorRoutes);
app.use('/api/cycle-changes', cycleChangeRoutes);
app.use('/api/colors', colorRoutes);
app.use('/api/email-configs', emailConfigRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/shifts', shiftsRoutes);
app.use('/api/maintenance-alerts', maintenanceAlertRoutes);

// Handler de rotas não encontradas
app.use(notFoundHandler);

// Handler de erros
app.use(errorHandler);

// Configurar Socket.io
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });

  // Enviar status do CLP quando solicitado
  socket.on('plc:getStatus', () => {
    socket.emit('plc:status', {
      connected: modbusService.isConnected(),
      lastValue: modbusService.getLastValue(),
      timestamp: new Date(),
    });
  });
});

// Eventos do Modbus para WebSocket
modbusService.on('connected', () => {
  io.emit('plc:connected', { timestamp: new Date() });
});

modbusService.on('disconnected', () => {
  io.emit('plc:disconnected', { timestamp: new Date() });
});

modbusService.on('error', (error) => {
  io.emit('plc:error', { error: error.message, timestamp: new Date() });
});

modbusService.on('valueChanged', (data) => {
  io.emit('plc:valueChanged', { ...data, timestamp: new Date() });
});

/**
 * Inicializar servidor
 */
async function startServer(): Promise<void> {
  try {
    // Conectar ao banco de dados
    await connectDatabase();

    // Inicializar serviço de produção com Socket.io
    productionService.initialize(io);

    // Iniciar scheduler de alertas de manutenção
    startMaintenanceAlertScheduler();

    // Inicializar e conectar ao CLP Modbus (não bloquear se falhar)
    // ATENÇÃO: Desabilitar quando usar Data Collector externo (Raspberry Pi)
    const useExternalDataCollector = process.env.USE_EXTERNAL_DATA_COLLECTOR === 'true';
    
    if (!useExternalDataCollector) {
      try {
        await modbusService.initialize();
      } catch (error) {
        console.warn('⚠️  CLP não conectado no início. Tentará reconectar automaticamente.');
      }
    } else {
      console.log('📡 Modbus interno DESABILITADO - usando Data Collector externo');
    }

    // Iniciar servidor HTTP
    httpServer.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`   Servidor MES iniciado com sucesso!`);
      console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   HTTP: http://localhost:${PORT}`);
      console.log(`   Documentação: http://localhost:${PORT}/api-docs`);
      console.log(`   WebSocket: http://localhost:${PORT}`);
      if (ENABLE_HTTPS && httpsServer) {
        console.log(`   HTTPS: https://localhost:${HTTPS_PORT} 🔐`);
        console.log(`   WebSocket (Secure): wss://localhost:${HTTPS_PORT}`);
      }
      console.log('========================================\n');
    });

    // Iniciar servidor HTTPS (se habilitado)
    if (ENABLE_HTTPS && httpsServer) {
      httpsServer.listen(HTTPS_PORT, () => {
        console.log(`🔐 Servidor HTTPS ativo na porta ${HTTPS_PORT}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown(): Promise<void> {
  console.log('\n⏳ Encerrando servidor...');
  
  // Parar scheduler de alertas
  stopMaintenanceAlertScheduler();
  
  // Parar polling do Modbus
  modbusService.disconnect();
  
  // Desconectar do banco de dados
  await disconnectDatabase();
  
  // Fechar servidor HTTPS (se ativo)
  if (httpsServer) {
    httpsServer.close(() => {
      console.log('🔐 Servidor HTTPS encerrado');
    });
  }
  
  // Fechar servidor HTTP
  httpServer.close(() => {
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.error('⚠️  Forçando encerramento...');
    process.exit(1);
  }, 10000);
}

// Capturar sinais de encerramento
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Capturar erros não tratados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown();
});

// Iniciar servidor
startServer();

export { app, io };


