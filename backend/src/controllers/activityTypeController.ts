/**
 * Controller para gerenciamento de tipos de atividade
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todos os tipos de atividade
 */
export async function listActivityTypes(req: Request, res: Response): Promise<void> {
  try {
    const { active } = req.query;

    const where = active !== undefined ? { active: active === 'true' } : {};

    const activityTypes = await prisma.activityType.findMany({
      where,
      include: {
        _count: {
          select: {
            downtimes: true,
          },
        },
        activityTypeSectors: {
          include: {
            sector: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(activityTypes);
  } catch (error: any) {
    console.error('Erro ao listar tipos de atividade:', error);
    res.status(500).json({ error: 'Erro ao listar tipos de atividade' });
  }
}

/**
 * Busca um tipo de atividade por ID
 */
export async function getActivityType(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const activityType = await prisma.activityType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            downtimes: true,
          },
        },
      },
    });

    if (!activityType) {
      res.status(404).json({ error: 'Tipo de atividade não encontrado' });
      return;
    }

    res.json(activityType);
  } catch (error: any) {
    console.error('Erro ao buscar tipo de atividade:', error);
    res.status(500).json({ error: 'Erro ao buscar tipo de atividade' });
  }
}

/**
 * Cria um novo tipo de atividade
 */
export async function createActivityType(req: Request, res: Response): Promise<void> {
  try {
    const { sectorIds, ...data } = req.body;

    // Verificar se código já existe
    const existing = await prisma.activityType.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      res.status(400).json({ error: 'Código já cadastrado' });
      return;
    }

    const activityType = await prisma.activityType.create({
      data: {
        ...data,
        activityTypeSectors: sectorIds && sectorIds.length > 0 ? {
          create: sectorIds.map((sectorId: number) => ({
            sectorId,
          })),
        } : undefined,
      },
      include: {
        activityTypeSectors: {
          include: {
            sector: true,
          },
        },
      },
    });

    res.status(201).json(activityType);
  } catch (error: any) {
    console.error('Erro ao criar tipo de atividade:', error);
    res.status(500).json({ error: 'Erro ao criar tipo de atividade' });
  }
}

/**
 * Atualiza um tipo de atividade
 */
export async function updateActivityType(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { sectorIds, ...data } = req.body;

    // Verificar se tipo de atividade existe
    const existing = await prisma.activityType.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Tipo de atividade não encontrado' });
      return;
    }

    // Verificar código duplicado (se mudou)
    if (data.code && data.code !== existing.code) {
      const duplicateCode = await prisma.activityType.findUnique({
        where: { code: data.code },
      });

      if (duplicateCode) {
        res.status(400).json({ error: 'Código já cadastrado' });
        return;
      }
    }

    // Atualizar tipo de atividade e seus setores
    const activityType = await prisma.activityType.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        activityTypeSectors: sectorIds !== undefined ? {
          // Deletar todos os setores existentes
          deleteMany: {},
          // Criar os novos setores
          create: sectorIds.length > 0 ? sectorIds.map((sectorId: number) => ({
            sectorId,
          })) : [],
        } : undefined,
      },
      include: {
        activityTypeSectors: {
          include: {
            sector: true,
          },
        },
      },
    });

    res.json(activityType);
  } catch (error: any) {
    console.error('Erro ao atualizar tipo de atividade:', error);
    res.status(500).json({ error: 'Erro ao atualizar tipo de atividade' });
  }
}

/**
 * Deleta um tipo de atividade
 */
export async function deleteActivityType(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se tipo de atividade existe
    const existing = await prisma.activityType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            downtimes: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Tipo de atividade não encontrado' });
      return;
    }

    // Verificar se tem paradas vinculadas
    if (existing._count.downtimes > 0) {
      res.status(400).json({
        error: 'Não é possível excluir tipo de atividade com paradas vinculadas',
      });
      return;
    }

    await prisma.activityType.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar tipo de atividade:', error);
    res.status(500).json({ error: 'Erro ao deletar tipo de atividade' });
  }
}

