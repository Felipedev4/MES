import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiKeyRequest } from '../middleware/apiKeyAuth';

/**
 * Buscar todas as configurações de CLP ativas (para data-collector)
 */
export async function getActivePlcConfigs(_req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const configs = await prisma.plcConfig.findMany({
      where: { active: true },
      include: {
        registers: {
          where: { enabled: true },
          orderBy: { registerAddress: 'asc' },
        },
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(configs);
  } catch (error: any) {
    console.error('Erro ao buscar configurações de CLP:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
}

/**
 * Buscar uma configuração de CLP específica
 */
export async function getPlcConfig(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const config = await prisma.plcConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        registers: {
          where: { enabled: true },
          orderBy: { registerAddress: 'asc' },
        },
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Configuração não encontrada' });
      return;
    }

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configuração de CLP:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
}

/**
 * Receber dados coletados do CLP
 */
export async function receivePlcData(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const {
      plcRegisterId,
      registerAddress,
      registerName,
      value,
      timestamp,
      connected,
      errorMessage,
    } = req.body;

    // Validar campos obrigatórios
    if (!plcRegisterId || registerAddress === undefined || !registerName || value === undefined) {
      res.status(400).json({ error: 'Campos obrigatórios faltando' });
      return;
    }

    // Salvar no banco
    const plcData = await prisma.plcData.create({
      data: {
        plcRegisterId: parseInt(plcRegisterId),
        registerAddress: parseInt(registerAddress),
        registerName,
        value: parseFloat(value),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        connected: connected !== false,
        errorMessage: errorMessage || null,
      },
    });

    res.status(201).json(plcData);
  } catch (error: any) {
    console.error('Erro ao salvar dados do CLP:', error);
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
}

/**
 * Receber múltiplos dados de uma vez (batch)
 */
export async function receivePlcDataBatch(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'Array de dados é obrigatório' });
      return;
    }

    // Inserir em batch
    const plcDataRecords = await prisma.plcData.createMany({
      data: data.map((item: any) => ({
        plcRegisterId: parseInt(item.plcRegisterId),
        registerAddress: parseInt(item.registerAddress),
        registerName: item.registerName,
        value: parseFloat(item.value),
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        connected: item.connected !== false,
        errorMessage: item.errorMessage || null,
      })),
    });

    res.status(201).json({
      success: true,
      count: plcDataRecords.count,
    });
  } catch (error: any) {
    console.error('Erro ao salvar batch de dados:', error);
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
}

/**
 * Buscar ordens de produção ativas
 */
export async function getActiveProductionOrders(_req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const orders = await prisma.productionOrder.findMany({
      where: {
        status: 'IN_PROGRESS',
      },
      select: {
        id: true,
        orderNumber: true,
        itemId: true,
        status: true,
        producedQuantity: true,
      },
      orderBy: [
        { priority: 'desc' },
        { plannedStartDate: 'asc' },
      ],
    });

    res.json(orders);
  } catch (error: any) {
    console.error('Erro ao buscar ordens de produção:', error);
    res.status(500).json({ error: 'Erro ao buscar ordens' });
  }
}

/**
 * Receber apontamento de produção
 */
export async function receiveProductionAppointment(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const {
      productionOrderId,
      quantity,
      timestamp,
    } = req.body;

    // Validar campos obrigatórios
    if (!productionOrderId || !quantity) {
      res.status(400).json({ error: 'productionOrderId e quantity são obrigatórios' });
      return;
    }

    // Verificar se a ordem existe e está ativa
    const order = await prisma.productionOrder.findUnique({
      where: { id: parseInt(productionOrderId) },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    if (order.status !== 'IN_PROGRESS') {
      res.status(400).json({ error: 'Ordem de produção não está ativa' });
      return;
    }

    // Criar apontamento (assumindo userId = 1 para apontamentos automáticos do data-collector)
    const appointment = await prisma.productionAppointment.create({
      data: {
        productionOrderId: parseInt(productionOrderId),
        userId: 1, // TODO: Criar usuário específico para data-collector
        quantity: parseFloat(quantity),
        productionDate: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    // Atualizar quantidade produzida na ordem
    await prisma.productionOrder.update({
      where: { id: parseInt(productionOrderId) },
      data: {
        producedQuantity: {
          increment: parseFloat(quantity),
        },
      },
    });

    res.status(201).json(appointment);
  } catch (error: any) {
    console.error('Erro ao registrar apontamento:', error);
    res.status(500).json({ error: 'Erro ao registrar apontamento' });
  }
}

