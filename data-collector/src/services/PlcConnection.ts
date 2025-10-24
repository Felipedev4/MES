import * as jsmodbus from 'jsmodbus';
import * as net from 'net';
import { logger } from '../utils/logger';
import { ApiClient, PlcConfigResponse, PlcDataPayload } from './ApiClient';
import { ProductionMonitor } from './ProductionMonitor';

/**
 * Gerencia a conexão e leitura de um único CLP via Modbus TCP
 */
export class PlcConnection {
  private config: PlcConfigResponse;
  private socket: net.Socket | null = null;
  private client: jsmodbus.ModbusTCPClient | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private lastValues: Map<number, number> = new Map();
  private apiClient: ApiClient;
  private productionMonitor: ProductionMonitor | null = null;
  private shouldReconnect: boolean = true; // ✅ Flag para controlar reconexão

  constructor(config: PlcConfigResponse, apiClient: ApiClient, productionMonitor?: ProductionMonitor, shouldReconnect: boolean = true) {
    this.config = config;
    this.apiClient = apiClient;
    this.productionMonitor = productionMonitor || null;
    this.shouldReconnect = shouldReconnect; // ✅ Controlar se deve reconectar automaticamente
  }

  /**
   * Conectar ao CLP
   */
  async connect(): Promise<boolean> {
    try {
      this.socket = new net.Socket();
      this.client = new jsmodbus.ModbusTCPClient(this.socket, this.config.unitId);

      // Configurar timeout
      this.socket.setTimeout(this.config.timeout);

      // Event handlers
      this.socket.on('connect', () => {
        this.isConnected = true;
        logger.info(`🔌 PLC "${this.config.name}" (${this.config.host}:${this.config.port}) conectado!`);
        this.startPolling();
      });

      this.socket.on('error', (err) => {
        logger.error(`❌ Erro no PLC "${this.config.name}":`, err.message);
        this.handleDisconnection();
      });

      this.socket.on('close', () => {
        logger.warn(`🔌 Conexão com PLC "${this.config.name}" fechada`);
        this.handleDisconnection();
      });

      this.socket.on('timeout', () => {
        logger.warn(`⏱️ Timeout no PLC "${this.config.name}"`);
        this.socket?.end();
      });

      // Conectar
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout ao conectar'));
        }, this.config.timeout);

        this.socket!.connect(this.config.port, this.config.host, () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      return true;
    } catch (error: any) {
      logger.error(`❌ Falha ao conectar PLC "${this.config.name}":`, error.message);
      this.handleDisconnection();
      return false;
    }
  }

  /**
   * Desconectar do CLP
   */
  disconnect(): void {
    this.shouldReconnect = false; // ✅ Desabilitar reconexão
    this.stopPolling();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      // ✅ Remover todos os event listeners antes de destruir
      this.socket.removeAllListeners();
      this.socket.destroy();
      this.socket = null;
    }

    this.client = null;
    this.isConnected = false;
    logger.info(`🔌 PLC "${this.config.name}" desconectado`);
  }

  /**
   * Iniciar polling dos registros
   */
  private startPolling(): void {
    if (this.pollInterval) {
      return; // Já está fazendo polling
    }

    const enabledRegisters = this.config.registers.filter(r => r.enabled);
    
    if (enabledRegisters.length === 0) {
      logger.warn(`⚠️ PLC "${this.config.name}" não tem registros habilitados`);
      return;
    }

    logger.info(`📊 Monitorando ${enabledRegisters.length} registros no PLC "${this.config.name}"`);

    this.pollInterval = setInterval(async () => {
      await this.pollRegisters();
    }, this.config.pollingInterval);

    // Fazer a primeira leitura imediatamente
    this.pollRegisters();
  }

  /**
   * Parar polling
   */
  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Ler todos os registros configurados
   */
  private async pollRegisters(): Promise<void> {
    if (!this.isConnected || !this.client) {
      return;
    }

    const enabledRegisters = this.config.registers.filter(r => r.enabled);

    for (const register of enabledRegisters) {
      try {
        const value = await this.readRegister(register.registerAddress);
        
        if (value !== null) {
          // Verificar se o valor mudou
          const lastValue = this.lastValues.get(register.id) ?? null;
          const isFirstReading = lastValue === null;
          const hasChanged = value !== lastValue;
          
          if (isFirstReading || hasChanged) {
            // Valor mudou ou é a primeira leitura
            const change = lastValue !== null ? value - lastValue : 0;
            const symbol = change > 0 ? '+' : '';
            
            logger.info(`📊 ${register.registerName}: ${lastValue ?? 'N/A'} → ${value} (${symbol}${change})`);
            
            // Salvar novo valor
            this.lastValues.set(register.id, value);
            
            // Enviar para o backend via API
            await this.sendDataToBackend(register.id, register.registerAddress, register.registerName, value, true);
            
            // NOVO: Criar apontamento automático se for contador de produção
            await this.handleProductionCounter(register, change, value, lastValue);
          } else {
            // Valor não mudou, mas enviar periodicamente (a cada 10 leituras)
            const readCount = (this.lastValues.get(`count_${register.id}` as any) as number) || 0;
            if (readCount % 10 === 0) {
              logger.debug(`📊 ${register.registerName}: ${value} (sem mudança)`);
              await this.sendDataToBackend(register.id, register.registerAddress, register.registerName, value, true);
            }
            this.lastValues.set(`count_${register.id}` as any, readCount + 1);
          }
        } else {
          // Erro na leitura
          await this.sendDataToBackend(
            register.id,
            register.registerAddress,
            register.registerName,
            0,
            false,
            'Erro ao ler registro'
          );
        }
      } catch (error: any) {
        logger.error(`❌ Erro ao ler registro ${register.registerName}:`, error.message);
      }
    }
  }

  /**
   * Processar contador de produção e criar apontamento se necessário
   * 
   * LÓGICA CORRETA:
   * - D33 = CYCLE_TIME (tempo entre fechamento e abertura do molde)
   * - Cada mudança em D33 = 1 ciclo completo
   * - 1 ciclo completo = N peças (N = cavidades do molde)
   * - Produção = Número de ciclos × Cavidades do molde
   */
  private async handleProductionCounter(
    register: any,
    change: number,
    currentValue: number,
    previousValue: number | null
  ): Promise<void> {
    // Detectar CICLO COMPLETO através do CYCLE_TIME
    const isCycleComplete = 
      register.registerPurpose === 'CYCLE_TIME' &&
      previousValue !== null && 
      currentValue > 0 &&
      currentValue !== previousValue; // Qualquer mudança indica ciclo completo
    
    if (!isCycleComplete || !this.productionMonitor) {
      return;
    }

    try {
      // Buscar ordem de produção ativa vinculada a este CLP
      const activeOrders = this.productionMonitor.getActiveOrders();
      const orderForThisPlc = activeOrders.find(o => {
        // Buscar ordem vinculada a este CLP (ou primeira ordem ativa)
        return o.plcConfigId === this.config.id || true;
      });

      if (!orderForThisPlc) {
        logger.debug(`⚠️ Nenhuma ordem ativa encontrada para CLP ${this.config.name}`);
        return;
      }

      // quantity = Valor D33 | clpCounterValue = Cavidades do molde
      const moldCavities = orderForThisPlc.moldCavities || 1; // Default: 1 cavidade
      const quantityFromD33 = currentValue; // Valor coletado do D33
      
      // Logar informações do ciclo
      logger.info(`🔄 Ciclo completo detectado!`);
      logger.info(`⏱️  ${register.registerName}: ${currentValue}ms (Δ ${Math.abs(change)}ms)`);
      logger.info(`🎯 Criando apontamento: OP ${orderForThisPlc.orderNumber}`);
      logger.info(`📦 quantity=${quantityFromD33} (D33) | clpCounterValue=${moldCavities} (cavidades)`);
      
      const success = await this.productionMonitor.recordProduction(
        orderForThisPlc.id,
        quantityFromD33, // quantity = valor do D33
        undefined, // plcDataId
        moldCavities // clpCounterValue = cavidades do molde
      );

      if (success) {
        logger.info(`✅ Apontamento registrado com sucesso!`);
      } else {
        logger.warn(`⚠️ Falha ao registrar apontamento`);
      }
      
    } catch (error: any) {
      logger.error(`❌ Erro ao processar ciclo de produção:`, error.message);
    }
  }

  /**
   * Ler um registro específico
   */
  private async readRegister(address: number): Promise<number | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const response = await this.client.readHoldingRegisters(address, 1);
      
      if (response.response && response.response.body.values.length > 0) {
        return response.response.body.values[0];
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Enviar dados para o backend via API
   */
  private async sendDataToBackend(
    plcRegisterId: number,
    registerAddress: number,
    registerName: string,
    value: number,
    connected: boolean,
    errorMessage?: string
  ): Promise<void> {
    const payload: PlcDataPayload = {
      plcRegisterId,
      registerAddress,
      registerName,
      value,
      timestamp: new Date(),
      connected,
      errorMessage: errorMessage || null,
    };

    await this.apiClient.sendPlcData(payload);
  }

  /**
   * Lidar com desconexão
   */
  private handleDisconnection(): void {
    this.isConnected = false;
    this.stopPolling();
    
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }

    this.client = null;

    // ✅ Só tentar reconectar se shouldReconnect for true
    if (this.shouldReconnect && !this.reconnectTimeout) {
      logger.info(`⏳ Tentando reconectar PLC "${this.config.name}" em ${this.config.reconnectInterval}ms...`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.connect();
      }, this.config.reconnectInterval);
    }
  }

  /**
   * Atualizar configuração
   */
  updateConfig(newConfig: PlcConfigResponse): void {
    logger.info(`🔄 Atualizando configuração do PLC "${this.config.name}"`);
    this.config = newConfig;
    
    // Reiniciar conexão para aplicar novas configurações
    this.disconnect();
    this.connect();
  }

  /**
   * Getters
   */
  getId(): number {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getStatus(): { connected: boolean; host: string; port: number; registers: number } {
    return {
      connected: this.isConnected,
      host: this.config.host,
      port: this.config.port,
      registers: this.config.registers.filter(r => r.enabled).length,
    };
  }
}
