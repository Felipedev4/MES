/**
 * Utilitários para geração e verificação de JWT
 */

import jwt, { SignOptions } from 'jsonwebtoken';

interface JwtPayload {
  userId: number;
  role: string;
}

/**
 * Gera um token JWT
 */
export function generateToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '8h') as string;

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET || 'default_secret_key';
  return jwt.verify(token, secret) as JwtPayload;
}


