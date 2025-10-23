/**
 * Middleware de autenticação
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    companyId?: number;
  };
}

/**
 * Middleware para autenticar requisições via token JWT
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    console.log('🔓 [AUTH MIDDLEWARE] Token decodificado:', JSON.stringify(decoded));
    req.user = decoded;
    console.log('🔓 [AUTH MIDDLEWARE] req.user após atribuição:', JSON.stringify(req.user));
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error);
    res.status(403).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * Middleware para verificar se o usuário tem uma empresa selecionada
 */
export function requireCompany(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user?.companyId) {
    res.status(403).json({ error: 'Empresa não selecionada. Selecione uma empresa primeiro.' });
    return;
  }
  next();
}

/**
 * Middleware para verificar role mínima
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permissão negada' });
      return;
    }

    next();
  };
}
