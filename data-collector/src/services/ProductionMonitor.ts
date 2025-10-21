/**
 * Monitora produção e cria apontamentos automáticos
 */

import { prisma } from '../config/database';
import { logger, logAppointmentCreated } from '../utils/logger';

interface ValueChangedData {
  plcConfigId: number;
  plcName: string;
  sectorId: number | null;
  register: {
    id: number;
    name: string;
    address: number;
  };
  previousValue: number;
  value: number;
  increment: number;
  timestamp: Date;
}

/**
 * Monitor de produção
 */
export class ProductionMonitor {
  /**
   * Processa mudança de valor de registro
   */
  public async handleValueChange(data: ValueChangedData): Promise<void> {
    try {
      // Verificar se há ordens de produção ativas
      const activeOrders = await this.getActiveOrders(data.sectorId);

      if (activeOrders.length === 0) {
        logger.debug(`Nenhuma ordem ativa para o setor do CLP "${data.plcName}"`);
        return;
      }

      // Processar apenas se incremento for positivo
      if (data.increment <= 0) {
        logger.debug(`Incremento não positivo (${data.increment}), ignorando apontamento`);
        return;
      }

      // Processar cada ordem ativa
      for (const order of activeOrders) {
        await this.createAppointment(order, data);
      }

    } catch (error) {
      logger.error('Erro ao processar mudança de valor:', error);
    }
  }

  /**
   * Busca ordens de produção ativas
   */
  private async getActiveOrders(sectorId: number | null) {
    const where: any = {
      status: 'IN_PROGRESS',
    };

    // Filtrar por setor se fornecido
    if (sectorId) {
      where.sectorId = sectorId;
    }

    return await prisma.productionOrder.findMany({
      where,
      include: {
        item: true,
        sector: true,
      },
    });
  }

  /**
   * Cria apontamento automático
   */
  private async createAppointment(order: any, data: ValueChangedData): Promise<void> {
    try {
      // Buscar ou criar usuário "Sistema" para apontamentos automáticos
      const systemUser = await this.getSystemUser();

      // Criar apontamento
      const appointment = await prisma.productionAppointment.create({
        data: {
          productionOrderId: order.id,
          userId: systemUser.id,
          quantity: data.increment,
          automatic: true,
          clpCounterValue: data.value,
          notes: `Apontamento automático via CLP "${data.plcName}" - Registro: ${data.register.name} - Valor: ${data.value}`,
        },
      });

      // Atualizar quantidade produzida na ordem
      const newProducedQuantity = order.producedQuantity + data.increment;
      const isCompleted = newProducedQuantity >= order.plannedQuantity;

      const updatedOrder = await prisma.productionOrder.update({
        where: { id: order.id },
        data: {
          producedQuantity: newProducedQuantity,
          ...(isCompleted && {
            status: 'COMPLETED',
            endDate: new Date(),
          }),
        },
      });

      logAppointmentCreated(order.orderNumber, data.increment, newProducedQuantity);

      if (isCompleted) {
        logger.info(`🎉 Ordem ${order.orderNumber} CONCLUÍDA! (${newProducedQuantity}/${order.plannedQuantity})`);
      }

    } catch (error) {
      logger.error(`Erro ao criar apontamento para ordem ${order.orderNumber}:`, error);
    }
  }

  /**
   * Obtém ou cria usuário "Sistema" para apontamentos automáticos
   */
  private async getSystemUser() {
    let systemUser = await prisma.user.findFirst({
      where: { email: 'sistema@mes.local' },
    });

    if (!systemUser) {
      logger.info('Criando usuário "Sistema" para apontamentos automáticos...');
      systemUser = await prisma.user.create({
        data: {
          email: 'sistema@mes.local',
          password: 'N/A', // Usuário não faz login
          name: 'Sistema (Automático)',
          role: 'OPERATOR',
          active: false, // Não pode fazer login
        },
      });
      logger.info('✅ Usuário "Sistema" criado');
    }

    return systemUser;
  }

  /**
   * Obtém estatísticas de produção
   */
  public async getProductionStats(orderId?: number) {
    const where = orderId ? { productionOrderId: orderId } : {};

    const stats = await prisma.productionAppointment.aggregate({
      where,
      _sum: {
        quantity: true,
        rejectedQuantity: true,
      },
      _count: true,
    });

    return {
      totalProduced: stats._sum.quantity || 0,
      totalRejected: stats._sum.rejectedQuantity || 0,
      totalAppointments: stats._count,
      qualityRate: stats._sum.quantity 
        ? ((stats._sum.quantity - (stats._sum.rejectedQuantity || 0)) / stats._sum.quantity) * 100 
        : 100,
    };
  }
}

