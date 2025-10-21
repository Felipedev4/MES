/**
 * Controller de Dashboard - KPIs e estatísticas em tempo real
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';

/**
 * Obtém KPIs principais do dashboard
 */
export async function getMainKPIs(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Total de ordens de produção
    const totalOrders = await prisma.productionOrder.count({
      where: startDate || endDate ? { createdAt: dateFilter } : undefined,
    });

    // Ordens em andamento
    const ordersInProgress = await prisma.productionOrder.count({
      where: { status: 'IN_PROGRESS' },
    });

    // Total produzido
    const productionStats = await prisma.productionAppointment.aggregate({
      _sum: {
        quantity: true,
        rejectedQuantity: true,
      },
      where: startDate || endDate ? { timestamp: dateFilter } : undefined,
    });

    const totalProduced = productionStats._sum.quantity || 0;
    const totalRejected = productionStats._sum.rejectedQuantity || 0;
    
    // Taxa de qualidade
    const qualityRate = totalProduced > 0 
      ? ((totalProduced - totalRejected) / totalProduced) * 100 
      : 100;

    // Total de paradas
    const downtimeStats = await prisma.downtime.aggregate({
      _sum: {
        duration: true,
      },
      _count: true,
      where: startDate || endDate ? { startTime: dateFilter } : undefined,
    });

    const totalDowntimeSeconds = downtimeStats._sum.duration || 0;

    // Calcular OEE simplificado
    // OEE = Disponibilidade × Performance × Qualidade
    const availability = 85; // Placeholder - calcular baseado em tempo planejado vs paradas
    const performance = 90; // Placeholder - calcular baseado em tempo de ciclo
    const quality = qualityRate;
    const oee = (availability * performance * quality) / 10000;

    res.json({
      totalOrders,
      ordersInProgress,
      totalProduced,
      totalRejected,
      qualityRate: parseFloat(qualityRate.toFixed(2)),
      totalDowntime: totalDowntimeSeconds,
      totalDowntimeFormatted: moment.duration(totalDowntimeSeconds, 'seconds').humanize(),
      downtimeCount: downtimeStats._count,
      oee: parseFloat(oee.toFixed(2)),
      availability: parseFloat(availability.toFixed(2)),
      performance: parseFloat(performance.toFixed(2)),
      quality: parseFloat(quality.toFixed(2)),
    });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ error: 'Erro ao buscar KPIs' });
  }
}

/**
 * Obtém dados de produção por período (para gráficos)
 */
export async function getProductionByPeriod(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let start = startDate ? new Date(startDate as string) : moment().subtract(7, 'days').toDate();
    let end = endDate ? new Date(endDate as string) : new Date();

    const appointments = await prisma.productionAppointment.findMany({
      where: {
        timestamp: {
          gte: start,
          lte: end,
        },
      },
      include: {
        productionOrder: {
          include: { item: true },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    // Agrupar por período
    const groupedData: Record<string, { produced: number; rejected: number; count: number }> = {};
    
    appointments.forEach(app => {
      let key: string;
      
      if (groupBy === 'hour') {
        key = moment(app.timestamp).format('YYYY-MM-DD HH:00');
      } else if (groupBy === 'day') {
        key = moment(app.timestamp).format('YYYY-MM-DD');
      } else if (groupBy === 'month') {
        key = moment(app.timestamp).format('YYYY-MM');
      } else {
        key = moment(app.timestamp).format('YYYY-MM-DD');
      }

      if (!groupedData[key]) {
        groupedData[key] = { produced: 0, rejected: 0, count: 0 };
      }

      groupedData[key].produced += app.quantity;
      groupedData[key].rejected += app.rejectedQuantity;
      groupedData[key].count += 1;
    });

    const chartData = Object.entries(groupedData).map(([period, data]) => ({
      period,
      produced: data.produced,
      rejected: data.rejected,
      approved: data.produced - data.rejected,
      appointmentCount: data.count,
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Erro ao buscar produção por período:', error);
    res.status(500).json({ error: 'Erro ao buscar dados de produção' });
  }
}

/**
 * Obtém distribuição de paradas por tipo
 */
export async function getDowntimeDistribution(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const downtimes = await prisma.downtime.findMany({
      where: startDate || endDate ? { startTime: dateFilter } : undefined,
    });

    const distribution = {
      PRODUCTIVE: { count: 0, duration: 0 },
      UNPRODUCTIVE: { count: 0, duration: 0 },
      PLANNED: { count: 0, duration: 0 },
    };

    downtimes.forEach(dt => {
      distribution[dt.type].count += 1;
      distribution[dt.type].duration += dt.duration || 0;
    });

    const chartData = Object.entries(distribution).map(([type, data]) => ({
      type,
      count: data.count,
      durationSeconds: data.duration,
      durationFormatted: moment.duration(data.duration, 'seconds').humanize(),
      percentage: downtimes.length > 0 ? (data.count / downtimes.length) * 100 : 0,
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Erro ao buscar distribuição de paradas:', error);
    res.status(500).json({ error: 'Erro ao buscar distribuição de paradas' });
  }
}

/**
 * Obtém top itens mais produzidos
 */
export async function getTopItems(req: Request, res: Response): Promise<void> {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const appointments = await prisma.productionAppointment.findMany({
      where: startDate || endDate ? { timestamp: dateFilter } : undefined,
      include: {
        productionOrder: {
          include: { item: true },
        },
      },
    });

    // Agrupar por item
    const itemStats: Record<number, { item: any; totalProduced: number; totalRejected: number }> = {};

    appointments.forEach(app => {
      const itemId = app.productionOrder.itemId;
      
      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          item: app.productionOrder.item,
          totalProduced: 0,
          totalRejected: 0,
        };
      }

      itemStats[itemId].totalProduced += app.quantity;
      itemStats[itemId].totalRejected += app.rejectedQuantity;
    });

    const topItems = Object.values(itemStats)
      .sort((a, b) => b.totalProduced - a.totalProduced)
      .slice(0, parseInt(limit as string))
      .map(stat => ({
        item: stat.item,
        totalProduced: stat.totalProduced,
        totalRejected: stat.totalRejected,
        qualityRate: stat.totalProduced > 0 
          ? ((stat.totalProduced - stat.totalRejected) / stat.totalProduced) * 100 
          : 100,
      }));

    res.json(topItems);
  } catch (error) {
    console.error('Erro ao buscar top itens:', error);
    res.status(500).json({ error: 'Erro ao buscar top itens' });
  }
}

/**
 * Obtém dados em tempo real do CLP
 */
export async function getRealtimePlcData(req: Request, res: Response): Promise<void> {
  try {
    const { limit = 100 } = req.query;

    const plcData = await prisma.plcData.findMany({
      take: parseInt(limit as string),
      orderBy: { timestamp: 'desc' },
    });

    res.json(plcData.reverse()); // Reverter para ordem cronológica
  } catch (error) {
    console.error('Erro ao buscar dados do CLP:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do CLP' });
  }
}


