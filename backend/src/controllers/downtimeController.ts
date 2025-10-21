/**
 * Controller de Paradas (Downtime)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';

/**
 * Lista todas as paradas
 */
export async function listDowntimes(req: Request, res: Response): Promise<void> {
  try {
    const { type, startDate, endDate, productionOrderId } = req.query;
    
    const where: any = {};
    
    if (type) {
      where.type = type;
    }
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const downtimes = await prisma.downtime.findMany({
      where,
      include: {
        productionOrder: {
          include: { item: true },
        },
        responsible: true,
      },
      orderBy: { startTime: 'desc' },
    });

    // Calcular duração para cada parada
    const downtimesWithDuration = downtimes.map(dt => {
      let duration = dt.duration;
      
      if (!duration && dt.endTime) {
        duration = Math.floor((dt.endTime.getTime() - dt.startTime.getTime()) / 1000);
      } else if (!duration && !dt.endTime) {
        // Parada ainda em andamento
        duration = Math.floor((new Date().getTime() - dt.startTime.getTime()) / 1000);
      }

      return {
        ...dt,
        calculatedDuration: duration,
        durationFormatted: duration ? moment.duration(duration, 'seconds').humanize() : null,
        isActive: !dt.endTime,
      };
    });

    res.json(downtimesWithDuration);
  } catch (error) {
    console.error('Erro ao listar paradas:', error);
    res.status(500).json({ error: 'Erro ao listar paradas' });
  }
}

/**
 * Busca parada por ID
 */
export async function getDowntime(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const downtime = await prisma.downtime.findUnique({
      where: { id: parseInt(id) },
      include: {
        productionOrder: {
          include: { item: true },
        },
        responsible: true,
      },
    });

    if (!downtime) {
      res.status(404).json({ error: 'Parada não encontrada' });
      return;
    }

    res.json(downtime);
  } catch (error) {
    console.error('Erro ao buscar parada:', error);
    res.status(500).json({ error: 'Erro ao buscar parada' });
  }
}

/**
 * Cria nova parada
 */
export async function createDowntime(req: Request, res: Response): Promise<void> {
  try {
    const { 
      productionOrderId, 
      type, 
      reason, 
      description, 
      responsibleId,
      startTime,
      endTime,
    } = req.body;

    // Validar ordem de produção se fornecida
    if (productionOrderId) {
      const order = await prisma.productionOrder.findUnique({
        where: { id: productionOrderId },
      });

      if (!order) {
        res.status(404).json({ error: 'Ordem de produção não encontrada' });
        return;
      }
    }

    // Calcular duração se endTime fornecido
    let duration: number | undefined;
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      duration = Math.floor((end.getTime() - start.getTime()) / 1000);
    }

    const downtime = await prisma.downtime.create({
      data: {
        productionOrderId,
        type,
        reason,
        description,
        responsibleId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
      },
      include: {
        productionOrder: true,
        responsible: true,
      },
    });

    res.status(201).json(downtime);
  } catch (error) {
    console.error('Erro ao criar parada:', error);
    res.status(500).json({ error: 'Erro ao criar parada' });
  }
}

/**
 * Atualiza parada
 */
export async function updateDowntime(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingDowntime = await prisma.downtime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDowntime) {
      res.status(404).json({ error: 'Parada não encontrada' });
      return;
    }

    // Converter datas se fornecidas
    if (data.startTime) {
      data.startTime = new Date(data.startTime);
    }
    if (data.endTime) {
      data.endTime = new Date(data.endTime);
    }

    // Recalcular duração se ambas as datas estiverem disponíveis
    const startTime = data.startTime || existingDowntime.startTime;
    const endTime = data.endTime || existingDowntime.endTime;
    
    if (startTime && endTime) {
      data.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }

    const downtime = await prisma.downtime.update({
      where: { id: parseInt(id) },
      data,
      include: {
        productionOrder: true,
        responsible: true,
      },
    });

    res.json(downtime);
  } catch (error) {
    console.error('Erro ao atualizar parada:', error);
    res.status(500).json({ error: 'Erro ao atualizar parada' });
  }
}

/**
 * Finaliza uma parada (registra endTime)
 */
export async function endDowntime(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { endTime } = req.body;

    const existingDowntime = await prisma.downtime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDowntime) {
      res.status(404).json({ error: 'Parada não encontrada' });
      return;
    }

    if (existingDowntime.endTime) {
      res.status(400).json({ error: 'Parada já foi finalizada' });
      return;
    }

    const end = new Date(endTime);
    const duration = Math.floor((end.getTime() - existingDowntime.startTime.getTime()) / 1000);

    const downtime = await prisma.downtime.update({
      where: { id: parseInt(id) },
      data: {
        endTime: end,
        duration,
      },
      include: {
        productionOrder: true,
        responsible: true,
      },
    });

    res.json(downtime);
  } catch (error) {
    console.error('Erro ao finalizar parada:', error);
    res.status(500).json({ error: 'Erro ao finalizar parada' });
  }
}

/**
 * Deleta parada
 */
export async function deleteDowntime(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const existingDowntime = await prisma.downtime.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingDowntime) {
      res.status(404).json({ error: 'Parada não encontrada' });
      return;
    }

    await prisma.downtime.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar parada:', error);
    res.status(500).json({ error: 'Erro ao deletar parada' });
  }
}

/**
 * Obtém estatísticas de paradas
 */
export async function getDowntimeStats(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, productionOrderId } = req.query;
    
    const where: any = {};
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const downtimes = await prisma.downtime.findMany({ where });

    // Agrupar por tipo
    const byType = {
      PRODUCTIVE: 0,
      UNPRODUCTIVE: 0,
      PLANNED: 0,
    };

    let totalDuration = 0;

    downtimes.forEach(dt => {
      const duration = dt.duration || 0;
      totalDuration += duration;
      byType[dt.type] += duration;
    });

    res.json({
      total: downtimes.length,
      totalDurationSeconds: totalDuration,
      totalDurationFormatted: moment.duration(totalDuration, 'seconds').humanize(),
      byType: {
        productive: {
          count: downtimes.filter(dt => dt.type === 'PRODUCTIVE').length,
          durationSeconds: byType.PRODUCTIVE,
          durationFormatted: moment.duration(byType.PRODUCTIVE, 'seconds').humanize(),
        },
        unproductive: {
          count: downtimes.filter(dt => dt.type === 'UNPRODUCTIVE').length,
          durationSeconds: byType.UNPRODUCTIVE,
          durationFormatted: moment.duration(byType.UNPRODUCTIVE, 'seconds').humanize(),
        },
        planned: {
          count: downtimes.filter(dt => dt.type === 'PLANNED').length,
          durationSeconds: byType.PLANNED,
          durationFormatted: moment.duration(byType.PLANNED, 'seconds').humanize(),
        },
      },
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de paradas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
}


