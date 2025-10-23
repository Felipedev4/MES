/**
 * Controller de Alterações de Ciclo
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar alterações de ciclo de uma ordem
export const listCycleChanges = async (req: Request, res: Response) => {
  try {
    const { productionOrderId } = req.query;

    const where: any = {};
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }

    const cycleChanges = await prisma.cycleChange.findMany({
      where,
      include: {
        productionOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    return res.json(cycleChanges);
  } catch (error: any) {
    console.error('Erro ao listar alterações de ciclo:', error);
    return res.status(500).json({ error: 'Erro ao listar alterações de ciclo' });
  }
};

// Obter alteração de ciclo por ID
export const getCycleChangeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cycleChange = await prisma.cycleChange.findUnique({
      where: { id: parseInt(id) },
      include: {
        productionOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!cycleChange) {
      return res.status(404).json({ error: 'Alteração de ciclo não encontrada' });
    }

    return res.json(cycleChange);
  } catch (error: any) {
    console.error('Erro ao buscar alteração de ciclo:', error);
    return res.status(500).json({ error: 'Erro ao buscar alteração de ciclo' });
  }
};

// Criar alteração de ciclo
export const createCycleChange = async (req: Request, res: Response) => {
  try {
    const {
      productionOrderId,
      newCycle,
      reason,
      userId,
    } = req.body;

    // Validações
    if (!productionOrderId || !newCycle || !reason) {
      return res.status(400).json({ 
        error: 'Ordem de produção, novo ciclo e motivo são obrigatórios' 
      });
    }

    if (newCycle <= 0) {
      return res.status(400).json({ 
        error: 'O novo ciclo deve ser maior que zero' 
      });
    }

    // Verificar se a ordem existe
    const order = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        mold: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Ordem de produção não encontrada' });
    }

    // VALIDAÇÃO: Só pode alterar ciclo se a ordem estiver PAUSADA
    if (order.status !== 'PAUSED') {
      return res.status(400).json({ 
        error: 'Só é possível alterar o ciclo quando a ordem estiver pausada',
        currentStatus: order.status
      });
    }

    // Buscar a última alteração de ciclo desta ordem
    const lastCycleChange = await prisma.cycleChange.findFirst({
      where: { productionOrderId },
      orderBy: { timestamp: 'desc' },
    });

    // Determinar o ciclo anterior
    const previousCycle = lastCycleChange 
      ? lastCycleChange.newCycle 
      : (order.mold?.cycleTime || null);

    const cycleChange = await prisma.cycleChange.create({
      data: {
        productionOrderId,
        previousCycle,
        newCycle,
        reason,
        userId: userId || null,
      },
      include: {
        productionOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(cycleChange);
  } catch (error: any) {
    console.error('Erro ao criar alteração de ciclo:', error);
    return res.status(500).json({ error: 'Erro ao criar alteração de ciclo' });
  }
};

// Deletar alteração de ciclo
export const deleteCycleChange = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cycleChange = await prisma.cycleChange.findUnique({
      where: { id: parseInt(id) },
    });

    if (!cycleChange) {
      return res.status(404).json({ error: 'Alteração de ciclo não encontrada' });
    }

    await prisma.cycleChange.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: 'Alteração de ciclo deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar alteração de ciclo:', error);
    return res.status(500).json({ error: 'Erro ao deletar alteração de ciclo' });
  }
};

// Obter histórico completo de alterações de uma ordem
export const getCycleHistory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        mold: {
          select: {
            cycleTime: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Ordem de produção não encontrada' });
    }

    const changes = await prisma.cycleChange.findMany({
      where: { productionOrderId: parseInt(orderId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    return res.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        initialCycle: order.mold?.cycleTime || null,
      },
      changes,
      currentCycle: changes.length > 0 
        ? changes[changes.length - 1].newCycle 
        : order.mold?.cycleTime || null,
    });
  } catch (error: any) {
    console.error('Erro ao buscar histórico de ciclo:', error);
    return res.status(500).json({ error: 'Erro ao buscar histórico de ciclo' });
  }
};

