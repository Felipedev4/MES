import { logger } from '../utils/logger';
import { ApiClient, ProductionOrderResponse, ProductionAppointmentPayload } from './ApiClient';

/**
 * Monitora ordens de produção ativas e envia apontamentos
 * Busca informações do backend via API
 */
export class ProductionMonitor {
  private apiClient: ApiClient;
  private checkInterval: NodeJS.Timeout | null = null;
  private activeOrders: Map<number, ProductionOrderResponse> = new Map();
  private isRunning: boolean = false;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Iniciar monitoramento
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⚠️  ProductionMonitor já está rodando');
      return;
    }

    this.isRunning = true;
    logger.info('📊 ProductionMonitor: Iniciando...');

    // Carregar ordens iniciais
    await this.loadActiveOrders();

    // Verificar ordens a cada 10 segundos
    this.checkInterval = setInterval(async () => {
      await this.loadActiveOrders();
    }, 10000);

    logger.info('📊 ProductionMonitor: Iniciado');
  }

  /**
   * Parar monitoramento
   */
  stop(): void {
    logger.info('📊 ProductionMonitor: Parando...');
    
    this.isRunning = false;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.activeOrders.clear();
    logger.info('📊 ProductionMonitor: Parado');
  }

  /**
   * Carregar ordens de produção ativas
   */
  private async loadActiveOrders(): Promise<void> {
    try {
      const orders = await this.apiClient.getActiveProductionOrders();
      
      // Atualizar mapa de ordens ativas
      this.activeOrders.clear();
      for (const order of orders) {
        this.activeOrders.set(order.id, order);
      }

      if (orders.length > 0) {
        logger.debug(`📊 ${orders.length} ordens de produção ativas`);
      }
    } catch (error: any) {
      logger.error('❌ Erro ao carregar ordens de produção:', error.message);
    }
  }

  /**
   * Registrar apontamento de produção
   * Chamado quando detecta mudança no contador do CLP
   */
  async recordProduction(
    productionOrderId: number,
    quantity: number,
    plcDataId?: number,
    clpCounterValue?: number
  ): Promise<boolean> {
    try {
      const order = this.activeOrders.get(productionOrderId);
      
      if (!order) {
        logger.warn(`⚠️  Ordem de produção ${productionOrderId} não está ativa`);
        return false;
      }

      const appointment: ProductionAppointmentPayload = {
        productionOrderId,
        quantity,
        timestamp: new Date(),
        plcDataId: plcDataId || null,
        clpCounterValue: clpCounterValue || null,
      };

      const success = await this.apiClient.sendProductionAppointment(appointment);
      
      if (success) {
        logger.info(`✅ Apontamento registrado: OP ${order.orderNumber} - ${quantity} peças`);
        
        // Recarregar ordens para obter quantidade atualizada
        await this.loadActiveOrders();
      }

      return success;
    } catch (error: any) {
      logger.error('❌ Erro ao registrar apontamento:', error.message);
      return false;
    }
  }

  /**
   * Verificar se uma ordem de produção está ativa
   */
  isOrderActive(productionOrderId: number): boolean {
    return this.activeOrders.has(productionOrderId);
  }

  /**
   * Obter ordem de produção ativa
   */
  getActiveOrder(productionOrderId: number): ProductionOrderResponse | undefined {
    return this.activeOrders.get(productionOrderId);
  }

  /**
   * Obter todas as ordens ativas
   */
  getActiveOrders(): ProductionOrderResponse[] {
    return Array.from(this.activeOrders.values());
  }

  /**
   * Obter estatísticas
   */
  getStats(): {
    totalActiveOrders: number;
    orders: Array<{
      id: number;
      orderNumber: string;
      itemId: number;
      status: string;
      producedQuantity: number;
    }>;
  } {
    const orders = Array.from(this.activeOrders.values());

    return {
      totalActiveOrders: orders.length,
      orders: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        itemId: o.itemId,
        status: o.status,
        producedQuantity: o.producedQuantity,
      })),
    };
  }
}
