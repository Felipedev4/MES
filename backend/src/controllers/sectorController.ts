/**
 * Controller para gerenciamento de setores
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todos os setores
 */
export async function listSectors(req: Request, res: Response): Promise<void> {
  try {
    const { active, companyId } = req.query;

    const where: any = {};
    if (active !== undefined) where.active = active === 'true';
    if (companyId) where.companyId = parseInt(companyId as string);

    const sectors = await prisma.sector.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            plcConfigs: true,
            productionOrders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(sectors);
  } catch (error: any) {
    console.error('Erro ao listar setores:', error);
    res.status(500).json({ error: 'Erro ao listar setores' });
  }
}

/**
 * Busca um setor por ID
 */
export async function getSector(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const sector = await prisma.sector.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: true,
        plcConfigs: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            host: true,
            port: true,
            active: true,
          },
        },
        _count: {
          select: {
            productionOrders: true,
          },
        },
      },
    });

    if (!sector) {
      res.status(404).json({ error: 'Setor não encontrado' });
      return;
    }

    res.json(sector);
  } catch (error: any) {
    console.error('Erro ao buscar setor:', error);
    res.status(500).json({ error: 'Erro ao buscar setor' });
  }
}

/**
 * Cria um novo setor
 */
export async function createSector(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;

    // Verificar se código já existe
    const existing = await prisma.sector.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      res.status(400).json({ error: 'Código já cadastrado' });
      return;
    }

    // Verificar se empresa existe
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      res.status(400).json({ error: 'Empresa não encontrada' });
      return;
    }

    const sector = await prisma.sector.create({
      data,
      include: {
        company: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json(sector);
  } catch (error: any) {
    console.error('Erro ao criar setor:', error);
    res.status(500).json({ error: 'Erro ao criar setor' });
  }
}

/**
 * Atualiza um setor
 */
export async function updateSector(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    // Verificar se setor existe
    const existing = await prisma.sector.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Setor não encontrado' });
      return;
    }

    // Verificar código duplicado (se mudou)
    if (data.code && data.code !== existing.code) {
      const duplicateCode = await prisma.sector.findUnique({
        where: { code: data.code },
      });

      if (duplicateCode) {
        res.status(400).json({ error: 'Código já cadastrado' });
        return;
      }
    }

    // Verificar se empresa existe (se mudou)
    if (data.companyId && data.companyId !== existing.companyId) {
      const company = await prisma.company.findUnique({
        where: { id: data.companyId },
      });

      if (!company) {
        res.status(400).json({ error: 'Empresa não encontrada' });
        return;
      }
    }

    const sector = await prisma.sector.update({
      where: { id: parseInt(id) },
      data,
      include: {
        company: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.json(sector);
  } catch (error: any) {
    console.error('Erro ao atualizar setor:', error);
    res.status(500).json({ error: 'Erro ao atualizar setor' });
  }
}

/**
 * Deleta um setor
 */
export async function deleteSector(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se setor existe
    const existing = await prisma.sector.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            plcConfigs: true,
            productionOrders: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Setor não encontrado' });
      return;
    }

    // Verificar se tem CLPs ou ordens
    if (existing._count.plcConfigs > 0 || existing._count.productionOrders > 0) {
      res.status(400).json({
        error: 'Não é possível excluir setor com CLPs ou ordens de produção vinculadas',
      });
      return;
    }

    await prisma.sector.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar setor:', error);
    res.status(500).json({ error: 'Erro ao deletar setor' });
  }
}

