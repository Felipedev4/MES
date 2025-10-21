/**
 * Gerencia conexão individual com um CLP
 */

import * as Modbus from 'jsmodbus';
import net from 'net';
import { EventEmitter } from 'events';
import { prisma } from '../config/database';
import { logger, logPlcConnection, logPlcDisconnection, logPlcError, logRegisterRead } from '../utils/logger';

interface PlcConfigData {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  sectorId: number | null;
  active: boolean;
  registers: PlcRegisterData[];
}

interface PlcRegisterData {
  id: number;
  registerName: string;
  registerAddress: number;
  description: string | null;
  dataType: string;
  enabled: boolean;
}

interface RegisterValue {
  registerId: number;
  registerName: string;
  registerAddress: number;
  value: number;
  previousValue: number | null;
  timestamp: Date;
}

/**
 * Classe que representa uma conexão com um CLP
 */
export class PlcConnection extends EventEmitter {
  private config: PlcConfigData;
  private socket: net.Socket | null = null;
  private client: any = null;
  private connected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pollingTimer: NodeJS.Timeout | null = null;
  private registerValues: Map<number, number> = new Map(); // registerAddress -> lastValue
  private errorCount: number = 0;
  private lastReadTime: Date | null = null;

  constructor(config: PlcConfigData) {
    super();
    this.config = config;
  }

  /**
   * Conecta ao CLP
   */
  public async connect(): Promise<void> {
    try {
      logPlcConnection(this.config.name, this.config.host, this.config.port);

      this.socket = new net.Socket();
      this.client = new Modbus.client.TCP(this.socket, this.config.unitId);

      // Configurar timeout
      this.socket.setTimeout(this.config.timeout);

      // Event listeners
      this.socket.on('connect', () => {
        this.connected = true;
        this.errorCount = 0;
        logger.info(`✅ Conectado ao CLP "${this.config.name}" com sucesso`);
        this.emit('connected', this.config);
        this.clearReconnectTimer();
        this.startPolling();
      });

      this.socket.on('error', (err) => {
        logPlcError(this.config.name, err);
        this.emit('error', { config: this.config, error: err });
        this.handleDisconnect(err.message);
      });

      this.socket.on('close', () => {
        logPlcDisconnection(this.config.name, 'Conexão fechada');
        this.emit('disconnected', this.config);
        this.handleDisconnect('Conexão fechada');
      });

      this.socket.on('timeout', () => {
        logger.warn(`⏱️ Timeout de conexão com CLP "${this.config.name}"`);
        this.socket?.destroy();
        this.handleDisconnect('Timeout');
      });

      // Conectar
      this.socket.connect({
        host: this.config.host,
        port: this.config.port,
      });

    } catch (error) {
      logPlcError(this.config.name, error as Error);
      this.handleDisconnect((error as Error).message);
      throw error;
    }
  }

  /**
   * Desconecta do CLP
   */
  public disconnect(): void {
    this.stopPolling();
    this.clearReconnectTimer();
    
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    
    this.client = null;
    this.connected = false;
    logPlcDisconnection(this.config.name);
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Obtém informações de status
   */
  public getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      host: this.config.host,
      port: this.config.port,
      connected: this.connected,
      lastRead: this.lastReadTime,
      errorCount: this.errorCount,
      registersCount: this.config.registers.length,
    };
  }

  /**
   * Atualiza configuração
   */
  public updateConfig(newConfig: PlcConfigData): void {
    const needsReconnect = 
      this.config.host !== newConfig.host ||
      this.config.port !== newConfig.port ||
      this.config.unitId !== newConfig.unitId;

    this.config = newConfig;

    if (needsReconnect && this.connected) {
      logger.info(`🔄 Reconectando CLP "${this.config.name}" devido a mudança de configuração`);
      this.disconnect();
      this.connect();
    } else {
      // Reiniciar polling com novo intervalo
      this.stopPolling();
      if (this.connected) {
        this.startPolling();
      }
    }
  }

  /**
   * Lê um registro específico
   */
  private async readRegister(registerAddress: number): Promise<number> {
    if (!this.connected || !this.client) {
      throw new Error('CLP não está conectado');
    }

    try {
      const response = await this.client.readHoldingRegisters(registerAddress, 1);
      const value = response.response.body.values[0];
      return value;
    } catch (error: any) {
      this.errorCount++;
      throw new Error(`Erro ao ler registro ${registerAddress}: ${error.message}`);
    }
  }

  /**
   * Inicia polling periódico
   */
  private startPolling(): void {
    this.stopPolling();
    
    const interval = this.config.pollingInterval;
    logger.info(`⏱️ Polling iniciado para CLP "${this.config.name}" (intervalo: ${interval}ms, registros: ${this.config.registers.length})`);
    
    this.pollingTimer = setInterval(async () => {
      await this.pollAllRegisters();
    }, interval);
  }

  /**
   * Para polling periódico
   */
  private stopPolling(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * Faz polling de todos os registros habilitados
   */
  private async pollAllRegisters(): Promise<void> {
    if (!this.config.registers || this.config.registers.length === 0) {
      return;
    }

    for (const register of this.config.registers) {
      if (!register.enabled) continue;

      try {
        const value = await this.readRegister(register.registerAddress);
        const isFirstRead = !this.registerValues.has(register.registerAddress);
        const previousValue = this.registerValues.get(register.registerAddress);

        // Atualizar valor em memória
        this.registerValues.set(register.registerAddress, value);
        this.lastReadTime = new Date();

        // Na primeira leitura, apenas inicializa
        if (isFirstRead) {
          logger.info(`🔄 [${this.config.name}] ${register.registerName} inicializado com valor: ${value}`);
          continue;
        }

        // Se valor mudou, emitir evento e salvar no banco
        if (value !== previousValue) {
          const increment = previousValue !== undefined ? value - previousValue : 0;
          
          // Salvar no banco de dados
          await this.saveToDatabase(register, value, true);
          
          // Emitir evento
          this.emit('valueChanged', {
            plcConfigId: this.config.id,
            plcName: this.config.name,
            sectorId: this.config.sectorId,
            register: {
              id: register.id,
              name: register.registerName,
              address: register.registerAddress,
            },
            previousValue,
            value,
            increment,
            timestamp: new Date(),
          });
          
          logRegisterRead(this.config.name, register.registerName, value, true);
        }
      } catch (error) {
        logger.error(`Erro ao ler registro ${register.registerName} do CLP ${this.config.name}:`, error);
        
        // Salvar erro no banco
        await this.saveToDatabase(register, 0, false, (error as Error).message);
        
        // Se muitos erros consecutivos, reconectar
        if (this.errorCount > 5) {
          logger.warn(`Muitos erros no CLP ${this.config.name}, reconectando...`);
          this.disconnect();
          await this.connect();
        }
      }
    }
  }

  /**
   * Salva dados no banco
   */
  private async saveToDatabase(
    register: PlcRegisterData, 
    value: number, 
    connected: boolean = true, 
    errorMessage?: string
  ): Promise<void> {
    try {
      await prisma.plcData.create({
        data: {
          plcRegisterId: register.id,
          registerAddress: register.registerAddress,
          registerName: register.registerName,
          value,
          connected,
          errorMessage,
        },
      });
    } catch (error) {
      logger.error(`Erro ao salvar dados do CLP no banco:`, error);
    }
  }

  /**
   * Trata desconexão e agenda reconexão
   */
  private handleDisconnect(reason?: string): void {
    this.connected = false;
    this.stopPolling();
    
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    
    this.client = null;

    // Agendar reconexão automática
    this.scheduleReconnect();
  }

  /**
   * Agenda tentativa de reconexão
   */
  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    
    const interval = this.config.reconnectInterval;
    logger.info(`⏳ Tentando reconectar CLP "${this.config.name}" em ${interval / 1000}s...`);
    
    this.reconnectTimer = setTimeout(() => {
      logger.info(`🔄 Tentando reconectar ao CLP "${this.config.name}"...`);
      this.connect().catch((err) => {
        logger.error(`Falha na reconexão do CLP "${this.config.name}":`, err);
      });
    }, interval);
  }

  /**
   * Limpa timer de reconexão
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

