/**
 * Controller de Relatórios
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Relatório de Produção
 */
export const getProductionReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {
      startDate: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };
    
    if (companyId) {
      whereClause.productionOrder = {
        item: {
          companyId: parseInt(companyId as string),
        },
      };
    }
    
    const productions = await prisma.production.findMany({
      where: whereClause,
      include: {
        productionOrder: {
          include: {
            item: true,
            color: true,
          },
        },
        plcConfig: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    const reportData = productions.map(prod => ({
      'Data Início': prod.startDate ? new Date(prod.startDate).toLocaleDateString('pt-BR') : '-',
      'Data Fim': prod.endDate ? new Date(prod.endDate).toLocaleDateString('pt-BR') : '-',
      'Ordem': prod.productionOrder?.orderNumber || '-',
      'Item': prod.productionOrder?.item?.name || '-',
      'Cor': prod.productionOrder?.color?.name || '-',
      'Máquina': prod.plcConfig?.name || '-',
      'Qtd Planejada': prod.productionOrder?.plannedQuantity || 0,
      'Qtd Produzida': prod.quantityProduced || 0,
      'Qtd Rejeitada': prod.quantityRejected || 0,
      'Qtd Boa': (prod.quantityProduced || 0) - (prod.quantityRejected || 0),
      'Eficiência (%)': prod.productionOrder?.plannedQuantity 
        ? (((prod.quantityProduced || 0) / prod.productionOrder.plannedQuantity) * 100).toFixed(2)
        : '0.00',
    }));
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de produção:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de produção' });
  }
};

/**
 * Relatório de Defeitos
 */
export const getDefectsReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {
      createdAt: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };
    
    if (companyId) {
      whereClause.production = {
        productionOrder: {
          item: {
            companyId: parseInt(companyId as string),
          },
        },
      };
    }
    
    const defects = await prisma.productionDefect.findMany({
      where: whereClause,
      include: {
        defect: {
          include: {
            responsibleSectors: true,
          },
        },
        production: {
          include: {
            productionOrder: {
              include: {
                item: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    const reportData = defects.map(defect => ({
      'Data': new Date(defect.createdAt).toLocaleDateString('pt-BR'),
      'Hora': new Date(defect.createdAt).toLocaleTimeString('pt-BR'),
      'Defeito': defect.defect?.name || '-',
      'Severidade': defect.defect?.severity || '-',
      'Item': defect.production?.productionOrder?.item?.name || '-',
      'Quantidade': defect.quantity,
      'Setores Responsáveis': defect.defect?.responsibleSectors?.map(s => s.name).join(', ') || '-',
      'Observações': defect.notes || '-',
    }));
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de defeitos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de defeitos' });
  }
};

/**
 * Relatório de Paradas (Downtime)
 */
export const getDowntimeReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {
      startTime: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };
    
    if (companyId) {
      whereClause.productionOrder = {
        item: {
          companyId: parseInt(companyId as string),
        },
      };
    }
    
    const downtimes = await prisma.downtime.findMany({
      where: whereClause,
      include: {
        activityType: {
          include: {
            sectors: {
              include: {
                sector: true,
              },
            },
          },
        },
        productionOrder: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    
    const reportData = downtimes.map(downtime => {
      const duration = downtime.endTime 
        ? Math.round((new Date(downtime.endTime).getTime() - new Date(downtime.startTime).getTime()) / 60000)
        : 0;
      
      return {
        'Data Início': new Date(downtime.startTime).toLocaleDateString('pt-BR'),
        'Hora Início': new Date(downtime.startTime).toLocaleTimeString('pt-BR'),
        'Data Fim': downtime.endTime ? new Date(downtime.endTime).toLocaleDateString('pt-BR') : '-',
        'Hora Fim': downtime.endTime ? new Date(downtime.endTime).toLocaleTimeString('pt-BR') : '-',
        'Duração (min)': duration,
        'Atividade': downtime.activityType?.name || '-',
        'Tipo': downtime.type === 'PRODUCTIVE' ? 'Produtiva' : 'Improdutiva',
        'Item': downtime.productionOrder?.item?.name || '-',
        'Ordem': downtime.productionOrder?.orderNumber || '-',
        'Setores Vinculados': downtime.activityType?.sectors?.map(s => s.sector.name).join(', ') || '-',
        'Observações': downtime.notes || '-',
      };
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de paradas:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de paradas' });
  }
};

/**
 * Relatório de Eficiência (OEE)
 */
export const getEfficiencyReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {
      startDate: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };
    
    if (companyId) {
      whereClause.productionOrder = {
        item: {
          companyId: parseInt(companyId as string),
        },
      };
    }
    
    const productions = await prisma.production.findMany({
      where: whereClause,
      include: {
        productionOrder: {
          include: {
            item: true,
          },
        },
        plcConfig: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    const reportData = productions.map(prod => {
      const plannedTime = prod.startDate && prod.endDate
        ? Math.round((new Date(prod.endDate).getTime() - new Date(prod.startDate).getTime()) / 60000)
        : 0;
      
      const produced = prod.quantityProduced || 0;
      const rejected = prod.quantityRejected || 0;
      const good = produced - rejected;
      const planned = prod.productionOrder?.plannedQuantity || 0;
      
      const availability = plannedTime > 0 ? 100 : 0; // Simplificado
      const performance = planned > 0 ? Math.min((produced / planned) * 100, 100) : 0;
      const quality = produced > 0 ? (good / produced) * 100 : 0;
      const oee = (availability * performance * quality) / 10000;
      
      return {
        'Data': prod.startDate ? new Date(prod.startDate).toLocaleDateString('pt-BR') : '-',
        'Ordem': prod.productionOrder?.orderNumber || '-',
        'Item': prod.productionOrder?.item?.name || '-',
        'Máquina': prod.plcConfig?.name || '-',
        'Tempo Planejado (min)': plannedTime,
        'Qtd Planejada': planned,
        'Qtd Produzida': produced,
        'Qtd Rejeitada': rejected,
        'Qtd Boa': good,
        'Disponibilidade (%)': availability.toFixed(2),
        'Performance (%)': performance.toFixed(2),
        'Qualidade (%)': quality.toFixed(2),
        'OEE (%)': oee.toFixed(2),
      };
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de eficiência:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de eficiência' });
  }
};

/**
 * Relatório de Ordens de Produção
 */
export const getOrdersReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {
      plannedStartDate: {
        gte: startDate ? new Date(startDate as string) : undefined,
        lte: endDate ? new Date(endDate as string) : undefined,
      },
    };
    
    if (companyId) {
      whereClause.item = {
        companyId: parseInt(companyId as string),
      };
    }
    
    const orders = await prisma.productionOrder.findMany({
      where: whereClause,
      include: {
        item: true,
        color: true,
        mold: true,
        plcConfig: true,
      },
      orderBy: {
        plannedStartDate: 'desc',
      },
    });
    
    const reportData = orders.map(order => {
      const progress = order.plannedQuantity > 0
        ? ((order.producedQuantity / order.plannedQuantity) * 100).toFixed(2)
        : '0.00';
      
      const statusMap: any = {
        PROGRAMMING: 'Programação',
        ACTIVE: 'Ativa',
        PAUSED: 'Pausada',
        FINISHED: 'Finalizada',
        CANCELLED: 'Cancelada',
      };
      
      return {
        'Nº Ordem': order.orderNumber,
        'Status': statusMap[order.status] || order.status,
        'Item': order.item?.name || '-',
        'Cor': order.color?.name || '-',
        'Molde': order.mold?.name || '-',
        'Máquina': order.plcConfig?.name || '-',
        'Qtd Planejada': order.plannedQuantity,
        'Qtd Produzida': order.producedQuantity,
        'Qtd Rejeitada': order.rejectedQuantity,
        'Progresso (%)': progress,
        'Prioridade': order.priority,
        'Data Início Planejada': new Date(order.plannedStartDate).toLocaleDateString('pt-BR'),
        'Data Fim Planejada': new Date(order.plannedEndDate).toLocaleDateString('pt-BR'),
        'Data Início Real': order.startDate ? new Date(order.startDate).toLocaleDateString('pt-BR') : '-',
        'Data Fim Real': order.endDate ? new Date(order.endDate).toLocaleDateString('pt-BR') : '-',
        'Observações': order.notes || '-',
      };
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de ordens:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de ordens' });
  }
};

