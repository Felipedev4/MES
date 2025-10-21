/**
 * Controller para gerenciamento de tipos de referência
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todos os tipos de referência
 */
export async function listReferenceTypes(req: Request, res: Response): Promise<void> {
  try {
    const { active } = req.query;

    const where = active !== undefined ? { active: active === 'true' } : {};

    const referenceTypes = await prisma.referenceType.findMany({
      where,
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(referenceTypes);
  } catch (error: any) {
    console.error('Erro ao listar tipos de referência:', error);
    res.status(500).json({ error: 'Erro ao listar tipos de referência' });
  }
}

/**
 * Busca um tipo de referência por ID
 */
export async function getReferenceType(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const referenceType = await prisma.referenceType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!referenceType) {
      res.status(404).json({ error: 'Tipo de referência não encontrado' });
      return;
    }

    res.json(referenceType);
  } catch (error: any) {
    console.error('Erro ao buscar tipo de referência:', error);
    res.status(500).json({ error: 'Erro ao buscar tipo de referência' });
  }
}

/**
 * Cria um novo tipo de referência
 */
export async function createReferenceType(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;

    // Verificar se código já existe
    const existing = await prisma.referenceType.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      res.status(400).json({ error: 'Código já cadastrado' });
      return;
    }

    const referenceType = await prisma.referenceType.create({
      data,
    });

    res.status(201).json(referenceType);
  } catch (error: any) {
    console.error('Erro ao criar tipo de referência:', error);
    res.status(500).json({ error: 'Erro ao criar tipo de referência' });
  }
}

/**
 * Atualiza um tipo de referência
 */
export async function updateReferenceType(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    // Verificar se tipo de referência existe
    const existing = await prisma.referenceType.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Tipo de referência não encontrado' });
      return;
    }

    // Verificar código duplicado (se mudou)
    if (data.code && data.code !== existing.code) {
      const duplicateCode = await prisma.referenceType.findUnique({
        where: { code: data.code },
      });

      if (duplicateCode) {
        res.status(400).json({ error: 'Código já cadastrado' });
        return;
      }
    }

    const referenceType = await prisma.referenceType.update({
      where: { id: parseInt(id) },
      data,
    });

    res.json(referenceType);
  } catch (error: any) {
    console.error('Erro ao atualizar tipo de referência:', error);
    res.status(500).json({ error: 'Erro ao atualizar tipo de referência' });
  }
}

/**
 * Deleta um tipo de referência
 */
export async function deleteReferenceType(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se tipo de referência existe
    const existing = await prisma.referenceType.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Tipo de referência não encontrado' });
      return;
    }

    // Verificar se tem itens vinculados
    if (existing._count.items > 0) {
      res.status(400).json({
        error: 'Não é possível excluir tipo de referência com itens vinculados',
      });
      return;
    }

    await prisma.referenceType.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar tipo de referência:', error);
    res.status(500).json({ error: 'Erro ao deletar tipo de referência' });
  }
}

