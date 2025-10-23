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
    
    console.log(`🔐 Tentativa de login - Email: ${email}, IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`);

    // Buscar usuário com empresas vinculadas
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userCompanies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`❌ Login falhou - Usuário não encontrado: ${email}`);
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    if (!user.active) {
      console.log(`❌ Login falhou - Usuário inativo: ${email}`);
      res.status(401).json({ error: 'Usuário inativo' });
      return;
    }

    // Verificar senha
    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      console.log(`❌ Login falhou - Senha inválida: ${email}`);
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Buscar empresas do usuário
    const companies = user.userCompanies.map(uc => ({
      id: uc.company.id,
      code: uc.company.code,
      name: uc.company.name,
      tradeName: uc.company.tradeName,
      isDefault: uc.isDefault,
    }));

    // Se usuário tem apenas uma empresa, gera token direto
    // Se tem múltiplas, retorna lista para seleção
    const hasMultipleCompanies = companies.length > 1;

    let token = null;
    if (!hasMultipleCompanies && companies.length === 1) {
      // Gerar token com empresa única
      token = generateToken({
        userId: user.id,
        role: user.role,
        companyId: companies[0].id,
      });
    }

    console.log(`✅ Login bem-sucedido - Usuário: ${user.name} (${email}) - ${companies.length} empresa(s)`);

    res.json({
      token, // null se tem múltiplas empresas
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      companies,
      requiresCompanySelection: hasMultipleCompanies,
    });
  } catch (error) {
    console.error('❌ Erro no login:', error);
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

/**
 * @swagger
 * /auth/select-company:
 *   post:
 *     summary: Seleciona empresa ativa do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - companyId
 *             properties:
 *               userId:
 *                 type: number
 *               companyId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Empresa selecionada com sucesso
 *       400:
 *         description: Usuário não tem acesso à empresa
 */
export async function selectCompany(req: Request, res: Response): Promise<void> {
  try {
    const { userId, companyId } = req.body;

    console.log(`🏢 Seleção de empresa - Usuário: ${userId}, Empresa: ${companyId}`);

    // Verificar se usuário tem acesso à empresa
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      include: {
        company: true,
        user: true,
      },
    });

    if (!userCompany) {
      console.log(`❌ Usuário ${userId} não tem acesso à empresa ${companyId}`);
      res.status(400).json({ error: 'Usuário não tem acesso a esta empresa' });
      return;
    }

    // Atualizar selectedCompanyId do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { selectedCompanyId: companyId },
    });

    // Gerar token com empresa selecionada
    const tokenPayload = {
      userId: userCompany.user.id,
      role: userCompany.user.role,
      companyId: companyId,
    };
    
    console.log('🔑 [SELECT-COMPANY] Payload do token:', JSON.stringify(tokenPayload));
    
    const token = generateToken(tokenPayload);
    
    console.log('🔑 [SELECT-COMPANY] Token gerado:', token.substring(0, 50) + '...');
    console.log(`✅ Empresa selecionada - Usuário: ${userCompany.user.name}, Empresa: ${userCompany.company.name}`);

    res.json({
      token,
      user: {
        id: userCompany.user.id,
        email: userCompany.user.email,
        name: userCompany.user.name,
        role: userCompany.user.role,
        selectedCompanyId: companyId,
      },
      company: {
        id: userCompany.company.id,
        code: userCompany.company.code,
        name: userCompany.company.name,
        tradeName: userCompany.company.tradeName,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao selecionar empresa:', error);
    res.status(500).json({ error: 'Erro ao selecionar empresa' });
  }
}


