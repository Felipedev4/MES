/**
 * Controller de Paradas (Downtime)
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import moment from 'moment';
import { AuthenticatedRequest, getCompanyFilter } from '../middleware/companyFilter';
import { sendDowntimeNotification, sendActivityDowntimeNotification } from '../services/emailService';

/**
 * Lista todas as paradas (filtrado por empresa)
 */
export async function listDowntimes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { type, startDate, endDate, productionOrderId, reason } = req.query;
    
    const companyFilter = getCompanyFilter(req, false);
    
    const where: any = {
      productionOrder: {
        ...companyFilter,
      },
    };
    
    if (type) {
      where.type = type;
    }
    
    if (productionOrderId) {
      where.productionOrderId = parseInt(productionOrderId as string);
    }
    
    if (reason) {
      where.reason = reason;
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
      defectId, // Novo campo para vincular defeito
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

    // Validar defeito se fornecido
    if (defectId) {
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
      });

      if (!defect) {
        res.status(404).json({ error: 'Defeito não encontrado' });
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
        defectId, // Incluir defeito
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
      },
      include: {
        productionOrder: true,
        responsible: true,
        defect: true,
      },
    });

    // ⚡ NOTIFICAR SETORES RESPONSÁVEIS (assíncrono, não bloqueia resposta)
    if (defectId && productionOrderId && type === 'UNPRODUCTIVE') {
      // Enviar notificações em background apenas para paradas improdutivas
      sendDowntimeNotification(downtime.id, productionOrderId, defectId)
        .then((result) => {
          if (result.success) {
            console.log(`✅ Notificação de parada enviada com sucesso para: ${result.sentTo?.join(', ')}`);
          } else {
            console.warn(`⚠️ Notificação de parada não enviada: ${result.error}`);
          }
        })
        .catch((error: any) => {
          console.error('❌ Erro ao enviar notificações de parada:', error);
        });

      console.log(`📧 Processando notificações de parada para defeito ID: ${defectId}`);
    }

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
 * Busca setup ativo de uma ordem de produção
 */
export async function getActiveSetup(req: Request, res: Response): Promise<void> {
  try {
    const { productionOrderId } = req.query;

    if (!productionOrderId) {
      res.status(400).json({ error: 'productionOrderId é obrigatório' });
      return;
    }

    const activeSetup = await prisma.downtime.findFirst({
      where: {
        productionOrderId: parseInt(productionOrderId as string),
        reason: 'Setup de Molde',
        endTime: null, // Setup ainda em andamento
      },
      include: {
        productionOrder: {
          include: {
            item: true,
            mold: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activityType: true,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    res.json(activeSetup);
  } catch (error) {
    console.error('Erro ao buscar setup ativo:', error);
    res.status(500).json({ error: 'Erro ao buscar setup ativo' });
  }
}

/**
 * Inicia um setup (cria downtime de setup em andamento)
 */
export async function startSetup(req: Request, res: Response): Promise<void> {
  try {
    const { productionOrderId } = req.body;
    const userId = (req as any).userId; // ID do usuário autenticado

    // Validar ordem de produção
    const order = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        item: true,
        mold: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Obter cavidades do molde cadastrado
    const cavities = order.mold?.cavities || null;

    // Verificar se já existe um setup em andamento para esta ordem
    const activeSetup = await prisma.downtime.findFirst({
      where: {
        productionOrderId,
        reason: 'Setup de Molde',
        endTime: null, // Setup ainda em andamento
      },
    });

    if (activeSetup) {
      res.status(400).json({ 
        error: 'Já existe um setup em andamento para esta ordem',
        activeSetup,
      });
      return;
    }

    // Buscar o ActivityType de Setup
    let setupActivityType = await prisma.activityType.findFirst({
      where: { code: 'SETUP' },
    });

    // Se não existir, criar o tipo de atividade de Setup
    if (!setupActivityType) {
      setupActivityType = await prisma.activityType.create({
        data: {
          code: 'SETUP',
          name: 'Setup de Molde',
          description: 'Troca ou ajuste de molde',
          type: 'PRODUCTIVE',
          color: '#2196F3',
          active: true,
        },
      });
    }

    // Criar data no horário de Brasília (UTC-3)
    const now = new Date();
    const brasiliaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    
    // Criar o registro de downtime (setup)
    const setup = await prisma.downtime.create({
      data: {
        productionOrderId,
        activityTypeId: setupActivityType.id,
        type: 'PRODUCTIVE',
        reason: 'Setup de Molde',
        description: cavities ? `Setup iniciado - ${cavities} cavidades do molde` : 'Setup de molde iniciado',
        responsibleId: userId,
        startTime: brasiliaTime,
        endTime: null, // Ainda em andamento
        duration: null,
      },
      include: {
        productionOrder: {
          include: {
            item: true,
            mold: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activityType: true,
      },
    });

    res.status(201).json({
      message: 'Setup iniciado com sucesso',
      setup,
    });
  } catch (error) {
    console.error('Erro ao iniciar setup:', error);
    res.status(500).json({ error: 'Erro ao iniciar setup' });
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
export async function getDowntimeStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { startDate, endDate, productionOrderId } = req.query;
    
    const companyFilter = getCompanyFilter(req, false);
    
    const where: any = {
      productionOrder: {
        ...companyFilter,
      },
    };
    
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

/**
 * Registra parada de produção (pausa a ordem e cria downtime)
 */
export async function registerProductionStop(req: Request, res: Response): Promise<void> {
  try {
    const { productionOrderId, activityTypeId, startTime, description } = req.body;
    const userId = (req as any).userId; // ID do usuário autenticado

    // Validar ordem de produção
    const order = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        item: true,
        mold: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Verificar se a ordem está ativa
    if (order.status !== 'ACTIVE') {
      res.status(400).json({ 
        error: 'Ordem não está em atividade',
        details: 'Apenas ordens ATIVAS podem ser pausadas',
      });
      return;
    }

    // Buscar tipo de atividade
    const activityType = await prisma.activityType.findUnique({
      where: { id: activityTypeId },
    });

    if (!activityType) {
      res.status(404).json({ error: 'Tipo de atividade não encontrado' });
      return;
    }

    // Verificar se já existe parada ativa para esta ordem
    const activeDowntime = await prisma.downtime.findFirst({
      where: {
        productionOrderId,
        endTime: null, // Parada ainda em andamento
      },
    });

    if (activeDowntime) {
      res.status(400).json({ 
        error: 'Já existe uma parada ativa para esta ordem',
        activeDowntime,
      });
      return;
    }

    // Usar o startTime fornecido ou a data atual de Brasília
    let stopTime: Date;
    if (startTime) {
      stopTime = new Date(startTime);
    } else {
      const now = new Date();
      stopTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    }

    // Criar o registro de downtime (parada)
    const downtime = await prisma.downtime.create({
      data: {
        productionOrderId,
        activityTypeId,
        type: activityType.type as any, // PRODUCTIVE, UNPRODUCTIVE, PLANNED
        reason: activityType.name,
        description: description || `Parada: ${activityType.name}`,
        responsibleId: userId,
        startTime: stopTime,
        endTime: null, // Ainda em andamento
        duration: null,
      },
      include: {
        productionOrder: {
          include: {
            item: true,
            mold: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activityType: true,
      },
    });

    // Pausar a ordem de produção
    const updatedOrder = await prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: { status: 'PAUSED' },
      include: {
        item: true,
        mold: true,
      },
    });

    // ⚡ NOTIFICAR SETORES RESPONSÁVEIS (assíncrono, não bloqueia resposta)
    // Enviar notificações em background baseado nos setores vinculados à atividade
    sendActivityDowntimeNotification(downtime.id, productionOrderId, activityTypeId)
      .then((result) => {
        if (result.success) {
          console.log(`✅ Notificação de parada enviada com sucesso para: ${result.sentTo?.join(', ')}`);
        } else {
          console.warn(`⚠️ Notificação de parada não enviada: ${result.error}`);
        }
      })
      .catch((error: any) => {
        console.error('❌ Erro ao enviar notificações de parada:', error);
      });

    console.log(`📧 Processando notificações de parada para atividade ID: ${activityTypeId}`);

    res.status(201).json({
      message: 'Parada de produção registrada com sucesso',
      downtime,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao registrar parada de produção:', error);
    res.status(500).json({ error: 'Erro ao registrar parada de produção' });
  }
}

/**
 * Retoma produção (finaliza downtime ativo e muda status para ACTIVE)
 */
export async function resumeProduction(req: Request, res: Response): Promise<void> {
  try {
    const { productionOrderId, endTime } = req.body;

    // Validar ordem de produção
    const order = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        item: true,
        mold: true,
        plcConfig: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    // Verificar se a ordem está pausada
    if (order.status !== 'PAUSED') {
      res.status(400).json({ 
        error: 'Ordem não está pausada',
        details: 'Apenas ordens PAUSADAS podem ser retomadas',
      });
      return;
    }

    // Verificar se já existe outra ordem ACTIVE no mesmo CLP da mesma empresa antes de retomar
    if (order.plcConfigId) {
      const activeOrderInPlc = await prisma.productionOrder.findFirst({
        where: {
          status: 'ACTIVE',
          plcConfigId: order.plcConfigId,
          companyId: order.companyId, // ✅ Validar na mesma empresa
          id: { not: productionOrderId },
        },
        include: {
          plcConfig: true,
        },
      });

      if (activeOrderInPlc) {
        res.status(400).json({ 
          error: 'Já existe uma ordem em atividade neste CLP/Injetora',
          details: `A ordem ${activeOrderInPlc.orderNumber} está atualmente em atividade na injetora ${activeOrderInPlc.plcConfig?.name || 'N/A'}. Pause ou finalize esta ordem antes de retomar outra.`,
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
          id: { not: productionOrderId },
        },
      });

      if (anyActiveOrder) {
        res.status(400).json({ 
          error: 'Ordem sem CLP vinculado não pode ser retomada enquanto houver outra ordem ativa',
          details: `A ordem ${anyActiveOrder.orderNumber} está em atividade. Vincule esta ordem a um CLP ou finalize a ordem ativa.`,
        });
        return;
      }
    }

    // Buscar downtime ativo
    const activeDowntime = await prisma.downtime.findFirst({
      where: {
        productionOrderId,
        endTime: null, // Parada ainda em andamento
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    if (!activeDowntime) {
      res.status(404).json({ error: 'Nenhuma parada ativa encontrada para esta ordem' });
      return;
    }

    // Usar o endTime fornecido ou a data atual de Brasília
    let resumeTime: Date;
    if (endTime) {
      resumeTime = new Date(endTime);
    } else {
      const now = new Date();
      resumeTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
    }

    // Calcular duração
    const duration = Math.floor((resumeTime.getTime() - activeDowntime.startTime.getTime()) / 1000);

    // Finalizar o downtime
    const finishedDowntime = await prisma.downtime.update({
      where: { id: activeDowntime.id },
      data: {
        endTime: resumeTime,
        duration,
      },
      include: {
        productionOrder: {
          include: {
            item: true,
            mold: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activityType: true,
      },
    });

    // Retomar a ordem de produção (mudar para ACTIVE)
    const updatedOrder = await prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: { status: 'ACTIVE' },
      include: {
        item: true,
        mold: true,
        plcConfig: true,
      },
    });

    res.json({
      message: 'Produção retomada com sucesso',
      downtime: finishedDowntime,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Erro ao retomar produção:', error);
    res.status(500).json({ error: 'Erro ao retomar produção' });
  }
}

/**
 * Buscar logs de e-mails de notificações de paradas
 */
export async function getDowntimeEmailLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { limit } = req.query;
    const companyId = req.user?.companyId;

    if (!companyId) {
      res.status(400).json({ error: 'Empresa não selecionada' });
      return;
    }

    // Buscar logs de e-mails do tipo 'downtime_notification'
    // Como EmailLog não tem companyId direto, vamos filtrar pelos downtimes da empresa
    const logs = await prisma.emailLog.findMany({
      where: {
        emailType: 'downtime_notification',
        downtimeId: {
          not: null
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: limit ? parseInt(limit as string) : undefined,
    });

    // Para cada log, buscar informações do downtime e verificar se pertence à empresa
    const logsWithDetails = await Promise.all(
      logs.map(async (log) => {
        if (!log.downtimeId) return null;

        const downtime = await prisma.downtime.findUnique({
          where: { id: log.downtimeId },
          include: {
            productionOrder: {
              include: {
                company: true,
                item: true,
                mold: true
              }
            },
            defect: {
              include: {
                defectSectors: {
                  include: {
                    sector: true
                  }
                }
              }
            }
          }
        });

        // Filtrar apenas logs da empresa selecionada
        if (!downtime || downtime.productionOrder?.companyId !== companyId) {
          return null;
        }

        return {
          ...log,
          downtime: {
            id: downtime.id,
            reason: downtime.reason,
            startTime: downtime.startTime,
            type: downtime.type
          },
          productionOrder: downtime.productionOrder ? {
            orderNumber: downtime.productionOrder.orderNumber,
            item: downtime.productionOrder.item
          } : null,
          defect: downtime.defect ? {
            code: downtime.defect.code,
            name: downtime.defect.name,
            severity: downtime.defect.severity
          } : null,
          sectorNames: downtime.defect?.defectSectors
            .map(ds => ds.sector.name)
            .join(', ')
        };
      })
    );

    // Remover nulos (logs de outras empresas)
    const filteredLogs = logsWithDetails.filter(log => log !== null);

    res.json(filteredLogs);
  } catch (error) {
    console.error('Erro ao buscar logs de e-mails de paradas:', error);
    res.status(500).json({ error: 'Erro ao buscar logs de e-mails' });
  }
}


