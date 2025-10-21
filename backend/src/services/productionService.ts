/**
 * Serviço de apontamento automático de produção
 */

import { prisma } from '../config/database';
import { modbusService } from './modbusService';
import { Server as SocketServer } from 'socket.io';

export class ProductionService {
  private io: SocketServer | null = null;
  private activeOrderId: number | null = null;
  private isInitialized: boolean = false;

  /**
   * Inicializa o serviço com Socket.io
   */
  public initialize(io: SocketServer): void {
    // Evitar múltiplas inicializações (proteção contra hot reload)
    if (this.isInitialized) {
      console.log('⚠️  Serviço de produção já está inicializado');
      return;
    }

    this.io = io;
    
    // Escutar mudanças no contador do CLP
    modbusService.on('valueChanged', async (data) => {
      await this.handleCounterChange(data);
    });

    this.isInitialized = true;
    console.log('✅ Serviço de produção inicializado');
  }

  /**
   * Define qual ordem de produção está ativa para apontamento automático
   */
  public async setActiveProductionOrder(orderId: number): Promise<void> {
    const order = await prisma.productionOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Ordem de produção não encontrada');
    }

    this.activeOrderId = orderId;
    
    console.log(`📋 Ordem de produção ${order.orderNumber} definida como ativa`);
  }

  /**
   * Remove ordem ativa
   */
  public clearActiveProductionOrder(): void {
    this.activeOrderId = null;
    console.log('📋 Ordem de produção ativa removida');
  }

  /**
   * Obtém ID da ordem ativa
   */
  public getActiveOrderId(): number | null {
    return this.activeOrderId;
  }

  /**
   * Processa mudança no contador do CLP
   */
  private async handleCounterChange(data: { oldValue: number; newValue: number; increment: number }): Promise<void> {
    if (!this.activeOrderId) {
      return; // Sem ordem ativa
    }

    try {
      const { newValue, increment } = data;

      // VALIDAÇÃO: Só grava se D33 > 0 e incremento for positivo
      if (newValue > 0 && increment > 0) {
        await this.createAutomaticAppointment(increment, newValue);
      } else if (newValue <= 0) {
        console.log('⚠️ Apontamento ignorado: D33 está em 0 ou negativo');
      }

    } catch (error) {
      console.error('Erro ao processar mudança no contador:', error);
    }
  }

  /**
   * Cria apontamento automático de produção
   */
  private async createAutomaticAppointment(quantity: number, counterValue: number): Promise<void> {
    if (!this.activeOrderId) return;

    try {
      // Buscar ordem de produção
      const order = await prisma.productionOrder.findUnique({
        where: { id: this.activeOrderId },
        include: { item: true },
      });

      if (!order) {
        console.error('Ordem de produção não encontrada');
        return;
      }

      // Criar apontamento automático (usar usuário sistema ID 1 ou criar um usuário "Sistema")
      const appointment = await prisma.productionAppointment.create({
        data: {
          productionOrderId: this.activeOrderId,
          userId: 1, // TODO: Criar usuário "Sistema" automaticamente
          quantity,
          automatic: true,
          clpCounterValue: counterValue,
          notes: `Apontamento automático via CLP - Contador: ${counterValue}`,
        },
      });

      // Atualizar quantidade produzida na ordem
      const updatedOrder = await prisma.productionOrder.update({
        where: { id: this.activeOrderId },
        data: {
          producedQuantity: {
            increment: quantity,
          },
          // Se atingiu quantidade planejada, marcar como completa
          ...(order.producedQuantity + quantity >= order.plannedQuantity && {
            status: 'COMPLETED',
            endDate: new Date(),
          }),
        },
      });

      console.log(`✅ Apontamento automático criado: ${quantity} peças`);

      // Emitir evento via WebSocket
      if (this.io) {
        this.io.emit('production:update', {
          appointment,
          order: updatedOrder,
          increment: quantity,
          total: updatedOrder.producedQuantity,
        });
      }

    } catch (error) {
      console.error('Erro ao criar apontamento automático:', error);
    }
  }

  /**
   * Cria apontamento manual
   */
  public async createManualAppointment(
    productionOrderId: number,
    userId: number,
    quantity: number,
    rejectedQuantity: number = 0,
    notes?: string
  ): Promise<any> {
    const order = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
    });

    if (!order) {
      throw new Error('Ordem de produção não encontrada');
    }

    // Criar apontamento
    const appointment = await prisma.productionAppointment.create({
      data: {
        productionOrderId,
        userId,
        quantity,
        rejectedQuantity,
        automatic: false,
        notes,
      },
    });

    // Atualizar ordem de produção
    const updatedOrder = await prisma.productionOrder.update({
      where: { id: productionOrderId },
      data: {
        producedQuantity: {
          increment: quantity,
        },
        rejectedQuantity: {
          increment: rejectedQuantity,
        },
      },
    });

    // Emitir evento via WebSocket
    if (this.io) {
      this.io.emit('production:update', {
        appointment,
        order: updatedOrder,
        increment: quantity,
        total: updatedOrder.producedQuantity,
      });
    }

    return { appointment, order: updatedOrder };
  }

  /**
   * Obtém estatísticas de produção em tempo real
   */
  public async getProductionStats(orderId?: number): Promise<any> {
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

export const productionService = new ProductionService();


