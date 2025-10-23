/**
 * Controller de Produção e Apontamentos
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/companyFilter';
import { productionService } from '../services/productionService';
import { modbusService } from '../services/modbusService';

/**
 * Cria apontamento manual de produção
 */
export async function createAppointment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productionOrderId, quantity, rejectedQuantity = 0, notes, startTime, endTime } = req.body;
    const userId = req.user?.userId!;

    const result = await productionService.createManualAppointment(
      productionOrderId,
      userId,
      quantity,
      rejectedQuantity,
      notes,
      startTime ? new Date(startTime) : undefined,
      endTime ? new Date(endTime) : undefined
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Erro ao criar apontamento:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar apontamento' });
  }
}

/**
 * Define ordem de produção ativa para apontamento automático
 */
export async function setActiveOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productionOrderId } = req.body;

    await productionService.setActiveProductionOrder(productionOrderId);

    res.json({ 
      success: true, 
      message: 'Ordem de produção definida como ativa',
      activeOrderId: productionOrderId,
    });
  } catch (error: any) {
    console.error('Erro ao definir ordem ativa:', error);
    res.status(500).json({ error: error.message || 'Erro ao definir ordem ativa' });
  }
}

/**
 * Remove ordem ativa
 */
export async function clearActiveOrder(_req: AuthRequest, res: Response): Promise<void> {
  try {
    productionService.clearActiveProductionOrder();

    res.json({ 
      success: true, 
      message: 'Ordem ativa removida',
    });
  } catch (error: any) {
    console.error('Erro ao remover ordem ativa:', error);
    res.status(500).json({ error: error.message || 'Erro ao remover ordem ativa' });
  }
}

/**
 * Obtém ordem ativa
 */
export async function getActiveOrder(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const activeOrderId = productionService.getActiveOrderId();

    res.json({ 
      activeOrderId,
      hasActiveOrder: activeOrderId !== null,
    });
  } catch (error: any) {
    console.error('Erro ao buscar ordem ativa:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar ordem ativa' });
  }
}

/**
 * Obtém estatísticas de produção
 */
export async function getProductionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.query;
    const companyId = req.user?.companyId;

    const stats = await productionService.getProductionStats(
      orderId ? parseInt(orderId as string) : undefined,
      companyId
    );

    res.json(stats);
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar estatísticas' });
  }
}

/**
 * Obtém status de conexão do CLP
 */
export async function getPlcStatus(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const connected = modbusService.isConnected();
    const lastValue = modbusService.getLastValue();

    res.json({
      connected,
      lastValue,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Erro ao buscar status do CLP:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar status do CLP' });
  }
}

/**
 * Lê registro D33 do CLP manualmente
 */
export async function readPlcRegister(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const value = await modbusService.readRegisterD33();

    res.json({
      success: true,
      register: 'D33',
      value,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Erro ao ler registro do CLP:', error);
    res.status(500).json({ error: error.message || 'Erro ao ler registro do CLP' });
  }
}

/**
 * Reseta contador do CLP (escreve 0 no D33)
 */
export async function resetPlcCounter(_req: AuthRequest, res: Response): Promise<void> {
  try {
    await modbusService.writeRegisterD33(0);

    res.json({
      success: true,
      message: 'Contador resetado com sucesso',
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('Erro ao resetar contador do CLP:', error);
    res.status(500).json({ error: error.message || 'Erro ao resetar contador do CLP' });
  }
}


