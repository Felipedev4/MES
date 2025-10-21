/**
 * Utilitários para hash de senhas usando bcrypt
 */

import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Cria hash de uma senha
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha com seu hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}


