/**
 * Middleware de autenticação JWT
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

/**
 * Middleware para verificar token JWT
 */
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'default_secret_key';
    const decoded = jwt.verify(token, secret) as { userId: number; role: string };
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido ou expirado' });
    return;
  }
}

/**
 * Middleware para verificar role do usuário
 */
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({ error: 'Acesso negado. Permissões insuficientes.' });
      return;
    }

    next();
  };
}


