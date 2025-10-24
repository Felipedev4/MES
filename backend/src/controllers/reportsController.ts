/**
 * Controller de Relatórios
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Relatório de Produção Detalhado
 */
export const getProductionReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {};
    
    // Filtro de data
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        // Início do dia (00:00:00)
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        whereClause.timestamp.gte = start;
      }
      if (endDate) {
        // Fim do dia (23:59:59.999)
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.timestamp.lte = end;
      }
    }
    
    // Filtro de empresa
    if (companyId) {
      whereClause.productionOrder = {
        item: {
          companyId: parseInt(companyId as string),
        },
      };
    }
    
    console.log('📊 [Relatório Produção] Filtros aplicados:', JSON.stringify(whereClause, null, 2));
    
    const appointments = await prisma.productionAppointment.findMany({
      where: whereClause,
      include: {
        productionOrder: {
          include: {
            item: true,
            color: true,
            mold: true,
            plcConfig: true,
            sector: true,
          },
        },
        user: {
          include: {
            shift: true, // Turno padrão do operador
          },
        },
        shift: true, // Turno do apontamento
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
    
    console.log(`📊 [Relatório Produção] Encontrados ${appointments.length} apontamentos`);
    
    const reportData = appointments.map((appt: any) => {
      const durationMinutes = appt.durationSeconds ? Math.round(appt.durationSeconds / 60) : 0;
      const quantityGood = (appt.quantity || 0) - (appt.rejectedQuantity || 0);
      const rejectionRate = appt.quantity > 0 ? ((appt.rejectedQuantity / appt.quantity) * 100).toFixed(2) : '0.00';
      const productionRate = durationMinutes > 0 ? ((appt.quantity / durationMinutes) * 60).toFixed(2) : '0.00';
      const cavities = appt.productionOrder?.mold?.activeCavities || appt.productionOrder?.mold?.cavities || 1;
      const cycleTime = appt.productionOrder?.mold?.cycleTime || 0;
      
      // Usar turno cadastrado ou calcular dinamicamente
      let shift = '';
      if (appt.shift) {
        shift = `${appt.shift.name} (${appt.shift.startTime}-${appt.shift.endTime})`;
      } else {
        // Fallback: determinar turno baseado na hora (se não tiver turno cadastrado)
        const hour = new Date(appt.timestamp).getHours();
        if (hour >= 6 && hour < 14) shift = '1º Turno (06:00-14:00)';
        else if (hour >= 14 && hour < 22) shift = '2º Turno (14:00-22:00)';
        else shift = '3º Turno (22:00-06:00)';
      }
      
      // Formatar datas de início e fim se existirem
      const dataInicio = appt.startTime 
        ? new Date(appt.startTime).toLocaleDateString('pt-BR') + ' ' + new Date(appt.startTime).toLocaleTimeString('pt-BR')
        : '-';
      const dataFim = appt.endTime 
        ? new Date(appt.endTime).toLocaleDateString('pt-BR') + ' ' + new Date(appt.endTime).toLocaleTimeString('pt-BR')
        : '-';
      
      // Turno padrão do operador
      const operatorShift = appt.user?.shift 
        ? `${appt.user.shift.name} (${appt.user.shift.code})`
        : '-';
      
      return {
        'Data Apontamento': new Date(appt.timestamp).toLocaleDateString('pt-BR'),
        'Hora Apontamento': new Date(appt.timestamp).toLocaleTimeString('pt-BR'),
        'Data/Hora Início': dataInicio,
        'Data/Hora Fim': dataFim,
        'Turno do Apontamento': shift,
        'Ordem': appt.productionOrder?.orderNumber || '-',
        'Item': appt.productionOrder?.item?.name || '-',
        'Referência': appt.productionOrder?.item?.code || '-',
        'Cor': appt.productionOrder?.color?.name || '-',
        'Molde': appt.productionOrder?.mold?.name || '-',
        'Cavidades': cavities,
        'Tempo Ciclo (s)': cycleTime,
        'Máquina/CLP': appt.productionOrder?.plcConfig?.name || '-',
        'Setor': appt.productionOrder?.sector?.name || '-',
        'Operador/Colaborador': appt.user?.name || '-',
        'Matrícula': appt.user?.employeeCode || '-',
        'Turno do Operador': operatorShift,
        'Tipo Apontamento': appt.automatic ? 'Automático (CLP)' : 'Manual',
        'Qtd Produzida': appt.quantity || 0,
        'Qtd Rejeitada': appt.rejectedQuantity || 0,
        'Qtd Aprovada': quantityGood,
        'Taxa Rejeição (%)': rejectionRate,
        'Duração (min)': durationMinutes || '-',
        'Taxa Produção (pçs/h)': productionRate,
        'Eficiência Cavidades (%)': cavities > 0 ? ((appt.quantity / (cavities * Math.max(1, durationMinutes))) * 100).toFixed(2) : '0.00',
        'Observações': appt.notes || '-',
      };
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de produção:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de produção' });
  }
};

/**
 * Relatório de Defeitos Detalhado
 */
export const getDefectsReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {};
    
    // Filtro de data
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        whereClause.createdAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }
    
    if (companyId) {
      whereClause.productionOrder = {
        item: {
          companyId: parseInt(companyId as string),
        },
      };
    }
    
    const defects = await prisma.productionDefect.findMany({
      where: whereClause,
      include: {
        defect: {
          include: {
            defectSectors: {
              include: {
                sector: true,
              },
            },
          },
        },
        productionOrder: {
          include: {
            item: true,
            color: true,
            mold: true,
            plcConfig: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    const reportData = defects.map((defect: any) => {
      const hour = new Date(defect.createdAt).getHours();
      let shift = '';
      if (hour >= 6 && hour < 14) shift = '1º Turno';
      else if (hour >= 14 && hour < 22) shift = '2º Turno';
      else shift = '3º Turno';
      
      const totalProduced = defect.productionOrder?.producedQuantity || 0;
      const defectRate = totalProduced > 0 ? ((defect.quantity / totalProduced) * 100).toFixed(2) : '0.00';
      
      // Custo estimado (valor simbólico - ajustar conforme necessário)
      const estimatedCost = (defect.quantity * 0.50).toFixed(2); // R$ 0,50 por peça defeituosa
      
      return {
        'Data': new Date(defect.createdAt).toLocaleDateString('pt-BR'),
        'Hora': new Date(defect.createdAt).toLocaleTimeString('pt-BR'),
        'Turno': shift,
        'Ordem': defect.productionOrder?.orderNumber || '-',
        'Item': defect.productionOrder?.item?.name || '-',
        'Referência': defect.productionOrder?.item?.code || '-',
        'Cor': defect.productionOrder?.color?.name || '-',
        'Molde': defect.productionOrder?.mold?.name || '-',
        'Máquina/CLP': defect.productionOrder?.plcConfig?.name || '-',
        'Defeito': defect.defect?.name || '-',
        'Código Defeito': defect.defect?.code || '-',
        'Severidade': defect.defect?.severity || '-',
        'Qtd Defeituosa': defect.quantity,
        'Total Produzido': totalProduced,
        'Taxa Defeito (%)': defectRate,
        'Custo Estimado (R$)': estimatedCost,
        'Setores Responsáveis': defect.defect?.defectSectors?.map((ds: any) => ds.sector.name).join(', ') || '-',
        'Descrição': defect.defect?.description || '-',
        'Observações': defect.notes || '-',
      };
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de defeitos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de defeitos' });
  }
};

/**
 * Relatório de Paradas (Downtime) Detalhado
 */
export const getDowntimeReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, companyId } = req.query;
    
    const whereClause: any = {};
    
    // Filtro de data
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        whereClause.startTime.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.startTime.lte = end;
      }
    }
    
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
            activityTypeSectors: {
              include: {
                sector: true,
              },
            },
          },
        },
        productionOrder: {
          include: {
            item: true,
            plcConfig: true,
          },
        },
        responsible: {
          include: {
            shift: true, // Turno padrão do operador responsável
          },
        },
        defect: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
    
    // Calcular tempo total para percentuais
    const totalMinutes = downtimes.reduce((sum, dt) => {
      const duration = dt.endTime 
        ? Math.round((new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 60000)
        : 0;
      return sum + duration;
    }, 0);
    
    const reportData = downtimes.map((downtime: any) => {
      const duration = downtime.endTime 
        ? Math.round((new Date(downtime.endTime).getTime() - new Date(downtime.startTime).getTime()) / 60000)
        : 0;
      
      const durationHours = (duration / 60).toFixed(2);
      const percentOfTotal = totalMinutes > 0 ? ((duration / totalMinutes) * 100).toFixed(2) : '0.00';
      
      // Custo estimado da parada (R$ 100/hora de máquina parada - ajustar conforme necessário)
      const estimatedCost = (parseFloat(durationHours) * 100).toFixed(2);
      
      const hour = new Date(downtime.startTime).getHours();
      let shift = '';
      if (hour >= 6 && hour < 14) shift = '1º Turno';
      else if (hour >= 14 && hour < 22) shift = '2º Turno';
      else shift = '3º Turno';
      
      // Turno padrão do operador responsável
      const operatorShift = downtime.responsible?.shift 
        ? `${downtime.responsible.shift.name} (${downtime.responsible.shift.code})`
        : '-';
      
      return {
        'Data Início': new Date(downtime.startTime).toLocaleDateString('pt-BR'),
        'Hora Início': new Date(downtime.startTime).toLocaleTimeString('pt-BR'),
        'Data Fim': downtime.endTime ? new Date(downtime.endTime).toLocaleDateString('pt-BR') : 'Em Andamento',
        'Hora Fim': downtime.endTime ? new Date(downtime.endTime).toLocaleTimeString('pt-BR') : '-',
        'Turno da Parada': shift,
        'Duração (min)': duration,
        'Duração (h)': durationHours,
        '% do Total': percentOfTotal,
        'Ordem': downtime.productionOrder?.orderNumber || '-',
        'Item': downtime.productionOrder?.item?.name || '-',
        'Máquina/CLP': downtime.productionOrder?.plcConfig?.name || '-',
        'Atividade': downtime.activityType?.name || '-',
        'Código Atividade': downtime.activityType?.code || '-',
        'Tipo': downtime.type === 'PRODUCTIVE' ? 'Produtiva' : 'Improdutiva',
        'Classificação': downtime.type === 'PRODUCTIVE' ? 'Setup/Troca' : 'Falha/Manutenção',
        'Operador Responsável': downtime.responsible?.name || '-',
        'Matrícula Operador': downtime.responsible?.employeeCode || '-',
        'Turno do Operador': operatorShift,
        'Defeito Relacionado': downtime.defect?.name || '-',
        'Setores Responsáveis': downtime.activityType?.activityTypeSectors?.map((ats: any) => ats.sector.name).join(', ') || '-',
        'Custo Estimado (R$)': estimatedCost,
        'Observações': downtime.description || '-',
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
    
    const whereClause: any = {};
    
    // Filtro de data
    if (startDate || endDate) {
      whereClause.plannedStartDate = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        whereClause.plannedStartDate.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.plannedStartDate.lte = end;
      }
    }
    
    if (companyId) {
      whereClause.item = {
        companyId: parseInt(companyId as string),
      };
    }
    
    const orders = await prisma.productionOrder.findMany({
      where: whereClause,
      include: {
        item: true,
        plcConfig: true,
        mold: true,
        downtimes: true,
        productionAppointments: {
          include: {
            user: {
              include: {
                shift: true, // Turno padrão dos operadores
              },
            },
          },
        },
      },
      orderBy: {
        plannedStartDate: 'desc',
      },
    });
    
    const reportData = orders.map((order: any) => {
      // Cálculo de tempos
      const plannedTime = order.plannedEndDate && order.plannedStartDate
        ? Math.round((new Date(order.plannedEndDate).getTime() - new Date(order.plannedStartDate).getTime()) / 60000)
        : 0;
      
      const actualStartDate = order.actualStartDate ? new Date(order.actualStartDate) : null;
      const actualEndDate = order.actualEndDate ? new Date(order.actualEndDate) : null;
      const actualTime = actualStartDate && actualEndDate
        ? Math.round((actualEndDate.getTime() - actualStartDate.getTime()) / 60000)
        : 0;
      
      // Tempo de paradas
      const downtimeMinutes = order.downtimes?.reduce((sum: number, dt: any) => {
        const duration = dt.endTime 
          ? Math.round((new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 60000)
          : 0;
        return sum + duration;
      }, 0) || 0;
      
      const productiveDowntime = order.downtimes?.reduce((sum: number, dt: any) => {
        if (dt.type === 'PRODUCTIVE') {
          const duration = dt.endTime 
            ? Math.round((new Date(dt.endTime).getTime() - new Date(dt.startTime).getTime()) / 60000)
            : 0;
          return sum + duration;
        }
        return sum;
      }, 0) || 0;
      
      const unproductiveDowntime = downtimeMinutes - productiveDowntime;
      
      // Tempo operacional real (sem paradas improdutivas)
      const operatingTime = Math.max(0, actualTime - unproductiveDowntime);
      
      // Cálculos OEE
      const availability = plannedTime > 0 
        ? ((operatingTime / plannedTime) * 100).toFixed(2) 
        : '0.00';
      
      const performance = order.plannedQuantity > 0 
        ? ((order.producedQuantity / order.plannedQuantity) * 100).toFixed(2) 
        : '0.00';
      
      const quality = order.producedQuantity > 0 
        ? (((order.producedQuantity - order.rejectedQuantity) / order.producedQuantity) * 100).toFixed(2) 
        : '0.00';
      
      const oee = ((parseFloat(availability) * parseFloat(performance) * parseFloat(quality)) / 10000).toFixed(2);
      
      // Métricas adicionais
      const cycleTimeIdeal = order.mold?.cycleTime || 0;
      const cycleTimeReal = order.producedQuantity > 0 && operatingTime > 0
        ? (operatingTime * 60 / order.producedQuantity).toFixed(2)
        : '0.00';
      
      const speedLoss = cycleTimeIdeal > 0 && parseFloat(cycleTimeReal) > cycleTimeIdeal
        ? (((parseFloat(cycleTimeReal) - cycleTimeIdeal) / cycleTimeIdeal) * 100).toFixed(2)
        : '0.00';
      
      const utilizationRate = plannedTime > 0
        ? ((actualTime / plannedTime) * 100).toFixed(2)
        : '0.00';
      
      // Operadores envolvidos (únicos)
      const operators = order.productionAppointments
        ?.map((appt: any) => appt.user)
        .filter((user: any, index: number, self: any[]) => 
          user && self.findIndex((u: any) => u?.id === user?.id) === index
        ) || [];
      
      const operatorNames = operators.map((user: any) => user.name).join(', ') || '-';
      const operatorShifts = operators
        .map((user: any) => user.shift ? `${user.name}: ${user.shift.name} (${user.shift.code})` : `${user.name}: Sem turno`)
        .join('; ') || '-';
      
      return {
        'Data': order.plannedStartDate ? new Date(order.plannedStartDate).toLocaleDateString('pt-BR') : '-',
        'Ordem': order.orderNumber,
        'Item': order.item?.name || '-',
        'Referência': order.item?.code || '-',
        'Molde': order.mold?.name || '-',
        'Cavidades': order.mold?.activeCavities || order.mold?.cavities || 1,
        'Máquina/CLP': order.plcConfig?.name || '-',
        'Status': order.status === 'COMPLETED' ? 'Concluída' : order.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Pendente',
        'Tempo Planejado (min)': plannedTime,
        'Tempo Real (min)': actualTime,
        'Tempo Operacional (min)': operatingTime,
        'Paradas Produtivas (min)': productiveDowntime,
        'Paradas Improdutivas (min)': unproductiveDowntime,
        'Total Paradas (min)': downtimeMinutes,
        'Qtd Planejada': order.plannedQuantity,
        'Qtd Produzida': order.producedQuantity,
        'Qtd Rejeitada': order.rejectedQuantity,
        'Qtd Aprovada': order.producedQuantity - order.rejectedQuantity,
        'Tempo Ciclo Ideal (s)': cycleTimeIdeal,
        'Tempo Ciclo Real (s)': cycleTimeReal,
        'Perda Velocidade (%)': speedLoss,
        'Taxa Utilização (%)': utilizationRate,
        'Disponibilidade (%)': availability,
        'Performance (%)': performance,
        'Qualidade (%)': quality,
        'OEE (%)': oee,
        'Classificação OEE': parseFloat(oee) >= 85 ? 'Classe Mundial' : parseFloat(oee) >= 60 ? 'Boa' : parseFloat(oee) >= 40 ? 'Regular' : 'Ruim',
        'Operadores Envolvidos': operatorNames,
        'Turnos dos Operadores': operatorShifts,
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
    
    const whereClause: any = {};
    
    // Filtro de data
    if (startDate || endDate) {
      whereClause.plannedStartDate = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        whereClause.plannedStartDate.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.plannedStartDate.lte = end;
      }
    }
    
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
        sector: true,
        downtimes: true,
        productionAppointments: {
          include: {
            user: {
              include: {
                shift: true, // Turno padrão dos operadores
              },
            },
          },
        },
      },
      orderBy: {
        plannedStartDate: 'desc',
      },
    });
    
    const reportData = orders.map((order: any) => {
      // Cálculos de tempo
      const plannedTime = order.plannedEndDate && order.plannedStartDate
        ? Math.round((new Date(order.plannedEndDate).getTime() - new Date(order.plannedStartDate).getTime()) / 60000)
        : 0;
      
      const actualTime = order.actualEndDate && order.actualStartDate
        ? Math.round((new Date(order.actualEndDate).getTime() - new Date(order.actualStartDate).getTime()) / 60000)
        : 0;
      
      const timeDeviation = actualTime - plannedTime;
      const timeDeviationPercent = plannedTime > 0 
        ? ((timeDeviation / plannedTime) * 100).toFixed(2) 
        : '0.00';
      
      // Cálculos de quantidade
      const quantityGood = order.producedQuantity - order.rejectedQuantity;
      const completionRate = order.plannedQuantity > 0 
        ? ((order.producedQuantity / order.plannedQuantity) * 100).toFixed(2) 
        : '0.00';
      
      const efficiencyRate = order.plannedQuantity > 0 
        ? ((quantityGood / order.plannedQuantity) * 100).toFixed(2) 
        : '0.00';
      
      // Cálculos de custo (valores estimados - ajustar conforme necessário)
      const materialCostPerPiece = 0.80; // R$ 0,80 por peça
      const laborCostPerHour = 50; // R$ 50/hora
      
      const materialCost = (order.producedQuantity * materialCostPerPiece).toFixed(2);
      const laborCost = ((actualTime / 60) * laborCostPerHour).toFixed(2);
      const wasteCost = (order.rejectedQuantity * materialCostPerPiece).toFixed(2);
      const totalCost = (parseFloat(materialCost) + parseFloat(laborCost) + parseFloat(wasteCost)).toFixed(2);
      
      const costPerPiece = order.producedQuantity > 0 
        ? (parseFloat(totalCost) / order.producedQuantity).toFixed(2) 
        : '0.00';
      
      // Tempo médio por peça
      const avgTimePerPiece = order.producedQuantity > 0 && actualTime > 0
        ? (actualTime / order.producedQuantity).toFixed(2)
        : '0.00';
      
      // Operadores envolvidos (únicos)
      const operators = order.productionAppointments
        ?.map((appt: any) => appt.user)
        .filter((user: any, index: number, self: any[]) => 
          user && self.findIndex((u: any) => u?.id === user?.id) === index
        ) || [];
      
      const operatorNames = operators.map((user: any) => user.name).join(', ') || '-';
      const operatorShifts = operators
        .map((user: any) => user.shift ? `${user.name}: ${user.shift.name} (${user.shift.code})` : `${user.name}: Sem turno`)
        .join('; ') || '-';
      
      // Status de prazo
      let deadlineStatus = 'No Prazo';
      const statusMap: any = {
        PROGRAMMING: 'Programação',
        ACTIVE: 'Ativa',
        PAUSED: 'Pausada',
        FINISHED: 'Finalizada',
        CANCELLED: 'Cancelada',
      };
      
      if (order.status === 'FINISHED' || order.status === 'COMPLETED') {
        if (timeDeviation > 0) deadlineStatus = 'Atrasada';
        else if (timeDeviation < 0) deadlineStatus = 'Adiantada';
      } else if (order.status === 'ACTIVE' || order.status === 'IN_PROGRESS') {
        const now = new Date();
        if (order.plannedEndDate && now > new Date(order.plannedEndDate)) {
          deadlineStatus = 'Em Atraso';
        }
      }
      
      return {
        'Data Criação': new Date(order.createdAt).toLocaleDateString('pt-BR'),
        'Nº Ordem': order.orderNumber,
        'Item': order.item?.name || '-',
        'Referência': order.item?.code || '-',
        'Cor': order.color?.name || '-',
        'Molde': order.mold?.name || '-',
        'Cavidades': order.mold?.activeCavities || order.mold?.cavities || '-',
        'Tempo Ciclo (s)': order.mold?.cycleTime || '-',
        'Máquina/CLP': order.plcConfig?.name || '-',
        'Setor': order.sector?.name || '-',
        'Status': statusMap[order.status] || order.status,
        'Prioridade': order.priority === 'URGENT' ? 'Urgente' : order.priority === 'HIGH' ? 'Alta' : order.priority === 'MEDIUM' ? 'Média' : 'Baixa',
        'Início Planejado': order.plannedStartDate ? new Date(order.plannedStartDate).toLocaleDateString('pt-BR') + ' ' + new Date(order.plannedStartDate).toLocaleTimeString('pt-BR') : '-',
        'Fim Planejado': order.plannedEndDate ? new Date(order.plannedEndDate).toLocaleDateString('pt-BR') + ' ' + new Date(order.plannedEndDate).toLocaleTimeString('pt-BR') : '-',
        'Início Real': order.actualStartDate ? new Date(order.actualStartDate).toLocaleDateString('pt-BR') + ' ' + new Date(order.actualStartDate).toLocaleTimeString('pt-BR') : '-',
        'Fim Real': order.actualEndDate ? new Date(order.actualEndDate).toLocaleDateString('pt-BR') + ' ' + new Date(order.actualEndDate).toLocaleTimeString('pt-BR') : '-',
        'Tempo Planejado (min)': plannedTime || '-',
        'Tempo Real (min)': actualTime || '-',
        'Desvio Tempo (min)': timeDeviation || '-',
        'Desvio Tempo (%)': timeDeviationPercent,
        'Status Prazo': deadlineStatus,
        'Qtd Planejada': order.plannedQuantity,
        'Qtd Produzida': order.producedQuantity,
        'Qtd Rejeitada': order.rejectedQuantity,
        'Qtd Aprovada': quantityGood,
        'Taxa Conclusão (%)': completionRate,
        'Taxa Eficiência (%)': efficiencyRate,
        'Tempo Médio/Peça (min)': avgTimePerPiece,
        'Custo Material (R$)': materialCost,
        'Custo Mão-de-Obra (R$)': laborCost,
        'Custo Refugo (R$)': wasteCost,
        'Custo Total (R$)': totalCost,
        'Custo/Peça (R$)': costPerPiece,
        'Nº Apontamentos': order.productionAppointments?.length || 0,
        'Nº Paradas': order.downtimes?.length || 0,
        'Operadores Envolvidos': operatorNames,
        'Turnos dos Operadores': operatorShifts,
        'Notas': order.notes || '-',
      };
    });
    
    res.json(reportData);
  } catch (error) {
    console.error('Erro ao gerar relatório de ordens:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de ordens' });
  }
};

