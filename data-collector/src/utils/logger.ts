/**
 * Sistema de logs com Winston
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Criar diretório de logs se não existir
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato customizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// Configurar transportes
const transports: winston.transport[] = [
  // Console
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
  }),
];

// Adicionar arquivo apenas em produção
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
    })
  );
}

// Criar logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
});

/**
 * Log de conexão com CLP
 */
export function logPlcConnection(plcName: string, host: string, port: number): void {
  logger.info(`🔌 Conectando ao CLP "${plcName}" em ${host}:${port}`);
}

/**
 * Log de desconexão com CLP
 */
export function logPlcDisconnection(plcName: string, reason?: string): void {
  const msg = reason 
    ? `🔌 Desconectado do CLP "${plcName}" - Motivo: ${reason}`
    : `🔌 Desconectado do CLP "${plcName}"`;
  logger.warn(msg);
}

/**
 * Log de erro de conexão
 */
export function logPlcError(plcName: string, error: Error): void {
  logger.error(`❌ Erro no CLP "${plcName}": ${error.message}`, { stack: error.stack });
}

/**
 * Log de valor lido
 */
export function logRegisterRead(
  plcName: string, 
  registerName: string, 
  value: number, 
  changed: boolean
): void {
  if (changed) {
    logger.info(`📊 [${plcName}] ${registerName} = ${value} (alterado)`);
  } else {
    logger.debug(`📊 [${plcName}] ${registerName} = ${value}`);
  }
}

/**
 * Log de apontamento criado
 */
export function logAppointmentCreated(
  orderNumber: string, 
  quantity: number, 
  total: number
): void {
  logger.info(`✅ Apontamento criado - OP: ${orderNumber}, Qtd: ${quantity}, Total: ${total}`);
}

