/**
 * Controller de Dashboard - KPIs e estatísticas em tempo real
 */

import { Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';
import { AuthenticatedRequest, getCompanyFilter } from '../middleware/companyFilter';
import { ProductionStatus } from '@prisma/client';

/**
 * Obtém KPIs principais do dashboard - Específico para Indústria de Plástico
 */
export async function getMainKPIs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const companyFilter = getCompanyFilter(req, false);
    
    // Log para debug
    console.log('🔍 [DASHBOARD KPIs] User:', req.user);
    console.log('🔍 [DASHBOARD KPIs] CompanyFilter:', companyFilter);

    // ⚠️ FILTRO MES: Apenas ordens OPERACIONAIS (não finalizadas/canceladas)
    const operationalStatuses: ProductionStatus[] = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];

    // Total de ordens de produção (apenas operacionais)
    const totalOrders = await prisma.productionOrder.count({
      where: {
        ...companyFilter,
        status: { in: operationalStatuses },
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
    });

    // Ordens em andamento
    const ordersInProgress = await prisma.productionOrder.count({
      where: { 
        ...companyFilter,
        status: 'ACTIVE',
      },
    });

    // Total produzido (filtrar por empresa via ordem de produção)
    // ⚠️ ESTRUTURA PADRONIZADA:
    // - TODOS os apontamentos (auto + manual): clpCounterValue = peças
    // - quantity = tempo (auto: ciclo/divisor, manual: segundos direto)
    // ⚠️ FILTRO MES: Apenas apontamentos de ordens operacionais
    const productionStats = await prisma.productionAppointment.aggregate({
      _sum: {
        clpCounterValue: true,
      },
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        ...(startDate || endDate ? { timestamp: dateFilter } : {}),
      },
    });

    const totalProduced = productionStats._sum.clpCounterValue || 0;
    
    // ⚠️ CORREÇÃO: Buscar defeitos da tabela production_defects (não rejectedQuantity)
    const defectStats = await prisma.productionDefect.aggregate({
      _sum: {
        quantity: true,
      },
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
    });

    const totalRejected = defectStats._sum.quantity || 0;
    
    // Taxa de qualidade
    const qualityRate = totalProduced > 0 
      ? ((totalProduced - totalRejected) / totalProduced) * 100 
      : 100;

    // Total de paradas (filtrar por empresa via ordem de produção)
    // ⚠️ FILTRO MES: Apenas paradas de ordens operacionais
    const downtimeStats = await prisma.downtime.aggregate({
      _sum: {
        duration: true,
      },
      _count: true,
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        ...(startDate || endDate ? { startTime: dateFilter } : {}),
      },
    });

    const totalDowntimeSeconds = downtimeStats._sum.duration || 0;

    // ============ KPIs ESPECÍFICOS PARA INDÚSTRIA DE PLÁSTICO ============

    // 1. EFICIÊNCIA DE CICLO - Ciclo Real vs Teórico
    // ⚠️ FILTRO MES: Apenas ordens operacionais
    const ordersWithCycle = await prisma.productionOrder.findMany({
      where: {
        ...(companyFilter.companyId ? { companyId: companyFilter.companyId } : {}),
        status: { in: operationalStatuses },
        ...(startDate || endDate ? { startDate: dateFilter } : {}),
      },
      include: {
        mold: true,
        productionAppointments: true,
      },
    });

    let totalCycleEfficiency = 0;
    let cycleEfficiencyCount = 0;
    let totalActiveCavities = 0;
    let totalPossibleCavities = 0;

    for (const order of ordersWithCycle) {
      if (order.mold?.cycleTime && order.startDate) {
        const appointments = order.productionAppointments;
        if (appointments.length > 0) {
          // ⚠️ CORRIGIDO: Usar clpCounterValue (peças) e não quantity (tempo de ciclo)
          const totalPieces = appointments.reduce((sum, app) => sum + (app.clpCounterValue || 0), 0);
          const timeElapsed = (new Date().getTime() - new Date(order.startDate).getTime()) / 1000;
          
          // Ciclo real = tempo total / peças produzidas
          const realCyclePerPiece = totalPieces > 0 ? timeElapsed / totalPieces : 0;
          const theoreticalCycle = order.mold.cycleTime;
          
          if (realCyclePerPiece > 0) {
            const efficiency = (theoreticalCycle / realCyclePerPiece) * 100;
            totalCycleEfficiency += efficiency;
            cycleEfficiencyCount++;
          }
        }
      }
      
      // 2. UTILIZAÇÃO DE CAVIDADES
      if (order.mold) {
        const activeCavities = order.mold.activeCavities || order.mold.cavities;
        totalActiveCavities += activeCavities;
        totalPossibleCavities += order.mold.cavities;
      }
    }

    const avgCycleEfficiency = cycleEfficiencyCount > 0 
      ? totalCycleEfficiency / cycleEfficiencyCount 
      : 0;

    const cavityUtilization = totalPossibleCavities > 0 
      ? (totalActiveCavities / totalPossibleCavities) * 100 
      : 100;

    // 3. TEMPO MÉDIO DE SETUP
    // ⚠️ FILTRO MES: Apenas paradas de ordens operacionais
    const setupDowntimes = await prisma.downtime.findMany({
      where: {
        ...(companyFilter.companyId ? {
          productionOrder: {
            companyId: companyFilter.companyId,
            status: { in: operationalStatuses },
          },
        } : {}),
        reason: { contains: 'Setup', mode: 'insensitive' },
        duration: { not: null },
        ...(startDate || endDate ? { startTime: dateFilter } : {}),
      },
    });

    const avgSetupTime = setupDowntimes.length > 0
      ? setupDowntimes.reduce((sum, dt) => sum + (dt.duration || 0), 0) / setupDowntimes.length
      : 0;

    // 4. PARADAS POR TIPO
    // ⚠️ FILTRO MES: Apenas paradas de ordens operacionais
    const downtimesByType = await prisma.downtime.groupBy({
      by: ['type'],
      _sum: {
        duration: true,
      },
      _count: true,
      where: {
        ...(companyFilter.companyId ? {
          productionOrder: {
            companyId: companyFilter.companyId,
            status: { in: operationalStatuses },
          },
        } : {}),
        ...(startDate || endDate ? { startTime: dateFilter } : {}),
      },
    });

    const productiveDowntime = downtimesByType.find(d => d.type === 'PRODUCTIVE')?._sum?.duration || 0;
    const unproductiveDowntime = downtimesByType.find(d => d.type === 'UNPRODUCTIVE')?._sum?.duration || 0;
    const plannedDowntime = downtimesByType.find(d => d.type === 'PLANNED')?._sum?.duration || 0;

    // 5. DEFEITOS POR TIPO (Top 5)
    // ⚠️ FILTRO MES: Apenas defeitos de ordens operacionais
    let defectsDetailed: Array<{ defectName: string; quantity: number }> = [];
    
    try {
      const defectsByType = await prisma.productionDefect.groupBy({
        by: ['defectId'],
        _sum: {
          quantity: true,
        },
        where: {
          ...(companyFilter.companyId ? {
            productionOrder: {
              companyId: companyFilter.companyId,
              status: { in: operationalStatuses },
            },
          } : {}),
          ...(startDate || endDate ? { createdAt: dateFilter } : {}),
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
        take: 5,
      });

      defectsDetailed = await Promise.all(
        defectsByType.map(async (d) => {
          const defect = await prisma.defect.findUnique({
            where: { id: d.defectId },
          });
          return {
            defectName: defect?.name || 'Desconhecido',
            quantity: d._sum?.quantity || 0,
          };
        })
      );
    } catch (error) {
      console.error('Erro ao buscar defeitos:', error);
      defectsDetailed = [];
    }

    // 6. CALCULAR OEE REAL
    // Disponibilidade = (Tempo Planejado - Paradas Não Planejadas) / Tempo Planejado
    const plannedTime = 28800; // 8 horas em segundos (tempo padrão de trabalho)
    const unplannedDowntime = unproductiveDowntime;
    const availability = Math.max(0, Math.min(100, ((plannedTime - unplannedDowntime) / plannedTime) * 100));

    // Performance = (Produção Real × Ciclo Teórico) / Tempo de Operação
    const performance = Math.max(0, Math.min(100, avgCycleEfficiency || 0));

    // Qualidade = (Peças Boas / Total Produzido) × 100
    const quality = Math.max(0, Math.min(100, qualityRate));

    // OEE = Disponibilidade × Performance × Qualidade / 10000
    const oee = Math.max(0, Math.min(100, (availability * performance * quality) / 10000));

    // 7. INJETORAS ATIVAS
    let activeInjectors = 0;
    try {
      // PlcConfig não tem companyId, então filtramos pelas ordens de produção
      activeInjectors = await prisma.plcConfig.count({
        where: {
          productionOrders: {
            some: {
              status: 'ACTIVE',
              ...(companyFilter.companyId ? { companyId: companyFilter.companyId } : {}),
            },
          },
        },
      });
    } catch (error) {
      console.error('Erro ao contar injetoras ativas:', error);
      activeInjectors = 0;
    }

    // 8. PESO ESTIMADO PRODUZIDO (baseado em peso médio de peça)
    // Assumindo peso médio de 50g por peça (ajustar conforme necessidade)
    const estimatedWeight = (totalProduced * 0.05); // em kg

    // 9. TOTAL PLANEJADO (soma de todas as quantidades planejadas)
    // ⚠️ FILTRO MES: Apenas ordens operacionais
    let totalPlanned = 0;
    try {
      const plannedStats = await prisma.productionOrder.aggregate({
        _sum: {
          plannedQuantity: true,
        },
        where: {
          ...companyFilter,
          status: { in: operationalStatuses },
          ...(startDate || endDate ? { createdAt: dateFilter } : {}),
        },
      });
      totalPlanned = plannedStats._sum.plannedQuantity || 0;
    } catch (error) {
      console.error('Erro ao calcular total planejado:', error);
      totalPlanned = 0;
    }

    // 10. PEÇAS POR HORA (taxa de produção)
    // ⚠️ FILTRO MES: Apenas apontamentos de ordens operacionais
    let piecesPerHour = 0;
    let productionHours = 0;
    try {
      // Buscar primeiro e último apontamento para calcular tempo total de produção
      const firstAppointment = await prisma.productionAppointment.findFirst({
        where: {
          productionOrder: {
            ...companyFilter,
            status: { in: operationalStatuses },
          },
          ...(startDate || endDate ? { timestamp: dateFilter } : {}),
        },
        orderBy: { timestamp: 'asc' },
      });

      const lastAppointment = await prisma.productionAppointment.findFirst({
        where: {
          productionOrder: {
            ...companyFilter,
            status: { in: operationalStatuses },
          },
          ...(startDate || endDate ? { timestamp: dateFilter } : {}),
        },
        orderBy: { timestamp: 'desc' },
      });

      if (firstAppointment && lastAppointment) {
        const startTime = moment(firstAppointment.timestamp);
        const endTime = moment(lastAppointment.timestamp);
        const totalHours = endTime.diff(startTime, 'hours', true);
        productionHours = parseFloat(totalHours.toFixed(2));
        
        // Calcular peças por hora (se houver pelo menos 1 hora de produção)
        if (totalHours > 0) {
          piecesPerHour = Math.round(totalProduced / totalHours);
        }
      }
    } catch (error) {
      console.error('Erro ao calcular peças por hora:', error);
      piecesPerHour = 0;
      productionHours = 0;
    }

    res.json({
      // KPIs Básicos
      totalOrders: totalOrders || 0,
      ordersInProgress: ordersInProgress || 0,
      totalProduced: totalProduced || 0,
      totalRejected: totalRejected || 0,
      qualityRate: parseFloat((qualityRate || 0).toFixed(2)),
      totalDowntime: totalDowntimeSeconds || 0,
      totalDowntimeFormatted: moment.duration(totalDowntimeSeconds || 0, 'seconds').humanize(),
      downtimeCount: downtimeStats._count || 0,
      
      // OEE Calculado
      oee: parseFloat((isNaN(oee) ? 0 : oee).toFixed(2)),
      availability: parseFloat((isNaN(availability) ? 0 : availability).toFixed(2)),
      performance: parseFloat((isNaN(performance) ? 0 : performance).toFixed(2)),
      quality: parseFloat((isNaN(quality) ? 0 : quality).toFixed(2)),
      
      // KPIs Específicos para Plástico
      cycleEfficiency: parseFloat((isNaN(avgCycleEfficiency) ? 0 : avgCycleEfficiency).toFixed(2)),
      cavityUtilization: parseFloat((isNaN(cavityUtilization) ? 100 : cavityUtilization).toFixed(2)),
      avgSetupTimeMinutes: parseFloat(((avgSetupTime || 0) / 60).toFixed(2)),
      avgSetupTimeFormatted: moment.duration(avgSetupTime || 0, 'seconds').humanize(),
      setupCount: setupDowntimes.length || 0,
      
      // Paradas por Tipo
      productiveDowntime: productiveDowntime || 0,
      unproductiveDowntime: unproductiveDowntime || 0,
      plannedDowntime: plannedDowntime || 0,
      productiveDowntimeFormatted: moment.duration(productiveDowntime || 0, 'seconds').humanize(),
      unproductiveDowntimeFormatted: moment.duration(unproductiveDowntime || 0, 'seconds').humanize(),
      plannedDowntimeFormatted: moment.duration(plannedDowntime || 0, 'seconds').humanize(),
      
      // Defeitos
      topDefects: defectsDetailed || [],
      totalDefects: (defectsDetailed || []).reduce((sum, d) => sum + d.quantity, 0),
      
      // Produção
      activeInjectors: activeInjectors || 0,
      estimatedWeightKg: parseFloat((estimatedWeight || 0).toFixed(2)),
      totalPlanned: totalPlanned || 0,
      piecesPerHour: piecesPerHour || 0,
      productionHours: productionHours || 0,
      
      // Totais de Cavidades
      totalActiveCavities: totalActiveCavities || 0,
      totalPossibleCavities: totalPossibleCavities || 0,
    });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ error: 'Erro ao buscar KPIs' });
  }
}

/**
 * Obtém dados de produção por período (para gráficos)
 */
export async function getProductionByPeriod(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let start = startDate ? new Date(startDate as string) : moment().subtract(7, 'days').toDate();
    let end = endDate ? new Date(endDate as string) : new Date();

    const companyFilter = getCompanyFilter(req, false);
    
    // ⚠️ FILTRO MES: Apenas ordens operacionais
    const operationalStatuses: ProductionStatus[] = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];

    // Buscar apontamentos de produção
    const appointments = await prisma.productionAppointment.findMany({
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
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

    // ⚠️ CORREÇÃO: Buscar defeitos da tabela production_defects (não de rejectedQuantity)
    const defects = await prisma.productionDefect.findMany({
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        productionOrder: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Agrupar por período
    const groupedData: Record<string, { produced: number; rejected: number; count: number }> = {};
    
    // Agrupar produção
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

      // ⚠️ ESTRUTURA PADRONIZADA: clpCounterValue sempre = peças (auto + manual)
      groupedData[key].produced += app.clpCounterValue || 0;
      groupedData[key].count += 1;
    });

    // ⚠️ CORREÇÃO: Agrupar defeitos (perdas) da tabela production_defects
    defects.forEach(defect => {
      let key: string;
      
      if (groupBy === 'hour') {
        key = moment(defect.createdAt).format('YYYY-MM-DD HH:00');
      } else if (groupBy === 'day') {
        key = moment(defect.createdAt).format('YYYY-MM-DD');
      } else if (groupBy === 'month') {
        key = moment(defect.createdAt).format('YYYY-MM');
      } else {
        key = moment(defect.createdAt).format('YYYY-MM-DD');
      }

      if (!groupedData[key]) {
        groupedData[key] = { produced: 0, rejected: 0, count: 0 };
      }

      groupedData[key].rejected += defect.quantity;
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
export async function getDowntimeDistribution(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const companyFilter = getCompanyFilter(req, false);
    
    // ⚠️ FILTRO MES: Apenas ordens operacionais
    const operationalStatuses: ProductionStatus[] = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];

    const downtimes = await prisma.downtime.findMany({
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        ...(startDate || endDate ? { startTime: dateFilter } : {}),
      },
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
export async function getTopItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    const companyFilter = getCompanyFilter(req, false);
    
    // ⚠️ FILTRO MES: Apenas ordens operacionais
    const operationalStatuses: ProductionStatus[] = ['ACTIVE', 'PAUSED', 'PROGRAMMING'];

    const appointments = await prisma.productionAppointment.findMany({
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        ...(startDate || endDate ? { timestamp: dateFilter } : {}),
      },
      include: {
        productionOrder: {
          include: { item: true },
        },
      },
    });

    // ⚠️ CORREÇÃO: Buscar defeitos da tabela production_defects
    const defects = await prisma.productionDefect.findMany({
      where: {
        productionOrder: {
          ...companyFilter,
          status: { in: operationalStatuses },
        },
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      include: {
        productionOrder: {
          include: { item: true },
        },
      },
    });

    // Agrupar por item
    const itemStats: Record<number, { item: any; totalProduced: number; totalRejected: number }> = {};

    // Agrupar produção
    appointments.forEach(app => {
      const itemId = app.productionOrder.itemId;
      
      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          item: app.productionOrder.item,
          totalProduced: 0,
          totalRejected: 0,
        };
      }

      // ⚠️ ESTRUTURA PADRONIZADA: clpCounterValue sempre = peças (auto + manual)
      itemStats[itemId].totalProduced += app.clpCounterValue || 0;
    });

    // ⚠️ CORREÇÃO: Agrupar defeitos (não usar rejectedQuantity)
    defects.forEach(defect => {
      const itemId = defect.productionOrder.itemId;
      
      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          item: defect.productionOrder.item,
          totalProduced: 0,
          totalRejected: 0,
        };
      }

      itemStats[itemId].totalRejected += defect.quantity;
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
export async function getRealtimePlcData(req: AuthenticatedRequest, res: Response): Promise<void> {
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


