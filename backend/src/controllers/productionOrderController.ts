/**
 * Controller de Ordens de Produção
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';
import { AuthenticatedRequest, getCompanyFilter } from '../middleware/companyFilter';

/**
 * Lista todas as ordens de produção
 */
export async function listProductionOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, startDate, endDate } = req.query;
    
    const where: any = {
      ...getCompanyFilter(req, false), // Filtra por empresa do usuário
    };
    
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
        color: true,
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
    const { includeAppointments = 'true', limit = '100' } = req.query;

    const includeRelations = includeAppointments === 'true';
    const appointmentLimit = parseInt(limit as string) || 100;

    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        item: true,
        color: true,
        mold: true,
        plcConfig: true,
        company: true,
        sector: true,
        productionAppointments: includeRelations ? {
          include: { user: true },
          orderBy: { timestamp: 'desc' },
          take: appointmentLimit, // Limitar quantidade
        } : false,
        downtimes: includeRelations ? {
          include: { responsible: true, activityType: true },
          orderBy: { startTime: 'desc' },
          take: 50, // Limitar últimas 50 paradas
        } : false,
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
export async function createProductionOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId; // Empresa do usuário autenticado
    
    const { 
      orderNumber, 
      itemId,
      colorId,
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
        colorId,
        moldId,
        companyId, // Vincula à empresa do usuário
        plannedQuantity,
        priority,
        plannedStartDate: new Date(plannedStartDate),
        plannedEndDate: new Date(plannedEndDate),
        notes,
      },
      include: {
        item: true,
        color: true,
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
      'colorId',
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

    // Validação: Apenas uma ordem pode estar ACTIVE por vez (por CLP por empresa)
    if (updateData.status === 'ACTIVE') {
      const activeOrder = await prisma.productionOrder.findFirst({
        where: {
          status: 'ACTIVE',
          companyId: existingOrder.companyId, // ✅ Validar na mesma empresa
          id: { not: parseInt(id) }, // Excluir a ordem atual
        },
      });

      if (activeOrder) {
        res.status(400).json({ 
          error: 'Já existe uma ordem em atividade',
          details: `A ordem ${activeOrder.orderNumber} está atualmente em atividade. Pause ou encerre-a antes de iniciar outra.`,
          activeOrderId: activeOrder.id,
          activeOrderNumber: activeOrder.orderNumber,
        });
        return;
      }

      // Definir data de início se ainda não foi definida
      if (!existingOrder.startDate && !updateData.startDate) {
        updateData.startDate = new Date();
      }
    }

    // Definir data de término quando a ordem for encerrada
    if (updateData.status === 'FINISHED' && !existingOrder.endDate && !updateData.endDate) {
      updateData.endDate = new Date();
    }

    const order = await prisma.productionOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        item: true,
        color: true,
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
    if (status === 'ACTIVE' && !existingOrder.startDate) {
      updateData.startDate = new Date();
    }

    // Se completando, registrar data de fim
    if (status === 'FINISHED' && !existingOrder.endDate) {
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

/**
 * Verifica se existe apontamento de produção para uma ordem
 */
export async function hasProductionAppointment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        productionAppointments: {
          take: 1,
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    res.json({
      hasAppointment: order.productionAppointments.length > 0,
      firstAppointment: order.productionAppointments[0] || null,
      status: order.status,
    });
  } catch (error) {
    console.error('Erro ao verificar apontamento:', error);
    res.status(500).json({ error: 'Erro ao verificar apontamento' });
  }
}

/**
 * Inicia produção da ordem (cria primeiro apontamento e muda status para ACTIVE)
 */
export async function startProduction(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        plcConfig: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Verificar se já existe outra ordem ACTIVE no mesmo CLP da mesma empresa
    // Se a ordem tiver plcConfigId, verificar apenas no mesmo CLP
    // Se não tiver plcConfigId, não permite iniciar nenhuma ordem
    if (order.plcConfigId) {
      const activeOrderInPlc = await prisma.productionOrder.findFirst({
        where: {
          status: 'ACTIVE',
          plcConfigId: order.plcConfigId,
          companyId: order.companyId, // ✅ Validar na mesma empresa
          id: { not: parseInt(id) },
        },
        include: {
          plcConfig: true,
        },
      });

      if (activeOrderInPlc) {
        res.status(400).json({ 
          error: 'Já existe uma ordem em atividade neste CLP/Injetora',
          details: `A ordem ${activeOrderInPlc.orderNumber} está atualmente em atividade na injetora ${activeOrderInPlc.plcConfig?.name || 'N/A'}.`,
          activeOrder: activeOrderInPlc,
        });
        return;
      }
    } else {
      // Se a ordem não tem PLC vinculado, verificar se existe qualquer ordem ativa na mesma empresa
      const anyActiveOrder = await prisma.productionOrder.findFirst({
        where: {
          status: 'ACTIVE',
          companyId: order.companyId, // ✅ Validar na mesma empresa
          id: { not: parseInt(id) },
        },
      });

      if (anyActiveOrder) {
        res.status(400).json({ 
          error: 'Ordem sem CLP vinculado não pode ser iniciada enquanto houver outra ordem ativa',
          details: `A ordem ${anyActiveOrder.orderNumber} está em atividade. Vincule esta ordem a um CLP ou finalize a ordem ativa.`,
        });
        return;
      }
    }

    // Criar data no horário de Brasília
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));

    // Atualizar ordem para ACTIVE e definir startDate se ainda não foi definida
    const updateData: any = { status: 'ACTIVE' };
    if (!order.startDate) {
      updateData.startDate = brasiliaTime;
    }

    const updatedOrder = await prisma.productionOrder.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        item: true,
        color: true,
        mold: true,
        plcConfig: true,
      },
    });

    res.json({
      message: 'Produção iniciada com sucesso',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao iniciar produção:', error);
    res.status(500).json({ error: 'Erro ao iniciar produção' });
  }
}


