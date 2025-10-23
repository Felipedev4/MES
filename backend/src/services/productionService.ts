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

      // ⚠️ CORREÇÃO: Usar counterValue (peças) e não quantity (tempo)
      // quantity = tempo de ciclo
      // counterValue = contador de peças
      const piecesProduced = counterValue || 0;

      // Atualizar quantidade produzida na ordem
      const updatedOrder = await prisma.productionOrder.update({
        where: { id: this.activeOrderId },
        data: {
          producedQuantity: {
            increment: piecesProduced, // ← CORRIGIDO: usar contador de peças
          },
          // Se atingiu quantidade planejada, marcar como completa
          ...(order.producedQuantity + piecesProduced >= order.plannedQuantity && {
            status: 'FINISHED',
            endDate: new Date(),
          }),
        },
      });

      console.log(`✅ Apontamento automático criado: ${piecesProduced} peças (tempo: ${quantity})`);

      // Emitir evento via WebSocket
      if (this.io) {
        this.io.emit('production:update', {
          appointment,
          order: updatedOrder,
          increment: piecesProduced, // ← CORRIGIDO: emitir peças, não tempo
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
    notes?: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<any> {
    const order = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
    });

    if (!order) {
      throw new Error('Ordem de produção não encontrada');
    }

    // ⚠️ PREVENÇÃO DE DUPLICATAS - Verificar se já existe um apontamento manual muito recente
    const now = new Date();
    const timeWindow = new Date(now.getTime() - 5000); // 5 segundos antes
    
    const recentAppointment = await prisma.productionAppointment.findFirst({
      where: {
        productionOrderId,
        userId,
        automatic: false,
        quantity,
        timestamp: {
          gte: timeWindow,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Se encontrou apontamento idêntico muito recente, avisar mas permitir (pode ser legítimo)
    if (recentAppointment) {
      console.warn(`⚠️  AVISO: Apontamento manual similar detectado (menos de 5s): Usuário ${userId}, OP ${productionOrderId}, Quantidade: ${quantity}`);
      console.warn(`   Permitindo criação, mas pode ser duplicata. Verifique se é intencional.`);
    }

    // Calcular duração em segundos se tiver startTime e endTime
    let durationSeconds: number | undefined;
    if (startTime && endTime) {
      durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }

    // Usar transação para criar apontamento e defeito (se houver perda)
    const result = await prisma.$transaction(async (tx) => {
      // Criar apontamento manual
      // ⚠️ ESTRUTURA PADRONIZADA:
      // - clpCounterValue = quantidade de peças (igual automático)
      // - quantity = tempo em segundos
      // - durationSeconds = tempo em segundos (backup/referência)
      const appointment = await tx.productionAppointment.create({
        data: {
          productionOrderId,
          userId,
          clpCounterValue: quantity,        // ← Peças no clpCounterValue
          quantity: durationSeconds || 0,   // ← Tempo (segundos) no quantity
          rejectedQuantity,
          automatic: false,
          notes,
          startTime,
          endTime,
          durationSeconds,                  // ← Manter também para referência
        },
      });

      // Atualizar ordem de produção
      const updatedOrder = await tx.productionOrder.update({
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

      // Se houver quantidade rejeitada, criar registro de defeito automaticamente
      let productionDefect = null;
      if (rejectedQuantity > 0) {
        // Buscar defeito padrão para apontamentos manuais
        const defaultDefect = await tx.defect.findUnique({
          where: { code: 'MANUAL' },
        });

        if (defaultDefect) {
          productionDefect = await tx.productionDefect.create({
            data: {
              productionOrderId,
              defectId: defaultDefect.id,
              quantity: rejectedQuantity,
              notes: notes ? `Apontamento Manual - ${notes}` : 'Apontamento Manual',
            },
          });
          console.log(`✅ Registro de perda criado automaticamente: ${rejectedQuantity} peças rejeitadas (Defeito ID: ${defaultDefect.id})`);
        } else {
          console.warn('⚠️  Defeito padrão "MANUAL" não encontrado. Perda não registrada automaticamente.');
        }
      }

      return { appointment, order: updatedOrder, productionDefect };
    });

    // Emitir evento via WebSocket
    if (this.io) {
      this.io.emit('production:update', {
        appointment: result.appointment,
        order: result.order,
        increment: quantity,
        total: result.order.producedQuantity,
        isDuplicateWarning: !!recentAppointment,
        productionDefect: result.productionDefect,
      });
    }

    return result;
  }

  /**
   * Obtém estatísticas de produção em tempo real
   */
  public async getProductionStats(orderId?: number, companyId?: number): Promise<any> {
    const where: any = {};
    
    if (orderId) {
      where.productionOrderId = orderId;
    }
    
    if (companyId) {
      where.productionOrder = { companyId };
    }

    // Buscar apontamentos para calcular peças e tempo corretamente
    // ⚠️ ESTRUTURA PADRONIZADA:
    // - TODOS: clpCounterValue = peças
    // - quantity = tempo (auto: ciclo, manual: segundos)
    const appointments = await prisma.productionAppointment.findMany({
      where,
      select: {
        automatic: true,
        quantity: true,
        clpCounterValue: true,
        durationSeconds: true,
        rejectedQuantity: true,
      },
    });

    // Calcular totais
    let totalProduced = 0;
    let totalRejected = 0;
    let totalTimeSeconds = 0;
    let manualAppointments = 0;
    let automaticAppointments = 0;

    appointments.forEach(apt => {
      // PEÇAS: sempre do clpCounterValue (padronizado)
      totalProduced += apt.clpCounterValue || 0;
      
      // TEMPO: quantity para manuais (já em segundos)
      if (apt.automatic) {
        automaticAppointments++;
      } else {
        totalTimeSeconds += apt.quantity || 0; // quantity = segundos para manual
        manualAppointments++;
      }
      
      // Rejeitadas (não usado mais, buscar de production_defects)
      totalRejected += apt.rejectedQuantity || 0;
    });

    // Buscar defeitos reais da tabela production_defects
    const defects = await prisma.productionDefect.aggregate({
      where: {
        ...(orderId ? { productionOrderId: orderId } : {}),
        ...(companyId ? { productionOrder: { companyId } } : {}),
      },
      _sum: {
        quantity: true,
      },
    });

    const totalDefects = defects._sum.quantity || 0;

    return {
      totalProduced,
      totalRejected: totalDefects, // Usar defeitos da tabela correta
      totalAppointments: appointments.length,
      manualAppointments,
      automaticAppointments,
      totalTimeSeconds, // Tempo total de apontamentos manuais
      totalTimeFormatted: this.formatSeconds(totalTimeSeconds),
      qualityRate: totalProduced > 0 
        ? ((totalProduced - totalDefects) / totalProduced) * 100 
        : 100,
    };
  }

  /**
   * Formata segundos em formato legível
   */
  private formatSeconds(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
}

export const productionService = new ProductionService();


