/**
 * Controller para gerenciamento de empresas e seleção de empresa
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { generateToken } from '../utils/jwt';

/**
 * Listar todas as empresas
 */
export async function listCompanies(_req: Request, res: Response): Promise<void> {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { name: 'asc' },
    });

    res.json(companies);
  } catch (error) {
    console.error('❌ Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
}

/**
 * Buscar empresa por ID
 */
export async function getCompany(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    res.json(company);
  } catch (error) {
    console.error('❌ Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
}

/**
 * Criar nova empresa
 */
export async function createCompany(req: Request, res: Response): Promise<void> {
  try {
    const { code, name, tradeName, cnpj, address, phone, email, active = true } = req.body;

    const company = await prisma.company.create({
      data: {
        code,
        name,
        tradeName,
        cnpj,
        address,
        phone,
        email,
        active,
      },
    });

    console.log(`✅ Empresa criada: ${company.name}`);

    res.status(201).json(company);
  } catch (error: any) {
    console.error('❌ Erro ao criar empresa:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código ou CNPJ já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  }
}

/**
 * Atualizar empresa
 */
export async function updateCompany(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const { code, name, tradeName, cnpj, address, phone, email, active } = req.body;

    const company = await prisma.company.update({
      where: { id },
      data: {
        code,
        name,
        tradeName,
        cnpj,
        address,
        phone,
        email,
        active,
      },
    });

    console.log(`✅ Empresa atualizada: ${company.name}`);

    res.json(company);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar empresa:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Empresa não encontrada' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Código ou CNPJ já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
  }
}

/**
 * Deletar empresa
 */
export async function deleteCompany(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    await prisma.company.delete({
      where: { id },
    });

    console.log(`✅ Empresa deletada: ID ${id}`);

    res.status(204).send();
  } catch (error: any) {
    console.error('❌ Erro ao deletar empresa:', error);
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Empresa não encontrada' });
    } else {
      res.status(500).json({ error: 'Erro ao deletar empresa' });
    }
  }
}

/**
 * Selecionar empresa após login
 */
export async function selectCompany(req: Request, res: Response): Promise<void> {
  try {
    const { userId, companyId } = req.body;

    console.log(`🏢 Seleção de empresa - Usuário: ${userId}, Empresa: ${companyId}`);

    // Verificar se o usuário tem acesso à empresa
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      include: {
        user: true,
        company: true,
      },
    });

    if (!userCompany) {
      console.log(`❌ Acesso negado - Usuário ${userId} não tem acesso à empresa ${companyId}`);
      res.status(403).json({ error: 'Acesso negado a esta empresa' });
      return;
    }

    // Gerar token com empresa selecionada
    const token = generateToken({
      userId: userCompany.user.id,
      role: userCompany.user.role,
      companyId: userCompany.company.id,
    });

    console.log(`✅ Empresa selecionada - ${userCompany.company.name}`);

    res.json({
      token,
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

/**
 * Listar empresas do usuário
 */
export async function getUserCompanies(req: Request, res: Response): Promise<void> {
  try {
    const userId = parseInt(req.params.userId);

    const userCompanies = await prisma.userCompany.findMany({
      where: { userId },
      include: {
        company: true,
      },
    });

    // Retornar estrutura completa que o frontend espera
    res.json(userCompanies);
  } catch (error) {
    console.error('❌ Erro ao buscar empresas do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
}

/**
 * Vincular usuário a empresa
 */
export async function linkUserToCompany(req: Request, res: Response): Promise<void> {
  try {
    const { userId, companyId, isDefault = false } = req.body;

    // Verificar se já existe o vínculo
    const existing = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ error: 'Usuário já vinculado a esta empresa' });
      return;
    }

    // Se for padrão, remover padrão de outras empresas
    if (isDefault) {
      await prisma.userCompany.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    // Criar vínculo
    const userCompany = await prisma.userCompany.create({
      data: {
        userId,
        companyId,
        isDefault,
      },
      include: {
        company: true,
      },
    });

    console.log(`✅ Usuário ${userId} vinculado à empresa ${userCompany.company.name}`);

    res.status(201).json({
      id: userCompany.id,
      userId: userCompany.userId,
      companyId: userCompany.companyId,
      isDefault: userCompany.isDefault,
      company: {
        id: userCompany.company.id,
        code: userCompany.company.code,
        name: userCompany.company.name,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao vincular usuário à empresa:', error);
    res.status(500).json({ error: 'Erro ao vincular usuário à empresa' });
  }
}

/**
 * Remover vínculo de usuário com empresa
 */
export async function unlinkUserFromCompany(req: Request, res: Response): Promise<void> {
  try {
    const { userId, companyId } = req.params;

    await prisma.userCompany.delete({
      where: {
        userId_companyId: {
          userId: parseInt(userId),
          companyId: parseInt(companyId),
        },
      },
    });

    console.log(`✅ Usuário ${userId} desvinculado da empresa ${companyId}`);

    res.status(204).send();
  } catch (error) {
    console.error('❌ Erro ao desvincular usuário da empresa:', error);
    res.status(500).json({ error: 'Erro ao desvincular usuário da empresa' });
  }
}

/**
 * Definir empresa padrão do usuário
 */
export async function setDefaultCompany(req: Request, res: Response): Promise<void> {
  try {
    const { userId, companyId } = req.body;

    // Remover padrão de todas as empresas
    await prisma.userCompany.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Definir nova padrão
    await prisma.userCompany.update({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
      data: { isDefault: true },
    });

    console.log(`✅ Empresa ${companyId} definida como padrão para usuário ${userId}`);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Erro ao definir empresa padrão:', error);
    res.status(500).json({ error: 'Erro ao definir empresa padrão' });
  }
}
