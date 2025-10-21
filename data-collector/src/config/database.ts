/**
 * Configuração do Prisma Client para Data Collector
 */

import { PrismaClient } from '@prisma/client';

// Criar instância única do Prisma Client (singleton)
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['warn', 'error'],
});

/**
 * Conecta ao banco de dados
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

/**
 * Desconecta do banco de dados
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Desconectado do banco de dados');
  } catch (error) {
    console.error('Erro ao desconectar do banco de dados:', error);
  }
}

/**
 * Verifica saúde da conexão com banco
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Erro no health check do banco:', error);
    return false;
  }
}

