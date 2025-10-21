/**
 * Controller de Ordens de Produção
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';

/**
 * Lista todas as ordens de produção
 */
export async function listProductionOrders(req: Request, res: Response): Promise<void> {
  try {
    const { status, startDate, endDate } = req.query;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.plannedStartDate = {};
      if (startDate) {
        where.plannedStartDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.plannedStartDate.lte = new Date(endDate as string);
      }
    }

    const orders = await prisma.productionOrder.findMany({
      where,
      include: {
        item: true,
        mold: true,
      },
      orderBy: [
        { priority: 'desc' },
        { plannedStartDate: 'asc' },
      ],
    });

    res.json(orders);
  } catch (error) {
    console.error('Erro ao listar ordens de produção:', error);
    res.status(500).json({ error: 'Erro ao listar ordens de produção' });
  }
}

/**
 * Busca ordem de produção por ID
 */
export async function getProductionOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        item: true,
        mold: true,
        productionAppointments: {
          include: { user: true },
          orderBy: { timestamp: 'desc' },
        },
        downtimes: {
          include: { responsible: true },
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('Erro ao buscar ordem de produção:', error);
    res.status(500).json({ error: 'Erro ao buscar ordem de produção' });
  }
}

/**
 * Cria nova ordem de produção
 */
export async function createProductionOrder(req: Request, res: Response): Promise<void> {
  try {
    const { 
      orderNumber, 
      itemId, 
      moldId, 
      plannedQuantity, 
      priority = 0,
      plannedStartDate,
      plannedEndDate,
      notes 
    } = req.body;

    // Verificar se número da ordem já existe
    const existingOrder = await prisma.productionOrder.findUnique({
      where: { orderNumber },
    });

    if (existingOrder) {
      res.status(400).json({ error: 'Número de ordem já existe' });
      return;
    }

    // Verificar se item existe
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      res.status(404).json({ error: 'Item não encontrado' });
      return;
    }

    // Verificar se molde existe (se fornecido)
    if (moldId) {
      const mold = await prisma.mold.findUnique({
        where: { id: moldId },
      });

      if (!mold) {
        res.status(404).json({ error: 'Molde não encontrado' });
        return;
      }
    }

    const order = await prisma.productionOrder.create({
      data: {
        orderNumber,
        itemId,
        moldId,
        plannedQuantity,
        priority,
        plannedStartDate: new Date(plannedStartDate),
        plannedEndDate: new Date(plannedEndDate),
        notes,
      },
      include: {
        item: true,
        mold: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Erro ao criar ordem de produção:', error);
    res.status(500).json({ error: 'Erro ao criar ordem de produção' });
  }
}

/**
 * Atualiza ordem de produção
 */
export async function updateProductionOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    console.log('📝 Atualizando ordem ID:', id);
    console.log('📝 Dados recebidos:', JSON.stringify(data, null, 2));

    const existingOrder = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingOrder) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Criar objeto limpo apenas com campos permitidos
    const updateData: any = {};

    // Campos permitidos
    const allowedFields = [
      'orderNumber',
      'itemId',
      'moldId',
      'plannedQuantity',
      'producedQuantity',
      'rejectedQuantity',
      'status',
      'priority',
      'notes',
      'plannedStartDate',
      'plannedEndDate',
      'startDate',
      'endDate',
    ];

    // Copiar apenas campos permitidos
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Converter datas se fornecidas
    if (updateData.plannedStartDate) {
      updateData.plannedStartDate = new Date(updateData.plannedStartDate);
    }
    if (updateData.plannedEndDate) {
      updateData.plannedEndDate = new Date(updateData.plannedEndDate);
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    console.log('📝 Dados a atualizar:', JSON.stringify(updateData, null, 2));

    const order = await prisma.productionOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        item: true,
        mold: true,
      },
    });

    res.json(order);
  } catch (error: any) {
    console.error('❌ Erro ao atualizar ordem de produção:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao atualizar ordem de produção',
      details: error.message,
    });
  }
}

/**
 * Atualiza status da ordem de produção
 */
export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingOrder = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingOrder) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    const updateData: any = { status };

    // Se iniciando produção, registrar data de início
    if (status === 'IN_PROGRESS' && !existingOrder.startDate) {
      updateData.startDate = new Date();
    }

    // Se completando, registrar data de fim
    if (status === 'COMPLETED' && !existingOrder.endDate) {
      updateData.endDate = new Date();
    }

    const order = await prisma.productionOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        item: true,
        mold: true,
      },
    });

    res.json(order);
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
}

/**
 * Deleta ordem de produção
 */
export async function deleteProductionOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existingOrder = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
      include: { 
        productionAppointments: true,
        downtimes: true,
      },
    });

    if (!existingOrder) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Verificar se pode deletar
    if (existingOrder.productionAppointments.length > 0) {
      res.status(400).json({ 
        error: 'Não é possível excluir ordem com apontamentos. Cancele a ordem ao invés de excluir.' 
      });
      return;
    }

    await prisma.productionOrder.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar ordem de produção:', error);
    res.status(500).json({ error: 'Erro ao deletar ordem de produção' });
  }
}

/**
 * Obtém estatísticas da ordem
 */
export async function getOrderStats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        productionAppointments: true,
        downtimes: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Calcular estatísticas
    const totalDowntime = order.downtimes.reduce((sum, dt) => {
      if (dt.duration) {
        return sum + dt.duration;
      }
      if (dt.endTime) {
        return sum + (dt.endTime.getTime() - dt.startTime.getTime()) / 1000;
      }
      return sum;
    }, 0);

    const completionRate = (order.producedQuantity / order.plannedQuantity) * 100;
    const qualityRate = order.producedQuantity > 0 
      ? ((order.producedQuantity - order.rejectedQuantity) / order.producedQuantity) * 100 
      : 100;

    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      plannedQuantity: order.plannedQuantity,
      producedQuantity: order.producedQuantity,
      rejectedQuantity: order.rejectedQuantity,
      completionRate,
      qualityRate,
      totalAppointments: order.productionAppointments.length,
      totalDowntimeSeconds: totalDowntime,
      totalDowntimeFormatted: moment.duration(totalDowntime, 'seconds').humanize(),
      status: order.status,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
}


