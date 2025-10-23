/**
 * Controller para gerenciamento de defeitos de produção (apontamento de perdas)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Lista todos os defeitos de produção
 */
export async function listProductionDefects(req: Request, res: Response): Promise<void> {
  try {
    const { productionOrderId, startDate, endDate } = req.query;

    const where: any = {};
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate as string);
      }
    }

    const productionDefects = await prisma.productionDefect.findMany({
      where,
      include: {
        defect: true,
        productionOrder: {
          include: {
            item: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    res.json(productionDefects);
  } catch (error: any) {
    console.error('Erro ao listar defeitos de produção:', error);
    res.status(500).json({ error: 'Erro ao listar defeitos de produção' });
  }
}

/**
 * Busca um defeito de produção por ID
 */
export async function getProductionDefect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const productionDefect = await prisma.productionDefect.findUnique({
      where: { id: parseInt(id) },
      include: {
        defect: true,
        productionOrder: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!productionDefect) {
      res.status(404).json({ error: 'Defeito de produção não encontrado' });
      return;
    }

    res.json(productionDefect);
  } catch (error: any) {
    console.error('Erro ao buscar defeito de produção:', error);
    res.status(500).json({ error: 'Erro ao buscar defeito de produção' });
  }
}

/**
 * Cria um novo defeito de produção (apontamento de perda)
 */
export async function createProductionDefect(req: Request, res: Response): Promise<void> {
  try {
    const { productionOrderId, defectId, quantity, notes } = req.body;

    // Verificar se a ordem de produção existe
    const productionOrder = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
    });

    if (!productionOrder) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Verificar se o defeito existe
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
    });

    if (!defect) {
      res.status(404).json({ error: 'Defeito não encontrado' });
      return;
    }

    // Verificar se o defeito está ativo
    if (!defect.active) {
      res.status(400).json({ error: 'Defeito não está ativo' });
      return;
    }

    // Criar o defeito de produção e atualizar a quantidade rejeitada da ordem
    const productionDefect = await prisma.$transaction(async (tx) => {
      // Criar o registro de defeito
      const newDefect = await tx.productionDefect.create({
        data: {
          productionOrderId,
          defectId,
          quantity,
          notes,
        },
        include: {
          defect: true,
          productionOrder: {
            include: {
              item: true,
            },
          },
        },
      });

      // Atualizar a quantidade rejeitada da ordem
      await tx.productionOrder.update({
        where: { id: productionOrderId },
        data: {
          rejectedQuantity: {
            increment: quantity,
          },
        },
      });

      return newDefect;
    });

    res.status(201).json(productionDefect);
  } catch (error: any) {
    console.error('Erro ao criar defeito de produção:', error);
    res.status(500).json({ error: 'Erro ao criar defeito de produção' });
  }
}

/**
 * Atualiza um defeito de produção
 */
export async function updateProductionDefect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { quantity, notes, defectId } = req.body;

    const existing = await prisma.productionDefect.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Defeito de produção não encontrado' });
      return;
    }

    // Se mudou o defectId, verificar se o novo defeito existe
    if (defectId && defectId !== existing.defectId) {
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
      });

      if (!defect || !defect.active) {
        res.status(400).json({ error: 'Defeito não encontrado ou não está ativo' });
        return;
      }
    }

    // Atualizar o defeito de produção e ajustar a quantidade rejeitada da ordem
    const productionDefect = await prisma.$transaction(async (tx) => {
      const updated = await tx.productionDefect.update({
        where: { id: parseInt(id) },
        data: {
          ...(quantity !== undefined && { quantity }),
          ...(notes !== undefined && { notes }),
          ...(defectId !== undefined && { defectId }),
        },
        include: {
          defect: true,
          productionOrder: {
            include: {
              item: true,
            },
          },
        },
      });

      // Se a quantidade foi alterada, ajustar a ordem
      if (quantity !== undefined && quantity !== existing.quantity) {
        const difference = quantity - existing.quantity;
        await tx.productionOrder.update({
          where: { id: existing.productionOrderId },
          data: {
            rejectedQuantity: {
              increment: difference,
            },
          },
        });
      }

      return updated;
    });

    res.json(productionDefect);
  } catch (error: any) {
    console.error('Erro ao atualizar defeito de produção:', error);
    res.status(500).json({ error: 'Erro ao atualizar defeito de produção' });
  }
}

/**
 * Deleta um defeito de produção
 */
export async function deleteProductionDefect(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existing = await prisma.productionDefect.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({ error: 'Defeito de produção não encontrado' });
      return;
    }

    // Deletar o defeito e ajustar a quantidade rejeitada da ordem
    await prisma.$transaction(async (tx) => {
      await tx.productionDefect.delete({
        where: { id: parseInt(id) },
      });

      // Decrementar a quantidade rejeitada da ordem
      await tx.productionOrder.update({
        where: { id: existing.productionOrderId },
        data: {
          rejectedQuantity: {
            decrement: existing.quantity,
          },
        },
      });
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar defeito de produção:', error);
    res.status(500).json({ error: 'Erro ao deletar defeito de produção' });
  }
}

