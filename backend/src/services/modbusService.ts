/**
 * Serviço de comunicação Modbus com CLP
 * Suporta configurações dinâmicas do banco de dados e múltiplos registros
 */

import * as Modbus from 'jsmodbus';
import net from 'net';
import { EventEmitter } from 'events';
import { prisma } from '../config/database';

interface PlcConfigData {
  id: number;
  name: string;
  host: string;
  port: number;
  unitId: number;
  timeout: number;
  pollingInterval: number;
  reconnectInterval: number;
  active: boolean;
  registers?: PlcRegisterData[];
}

interface PlcRegisterData {
  id: number;
  registerName: string;
  registerAddress: number;
  description?: string | null;
  dataType: string;
  enabled: boolean;
}

interface RegisterValue {
  registerId: number;
  registerName: string;
  value: number;
  timestamp: Date;
}

/**
 * Classe de serviço Modbus com reconexão automática e configuração dinâmica
 */
export class ModbusService extends EventEmitter {
  private config: PlcConfigData | null = null;
  private socket: net.Socket | null = null;
  private client: any = null;
  private connected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private registerValues: Map<number, number> = new Map(); // registerId -> lastValue

  constructor() {
    super();
  }

  /**
   * Inicializa o serviço carregando a configuração ativa do banco
   */
  public async initialize(): Promise<void> {
    try {
      const activeConfig = await prisma.plcConfig.findFirst({
        where: { active: true },
        include: {
          registers: {
            where: { enabled: true },
            orderBy: { registerAddress: 'asc' },
          },
        },
      });

      if (activeConfig) {
        this.config = activeConfig;
        console.log(`📋 Configuração do CLP carregada: ${activeConfig.name}`);
        await this.connect();
      } else {
        console.log('⚠️  Nenhuma configuração de CLP ativa encontrada');
        // Tentar usar variáveis de ambiente como fallback
        await this.loadFromEnv();
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço Modbus:', error);
      // Tentar usar variáveis de ambiente como fallback
      await this.loadFromEnv();
    }
  }

  /**
   * Carrega configuração das variáveis de ambiente (fallback)
   */
  private async loadFromEnv(): Promise<void> {
    if (process.env.MODBUS_HOST) {
      this.config = {
        id: 0,
        name: 'Configuração Padrão (ENV)',
        host: process.env.MODBUS_HOST,
        port: parseInt(process.env.MODBUS_PORT || '502'),
        unitId: parseInt(process.env.MODBUS_UNIT_ID || '1'),
        timeout: parseInt(process.env.MODBUS_TIMEOUT || '5000'),
        pollingInterval: parseInt(process.env.MODBUS_POLLING_INTERVAL || '1000'),
        reconnectInterval: parseInt(process.env.MODBUS_RECONNECT_INTERVAL || '10000'),
        active: true,
        registers: [
          {
            id: 0,
            registerName: 'D' + (process.env.MODBUS_REGISTER_D33 || '33'),
            registerAddress: parseInt(process.env.MODBUS_REGISTER_D33 || '33'),
            description: 'Contador de produção',
            dataType: 'INT16',
            enabled: true,
          },
        ],
      };
      console.log('📋 Usando configuração das variáveis de ambiente');
      await this.connect();
    }
  }

  /**
   * Reconecta com uma nova configuração
   */
  public async reconnectWithNewConfig(config: PlcConfigData): Promise<void> {
    console.log(`🔄 Reconectando com nova configuração: ${config.name}`);
    
    // Desconectar
    this.disconnect();
    
    // Atualizar configuração
    this.config = config;
    
    // Reconectar
    if (config.active) {
      await this.connect();
    }
  }

  /**
   * Conecta ao CLP via Modbus TCP
   */
  public async connect(): Promise<void> {
    if (!this.config) {
      throw new Error('Nenhuma configuração de CLP disponível');
    }

    try {
      console.log(`🔌 Conectando ao CLP ${this.config.name} em ${this.config.host}:${this.config.port}...`);

      this.socket = new net.Socket();
      this.client = new Modbus.client.TCP(this.socket, this.config.unitId);

      // Configurar timeout
      this.socket.setTimeout(this.config.timeout);

      // Event listeners
      this.socket.on('connect', () => {
        this.connected = true;
        console.log(`✅ Conectado ao CLP ${this.config?.name} com sucesso`);
        this.emit('connected');
        this.clearReconnectTimer();
        this.startPolling();
      });

      this.socket.on('error', (err) => {
        console.error('❌ Erro de conexão com CLP:', err.message);
        this.emit('error', err);
        this.handleDisconnect();
      });

      this.socket.on('close', () => {
        console.log('🔌 Conexão com CLP fechada');
        this.emit('disconnected');
        this.handleDisconnect();
      });

      this.socket.on('timeout', () => {
        console.error('⏱️ Timeout de conexão com CLP');
        this.socket?.destroy();
        this.handleDisconnect();
      });

      // Conectar
      this.socket.connect({
        host: this.config.host,
        port: this.config.port,
      });

    } catch (error) {
      console.error('❌ Erro ao conectar ao CLP:', error);
      this.handleDisconnect();
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
    console.log('Desconectado do CLP');
  }

  /**
   * Lê um registro específico
   */
  public async readRegister(registerAddress: number): Promise<number> {
    if (!this.connected || !this.client) {
      throw new Error('CLP não está conectado');
    }

    try {
      const response = await this.client.readHoldingRegisters(registerAddress, 1);
      const value = response.response.body.values[0];
      return value;
    } catch (error: any) {
      console.error(`Erro ao ler registro ${registerAddress}:`, error.message);
      throw error;
    }
  }

  /**
   * Escreve valor em um registro
   */
  public async writeRegister(registerAddress: number, value: number): Promise<void> {
    if (!this.connected || !this.client) {
      throw new Error('CLP não está conectado');
    }

    try {
      await this.client.writeSingleRegister(registerAddress, value);
      console.log(`Valor ${value} escrito no registro ${registerAddress}`);
    } catch (error) {
      console.error(`Erro ao escrever no registro ${registerAddress}:`, error);
      throw error;
    }
  }

  /**
   * Compatibilidade: Lê o registro D33 (método legado)
   */
  public async readRegisterD33(): Promise<number> {
    const d33Register = this.config?.registers?.find(r => r.registerName === 'D33');
    if (d33Register) {
      return this.readRegister(d33Register.registerAddress);
    }
    // Fallback para endereço 33
    return this.readRegister(33);
  }

  /**
   * Compatibilidade: Escreve no registro D33 (método legado)
   */
  public async writeRegisterD33(value: number): Promise<void> {
    const d33Register = this.config?.registers?.find(r => r.registerName === 'D33');
    if (d33Register) {
      return this.writeRegister(d33Register.registerAddress, value);
    }
    // Fallback para endereço 33
    return this.writeRegister(33, value);
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Obtém último valor lido do primeiro registro (compatibilidade)
   */
  public getLastValue(): number {
    if (this.registerValues.size > 0) {
      return Array.from(this.registerValues.values())[0];
    }
    return 0;
  }

  /**
   * Obtém valores de todos os registros
   */
  public getAllRegisterValues(): RegisterValue[] {
    const values: RegisterValue[] = [];
    
    this.config?.registers?.forEach(register => {
      const value = this.registerValues.get(register.id);
      if (value !== undefined) {
        values.push({
          registerId: register.id,
          registerName: register.registerName,
          value,
          timestamp: new Date(),
        });
      }
    });
    
    return values;
  }

  /**
   * Inicia polling periódico de todos os registros habilitados
   */
  private startPolling(): void {
    if (!this.config) return;
    
    this.stopPolling();
    
    const interval = this.config.pollingInterval;
    console.log(`⏱️  Polling iniciado (intervalo: ${interval}ms, registros: ${this.config.registers?.length || 0})`);
    
    this.pollingInterval = setInterval(async () => {
      await this.pollAllRegisters();
    }, interval);
  }

  /**
   * Faz polling de todos os registros habilitados
   */
  private async pollAllRegisters(): Promise<void> {
    if (!this.config?.registers || this.config.registers.length === 0) {
      return;
    }

    for (const register of this.config.registers) {
      if (!register.enabled) continue;

      try {
        const value = await this.readRegister(register.registerAddress);
        const isFirstRead = !this.registerValues.has(register.id);
        const oldValue = this.registerValues.get(register.id) || 0;

        // Atualizar valor em memória
        this.registerValues.set(register.id, value);

        // Na primeira leitura, apenas inicializa sem salvar ou emitir evento
        if (isFirstRead) {
          console.log(`🔄 ${register.registerName} inicializado com valor: ${value}`);
          continue;
        }

        // Emitir evento e salvar no banco APENAS se valor mudou
        if (value !== oldValue) {
          const increment = value - oldValue;
          
          // Salvar no banco de dados apenas quando há mudança real
          await this.saveToDatabase(register.registerAddress, value);
          
          this.emit('valueChanged', {
            register: register.registerName,
            registerAddress: register.registerAddress,
            oldValue,
            newValue: value,
            increment,
          });
          
          console.log(`📊 ${register.registerName}: ${oldValue} → ${value} (${increment > 0 ? '+' : ''}${increment})`);
        }
      } catch (error) {
        // Erro já foi logado em readRegister
      }
    }
  }

  /**
   * Para polling periódico
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Trata desconexão e agenda reconexão
   */
  private handleDisconnect(): void {
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
    if (!this.config) return;
    
    this.clearReconnectTimer();
    
    const interval = this.config.reconnectInterval;
    console.log(`⏳ Tentando reconectar em ${interval / 1000}s...`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 Tentando reconectar ao CLP...');
      this.connect().catch((err) => {
        console.error('Falha na reconexão:', err.message);
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

  /**
   * Salva dados no banco
   */
  private async saveToDatabase(registerAddress: number, value: number, connected: boolean = true, errorMessage?: string): Promise<void> {
    try {
      // Buscar informações do registro
      const register = this.config?.registers?.find(r => r.registerAddress === registerAddress);
      
      await prisma.plcData.create({
        data: {
          plcRegisterId: register?.id,
          registerAddress,
          registerName: register?.registerName,
          value,
          connected,
          errorMessage,
        },
      });
    } catch (error) {
      console.error('Erro ao salvar dados do CLP no banco:', error);
    }
  }

  /**
   * Testa conexão com um CLP
   */
  public async testConnection(config: { host: string; port: number; unitId: number; timeout: number }): Promise<{ success: boolean; message: string; latency?: number }> {
    const socket = new net.Socket();
    const startTime = Date.now();

    return new Promise((resolve) => {
      socket.setTimeout(config.timeout);

      socket.on('connect', () => {
        const latency = Date.now() - startTime;
        socket.destroy();
        resolve({
          success: true,
          message: 'Conexão estabelecida com sucesso',
          latency,
        });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({
          success: false,
          message: `Erro de conexão: ${err.message}`,
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          success: false,
          message: 'Timeout de conexão',
        });
      });

      socket.connect({
        host: config.host,
        port: config.port,
      });
    });
  }
}

// Exportar instância singleton
export const modbusService = new ModbusService();
