/**
 * Controller para gerenciamento de empresas
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todas as empresas
 */
export async function listCompanies(req: Request, res: Response): Promise<void> {
  try {
    const { active } = req.query;

    const where = active !== undefined ? { active: active === 'true' } : {};

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            sectors: true,
            productionOrders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(companies);
  } catch (error: any) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
}

/**
 * Busca uma empresa por ID
 */
export async function getCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        sectors: {
          where: { active: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            productionOrders: true,
          },
        },
      },
    });

    if (!company) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    res.json(company);
  } catch (error: any) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa' });
  }
}

/**
 * Cria uma nova empresa
 */
export async function createCompany(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;

    // Verificar se código já existe
    const existing = await prisma.company.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      res.status(400).json({ error: 'Código já cadastrado' });
      return;
    }

    // Verificar CNPJ duplicado (se fornecido)
    if (data.cnpj) {
      const existingCnpj = await prisma.company.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (existingCnpj) {
        res.status(400).json({ error: 'CNPJ já cadastrado' });
        return;
      }
    }

    const company = await prisma.company.create({
      data,
    });

    res.status(201).json(company);
  } catch (error: any) {
    console.error('Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
}

/**
 * Atualiza uma empresa
 */
export async function updateCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    // Verificar se empresa existe
    const existing = await prisma.company.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // Verificar código duplicado (se mudou)
    if (data.code && data.code !== existing.code) {
      const duplicateCode = await prisma.company.findUnique({
        where: { code: data.code },
      });

      if (duplicateCode) {
        res.status(400).json({ error: 'Código já cadastrado' });
        return;
      }
    }

    // Verificar CNPJ duplicado (se mudou)
    if (data.cnpj && data.cnpj !== existing.cnpj) {
      const duplicateCnpj = await prisma.company.findUnique({
        where: { cnpj: data.cnpj },
      });

      if (duplicateCnpj) {
        res.status(400).json({ error: 'CNPJ já cadastrado' });
        return;
      }
    }

    const company = await prisma.company.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(company);
  } catch (error: any) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
}

/**
 * Deleta uma empresa
 */
export async function deleteCompany(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se empresa existe
    const existing = await prisma.company.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            sectors: true,
            productionOrders: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }

    // Verificar se tem setores ou ordens
    if (existing._count.sectors > 0 || existing._count.productionOrders > 0) {
      res.status(400).json({
        error: 'Não é possível excluir empresa com setores ou ordens de produção vinculadas',
      });
      return;
    }

    await prisma.company.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Erro ao deletar empresa' });
  }
}

