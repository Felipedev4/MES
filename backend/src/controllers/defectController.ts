/**
 * Controller para gerenciamento de defeitos
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todos os defeitos
 */
export async function listDefects(req: Request, res: Response): Promise<void> {
  try {
    const { active, severity } = req.query;

    const where: any = {};
    if (active !== undefined) where.active = active === 'true';
    if (severity) where.severity = severity as string;

    const defects = await prisma.defect.findMany({
      where,
      include: {
        _count: {
          select: {
            productionDefects: true,
          },
        },
        defectSectors: {
          include: {
            sector: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Transformar dados para incluir setores responsáveis
    const defectsWithSectors = defects.map(defect => ({
      ...defect,
      responsibleSectors: defect.defectSectors.map(ds => ds.sector),
      defectSectors: undefined, // Remover para simplificar retorno
    }));

    res.json(defectsWithSectors);
  } catch (error: any) {
    console.error('Erro ao listar defeitos:', error);
    res.status(500).json({ error: 'Erro ao listar defeitos' });
  }
}

/**
 * Busca um defeito por ID
 */
export async function getDefect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const defect = await prisma.defect.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            productionDefects: true,
          },
        },
        defectSectors: {
          include: {
            sector: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!defect) {
      res.status(404).json({ error: 'Defeito não encontrado' });
      return;
    }

    // Transformar dados
    const defectWithSectors = {
      ...defect,
      responsibleSectors: defect.defectSectors.map(ds => ds.sector),
      defectSectors: undefined,
    };

    res.json(defectWithSectors);
  } catch (error: any) {
    console.error('Erro ao buscar defeito:', error);
    res.status(500).json({ error: 'Erro ao buscar defeito' });
  }
}

/**
 * Cria um novo defeito
 */
export async function createDefect(req: Request, res: Response): Promise<void> {
  try {
    const { sectorIds, ...data } = req.body;

    // Verificar se código já existe
    const existing = await prisma.defect.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      res.status(400).json({ error: 'Código já cadastrado' });
      return;
    }

    // Criar defeito com setores responsáveis
    const defect = await prisma.defect.create({
      data: {
        ...data,
        defectSectors: sectorIds && sectorIds.length > 0 ? {
          create: sectorIds.map((sectorId: number) => ({
            sectorId,
          })),
        } : undefined,
      },
      include: {
        defectSectors: {
          include: {
            sector: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transformar dados
    const defectWithSectors = {
      ...defect,
      responsibleSectors: defect.defectSectors.map(ds => ds.sector),
      defectSectors: undefined,
    };

    res.status(201).json(defectWithSectors);
  } catch (error: any) {
    console.error('Erro ao criar defeito:', error);
    res.status(500).json({ error: 'Erro ao criar defeito' });
  }
}

/**
 * Atualiza um defeito
 */
export async function updateDefect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { sectorIds, ...data } = req.body;

    // Verificar se defeito existe
    const existing = await prisma.defect.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Defeito não encontrado' });
      return;
    }

    // Verificar código duplicado (se mudou)
    if (data.code && data.code !== existing.code) {
      const duplicateCode = await prisma.defect.findUnique({
        where: { code: data.code },
      });

      if (duplicateCode) {
        res.status(400).json({ error: 'Código já cadastrado' });
        return;
      }
    }

    // Atualizar defeito e setores responsáveis
    const defect = await prisma.defect.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        defectSectors: sectorIds !== undefined ? {
          // Deletar todos os vínculos existentes e recriar
          deleteMany: {},
          create: sectorIds.map((sectorId: number) => ({
            sectorId,
          })),
        } : undefined,
      },
      include: {
        defectSectors: {
          include: {
            sector: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Transformar dados
    const defectWithSectors = {
      ...defect,
      responsibleSectors: defect.defectSectors.map(ds => ds.sector),
      defectSectors: undefined,
    };

    res.json(defectWithSectors);
  } catch (error: any) {
    console.error('Erro ao atualizar defeito:', error);
    res.status(500).json({ error: 'Erro ao atualizar defeito' });
  }
}

/**
 * Deleta um defeito
 */
export async function deleteDefect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se defeito existe
    const existing = await prisma.defect.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            productionDefects: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Defeito não encontrado' });
      return;
    }

    // Verificar se tem apontamentos de defeitos vinculados
    if (existing._count.productionDefects > 0) {
      res.status(400).json({
        error: 'Não é possível excluir defeito com apontamentos vinculados',
      });
      return;
    }

    await prisma.defect.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar defeito:', error);
    res.status(500).json({ error: 'Erro ao deletar defeito' });
  }
}

