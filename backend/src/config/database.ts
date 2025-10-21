/**
 * Configuração do Prisma Client para acesso ao banco de dados
 */

import { PrismaClient } from '@prisma/client';

/**
 * Instância global do Prisma Client
 * Utiliza singleton pattern para evitar múltiplas conexões em desenvolvimento
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Conecta ao banco de dados
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Desconecta do banco de dados
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}


