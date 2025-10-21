/**
 * Controller de autenticação
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autenticação de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    if (!user.active) {
      res.status(401).json({ error: 'Usuário inativo' });
      return;
    }

    // Verificar senha
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login' });
  }
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, SUPERVISOR, OPERATOR]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, name, role = 'OPERATOR' } = req.body;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Gerar token
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
}


