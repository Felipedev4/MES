/**
 * Middleware para filtrar dados por empresa
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
    companyId?: number;
  };
}

/**
 * Middleware que adiciona companyId do usuário autenticado à request
 */
export function injectCompanyId(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      companyId: decoded.companyId,
    };

    next();
  } catch (error) {
    // Se falhar ao decodificar, apenas passa adiante
    next();
  }
}

/**
 * Middleware que exige que o usuário tenha uma empresa selecionada
 */
export function requireCompany(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user?.companyId) {
    res.status(403).json({ 
      error: 'É necessário selecionar uma empresa para acessar este recurso',
      requiresCompanySelection: true,
    });
    return;
  }
  
  next();
}

/**
 * Helper para adicionar filtro de empresa nas queries do Prisma
 */
export function getCompanyFilter(req: AuthenticatedRequest, allowNull: boolean = false): any {
  if (!req.user?.companyId) {
    return allowNull ? {} : { companyId: null };
  }
  
  return { companyId: req.user.companyId };
}

