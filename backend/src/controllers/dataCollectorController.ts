import { Response } from 'express';
import { prisma } from '../config/database';
import { ApiKeyRequest } from '../middleware/apiKeyAuth';

/**
 * Buscar todas as configurações de CLP ativas (para data-collector)
 */
export async function getActivePlcConfigs(_req: ApiKeyRequest, res: Response): Promise<void> {
  const startTime = Date.now();
  try {
    console.log('📥 [DATA-COLLECTOR] Iniciando busca de configurações de CLP...');
    
    // Timeout de 10 segundos para a query principal
    const configsPromise = prisma.plcConfig.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        host: true,
        port: true,
        unitId: true,
        timeout: true,
        pollingInterval: true,
        reconnectInterval: true,
        timeDivisor: true,
        sectorId: true,
        active: true,
      },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout - database não respondeu em 10s')), 10000);
    });

    const configs = await Promise.race([configsPromise, timeoutPromise]) as any[];

    console.log(`⏳ ${configs.length} configs encontradas, carregando registers...`);

    // Buscar registers separadamente para cada config (com timeout individual)
    const configsWithRegisters = await Promise.all(
      configs.map(async (config) => {
        try {
          const registersPromise = prisma.plcRegister.findMany({
            where: {
              plcConfigId: config.id,
              enabled: true,
            },
            select: {
              id: true,
              plcConfigId: true,
              registerName: true,
              registerAddress: true,
              description: true,
              dataType: true,
              registerPurpose: true, // ← CRITICAL: Necessário para detecção de ciclos!
              enabled: true,
            },
            orderBy: { registerAddress: 'asc' },
            take: 100, // Limitar para evitar sobrecarga
          });

          const regTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Register query timeout')), 5000);
          });

          const registers = await Promise.race([registersPromise, regTimeout]) as any[];

          return {
            ...config,
            registers,
          };
        } catch (error) {
          console.warn(`⚠️  Erro ao buscar registers para config ${config.id}, retornando vazio`);
          return {
            ...config,
            registers: [],
          };
        }
      })
    );

    const duration = Date.now() - startTime;
    console.log(`✅ [DATA-COLLECTOR] ${configsWithRegisters.length} configurações prontas em ${duration}ms`);
    
    res.json(configsWithRegisters);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [DATA-COLLECTOR] Erro ao buscar configurações (${duration}ms):`, error);
    
    // Se for timeout, retornar array vazio em vez de erro 500
    if (error.message?.includes('timeout')) {
      console.warn('⚠️  [DATA-COLLECTOR] Retornando array vazio devido ao timeout');
      res.json([]);
    } else {
      res.status(500).json({ error: 'Erro ao buscar configurações', details: error.message });
    }
  }
}

/**
 * Buscar uma configuração de CLP específica
 */
export async function getPlcConfig(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const config = await prisma.plcConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        registers: {
          where: { enabled: true },
          orderBy: { registerAddress: 'asc' },
        },
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Configuração não encontrada' });
      return;
    }

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configuração de CLP:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
}

/**
 * Receber dados coletados do CLP
 */
export async function receivePlcData(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const {
      plcRegisterId,
      registerAddress,
      registerName,
      value,
      timestamp,
      connected,
      errorMessage,
    } = req.body;

    // Validar campos obrigatórios
    if (!plcRegisterId || registerAddress === undefined || !registerName || value === undefined) {
      res.status(400).json({ error: 'Campos obrigatórios faltando' });
      return;
    }

    // Salvar no banco
    const plcData = await prisma.plcData.create({
      data: {
        plcRegisterId: parseInt(plcRegisterId),
        registerAddress: parseInt(registerAddress),
        registerName,
        value: parseInt(value),
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        connected: connected !== false,
        errorMessage: errorMessage || null,
      },
    });

    res.status(201).json(plcData);
  } catch (error: any) {
    console.error('Erro ao salvar dados do CLP:', error);
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
}

/**
 * Receber múltiplos dados de uma vez (batch)
 */
export async function receivePlcDataBatch(req: ApiKeyRequest, res: Response): Promise<void> {
  try {
    const { data } = req.body;

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json({ error: 'Array de dados é obrigatório' });
      return;
    }

    // Inserir em batch
    const plcDataRecords = await prisma.plcData.createMany({
      data: data.map((item: any) => ({
        plcRegisterId: parseInt(item.plcRegisterId),
        registerAddress: parseInt(item.registerAddress),
        registerName: item.registerName,
        value: parseInt(item.value),
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        connected: item.connected !== false,
        errorMessage: item.errorMessage || null,
      })),
    });

    res.status(201).json({
      success: true,
      count: plcDataRecords.count,
    });
  } catch (error: any) {
    console.error('Erro ao salvar batch de dados:', error);
    res.status(500).json({ error: 'Erro ao salvar dados' });
  }
}

/**
 * Buscar ordens de produção ativas
 */
export async function getActiveProductionOrders(_req: ApiKeyRequest, res: Response): Promise<void> {
  const startTime = Date.now();
  try {
    console.log('📥 [DATA-COLLECTOR] Buscando ordens de produção ativas...');
    
    // Adicionar timeout de 10 segundos
    const queryPromise = prisma.productionOrder.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        orderNumber: true,
        itemId: true,
        moldId: true,
        plcConfigId: true,
        status: true,
        producedQuantity: true,
        mold: {
          select: {
            code: true,
            name: true,
            cavities: true,
            activeCavities: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { plannedStartDate: 'asc' },
      ],
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout - database não respondeu em 10s')), 10000);
    });

    const ordersRaw = await Promise.race([queryPromise, timeoutPromise]) as any[];

    // Transformar resposta para incluir moldCavities diretamente
    // Usar activeCavities se disponível, senão usar cavities
    const orders = ordersRaw.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      itemId: order.itemId,
      moldId: order.moldId,
      plcConfigId: order.plcConfigId,
      status: order.status,
      producedQuantity: order.producedQuantity,
      moldCavities: order.mold?.activeCavities || order.mold?.cavities || null,
    }));

    const duration = Date.now() - startTime;
    console.log(`✅ [DATA-COLLECTOR] ${orders.length} ordens ativas encontradas em ${duration}ms`);
    res.json(orders);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ [DATA-COLLECTOR] Erro ao buscar ordens (${duration}ms):`, error);
    console.error('Stack:', error.stack);
    
    // Se for timeout, retornar array vazio em vez de erro 500
    if (error.message?.includes('timeout')) {
      console.warn('⚠️  [DATA-COLLECTOR] Retornando array vazio devido ao timeout');
      res.json([]);
    } else {
      res.status(500).json({ error: 'Erro ao buscar ordens', details: error.message });
    }
  }
}

/**
 * Receber apontamento de produção
 */
export async function receiveProductionAppointment(req: ApiKeyRequest, res: Response): Promise<void> {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`\n🔵 [${requestId}] Nova requisição de apontamento recebida`);
    console.log(`📝 [${requestId}] Body:`, JSON.stringify(req.body));
    
    const {
      productionOrderId,
      quantity,
      timestamp,
      clpCounterValue,
    } = req.body;

    // Validar campos obrigatórios
    if (!productionOrderId || !quantity) {
      console.error(`❌ [${requestId}] Campos obrigatórios faltando`);
      res.status(400).json({ error: 'productionOrderId e quantity são obrigatórios' });
      return;
    }

    const parsedOrderId = parseInt(productionOrderId);
    const parsedQuantity = parseInt(quantity);
    const parsedClpCounterValue = clpCounterValue ? parseInt(clpCounterValue) : null;

    console.log(`🔍 [${requestId}] Buscando ordem ${parsedOrderId}...`);

    // Verificar se a ordem existe e está ativa
    const order = await prisma.productionOrder.findUnique({
      where: { id: parsedOrderId },
    });

    if (!order) {
      console.error(`❌ [${requestId}] Ordem ${parsedOrderId} não encontrada`);
      res.status(404).json({ error: 'Ordem de produção não encontrada' });
      return;
    }

    console.log(`✓ [${requestId}] Ordem encontrada: ${order.orderNumber} (Status: ${order.status})`);

    if (order.status !== 'ACTIVE') {
      console.error(`❌ [${requestId}] Ordem ${order.orderNumber} não está ativa (Status: ${order.status})`);
      res.status(400).json({ error: 'Ordem de produção não está em atividade' });
      return;
    }

    // ⚠️ PREVENÇÃO DE DUPLICATAS - AJUSTADA PARA SER MAIS PRECISA
    const appointmentTimestamp = timestamp ? new Date(timestamp) : new Date();
    console.log(`⏰ [${requestId}] Timestamp do apontamento: ${appointmentTimestamp.toISOString()}`);
    
    // Buscar apontamento duplicado (últimos 2 segundos) com EXATAMENTE os mesmos dados
    const timeWindow = new Date(appointmentTimestamp.getTime() - 2000); // 2 segundos antes (reduzido de 10s)
    
    console.log(`🔎 [${requestId}] Verificando duplicatas (últimos 2s)...`);
    
    const duplicateCheck = await prisma.productionAppointment.findFirst({
      where: {
        productionOrderId: parsedOrderId,
        automatic: true,
        quantity: parsedQuantity, // ⚠️ IMPORTANTE: Mesma quantidade
        timestamp: {
          gte: timeWindow,
          lte: new Date(appointmentTimestamp.getTime() + 500), // 500ms depois
        },
        ...(parsedClpCounterValue ? { clpCounterValue: parsedClpCounterValue } : {}),
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Se encontrou um apontamento IDÊNTICO muito recente, rejeitar como duplicata
    if (duplicateCheck) {
      const timeDiff = Math.abs(appointmentTimestamp.getTime() - duplicateCheck.timestamp.getTime());
      
      console.warn(`⚠️  [${requestId}] DUPLICATA DETECTADA E BLOQUEADA:`);
      console.warn(`    OP: ${order.orderNumber}`);
      console.warn(`    Quantidade: ${parsedQuantity} (idêntica)`);
      console.warn(`    Contador: ${parsedClpCounterValue || 'N/A'}`);
      console.warn(`    Apontamento existente: ID ${duplicateCheck.id}`);
      console.warn(`    Timestamp existente: ${duplicateCheck.timestamp.toISOString()}`);
      console.warn(`    Timestamp novo: ${appointmentTimestamp.toISOString()}`);
      console.warn(`    Diferença: ${timeDiff}ms (< 2000ms)`);
      
      // Retornar o apontamento existente ao invés de criar duplicata
      res.status(200).json({
        ...duplicateCheck,
        isDuplicate: true,
        message: 'Apontamento duplicado detectado, registro existente retornado',
        timeDiffMs: timeDiff
      });
      return;
    }

    console.log(`✓ [${requestId}] Nenhuma duplicata encontrada - Prosseguindo com criação`);
    console.log(`💾 [${requestId}] Criando apontamento no banco de dados...`);

    // Criar apontamento (assumindo userId = 1 para apontamentos automáticos do data-collector)
    const appointment = await prisma.productionAppointment.create({
      data: {
        productionOrderId: parsedOrderId,
        userId: 1, // TODO: Criar usuário específico para data-collector
        quantity: parsedQuantity,
        automatic: true, // Marcar como apontamento automático
        timestamp: appointmentTimestamp,
        clpCounterValue: parsedClpCounterValue,
      },
    });

    console.log(`✅ [${requestId}] Apontamento criado com sucesso! ID: ${appointment.id}`);
    console.log(`🔄 [${requestId}] Atualizando quantidade na ordem...`);

    // ⚠️ CORREÇÃO CRÍTICA: Usar clpCounterValue (peças) e não quantity (tempo)
    // quantity = tempo de ciclo em unidades do PLC
    // clpCounterValue = contador real de peças produzidas
    const piecesProduced = parsedClpCounterValue || 0;
    
    if (piecesProduced > 0) {
      // Atualizar quantidade produzida na ordem
      const updatedOrder = await prisma.productionOrder.update({
        where: { id: parsedOrderId },
        data: {
          producedQuantity: {
            increment: piecesProduced, // ← CORRIGIDO: usar contador de peças
          },
        },
      });

      console.log(`✅ [${requestId}] Ordem atualizada: ${updatedOrder.producedQuantity} peças produzidas`);
      console.log(`🎉 [${requestId}] Apontamento automático COMPLETO: OP ${order.orderNumber} +${piecesProduced} peças (Contador CLP: ${parsedClpCounterValue})\n`);
    } else {
      console.warn(`⚠️  [${requestId}] clpCounterValue não informado - producedQuantity não atualizado (usar quantity=${parsedQuantity} seria incorreto pois é tempo de ciclo)`);
    }

    res.status(201).json(appointment);
  } catch (error: any) {
    console.error(`\n❌❌❌ [${requestId}] ERRO CRÍTICO ao registrar apontamento:`);
    console.error(`Erro: ${error.message}`);
    console.error(`Stack:`, error.stack);
    console.error(`Body da requisição:`, JSON.stringify(req.body));
    console.error(`❌❌❌\n`);
    
    // Mesmo com erro, tentar retornar resposta para não deixar o Data Collector travado
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Erro ao registrar apontamento',
        details: error.message,
        requestId: requestId
      });
    }
  }
}

