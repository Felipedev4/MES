/**
 * Middleware de tratamento de erros global
 */

import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any;
}

/**
 * Handler global de erros
 */
export function errorHandler(
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  // Log do erro em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { details: err.errors }),
  });
}

/**
 * Handler para rotas não encontradas
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
  });
}


