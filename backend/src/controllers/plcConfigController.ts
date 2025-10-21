/**
 * Controller de Configuração do CLP
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/database';
import { modbusService } from '../services/modbusService';

/**
 * Lista todas as configurações de CLP
 */
export async function listPlcConfigs(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const configs = await prisma.plcConfig.findMany({
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        registers: {
          orderBy: { registerAddress: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(configs);
  } catch (error: any) {
    console.error('Erro ao listar configurações do CLP:', error);
    res.status(500).json({ error: error.message || 'Erro ao listar configurações' });
  }
}

/**
 * Obtém uma configuração de CLP por ID
 */
export async function getPlcConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const config = await prisma.plcConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        registers: {
          orderBy: { registerAddress: 'asc' },
        },
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Configuração não encontrada' });
      return;
    }

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar configuração' });
  }
}

/**
 * Cria uma nova configuração de CLP
 */
export async function createPlcConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      name,
      host,
      port = 502,
      unitId = 1,
      timeout = 5000,
      pollingInterval = 1000,
      reconnectInterval = 10000,
      sectorId,
      active = true,
    } = req.body;

    const config = await prisma.plcConfig.create({
      data: {
        name,
        host,
        port,
        unitId,
        timeout,
        pollingInterval,
        reconnectInterval,
        sectorId: sectorId || null,
        active,
      },
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        registers: true,
      },
    });

    res.status(201).json(config);
  } catch (error: any) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar configuração' });
  }
}

/**
 * Atualiza uma configuração de CLP
 */
export async function updatePlcConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const config = await prisma.plcConfig.update({
      where: { id: parseInt(id) },
      data,
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        registers: true,
      },
    });

    // Se a configuração está ativa, reconectar o serviço Modbus
    if (config.active) {
      await modbusService.reconnectWithNewConfig(config);
    }

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar configuração' });
  }
}

/**
 * Deleta uma configuração de CLP
 */
export async function deletePlcConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.plcConfig.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar configuração' });
  }
}

/**
 * Ativa uma configuração de CLP
 */
export async function activatePlcConfig(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Desativar todas as outras configurações
    await prisma.plcConfig.updateMany({
      where: { active: true },
      data: { active: false },
    });

    // Ativar a configuração selecionada
    const config = await prisma.plcConfig.update({
      where: { id: parseInt(id) },
      data: { active: true },
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        registers: true,
      },
    });

    // Reconectar com a nova configuração
    await modbusService.reconnectWithNewConfig(config);

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao ativar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao ativar configuração' });
  }
}

/**
 * Obtém a configuração ativa
 */
export async function getActiveConfig(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const config = await prisma.plcConfig.findFirst({
      where: { active: true },
      include: {
        sector: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        registers: {
          where: { enabled: true },
          orderBy: { registerAddress: 'asc' },
        },
      },
    });

    res.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configuração ativa:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar configuração ativa' });
  }
}

// ============== REGISTROS ==============

/**
 * Cria um novo registro para um CLP
 */
export async function createPlcRegister(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      plcConfigId,
      registerName,
      registerAddress,
      description,
      dataType = 'INT16',
      enabled = true,
    } = req.body;

    const register = await prisma.plcRegister.create({
      data: {
        plcConfigId,
        registerName,
        registerAddress,
        description,
        dataType,
        enabled,
      },
    });

    // Recarregar configuração se for da configuração ativa
    const plcConfig = await prisma.plcConfig.findUnique({
      where: { id: plcConfigId },
      include: { registers: true },
    });

    if (plcConfig && plcConfig.active) {
      await modbusService.reconnectWithNewConfig(plcConfig);
    }

    res.status(201).json(register);
  } catch (error: any) {
    console.error('Erro ao criar registro:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar registro' });
  }
}

/**
 * Atualiza um registro do CLP
 */
export async function updatePlcRegister(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const data = req.body;

    const register = await prisma.plcRegister.update({
      where: { id: parseInt(id) },
      data,
      include: { plcConfig: { include: { registers: true } } },
    });

    // Recarregar configuração se for da configuração ativa
    if (register.plcConfig.active) {
      await modbusService.reconnectWithNewConfig(register.plcConfig);
    }

    res.json(register);
  } catch (error: any) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar registro' });
  }
}

/**
 * Deleta um registro do CLP
 */
export async function deletePlcRegister(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Buscar registro antes de deletar para obter o plcConfigId
    const register = await prisma.plcRegister.findUnique({
      where: { id: parseInt(id) },
      include: { plcConfig: { include: { registers: true } } },
    });

    if (!register) {
      res.status(404).json({ error: 'Registro não encontrado' });
      return;
    }

    await prisma.plcRegister.delete({
      where: { id: parseInt(id) },
    });

    // Recarregar configuração se for da configuração ativa
    if (register.plcConfig.active) {
      // Buscar configuração atualizada sem o registro deletado
      const updatedConfig = await prisma.plcConfig.findUnique({
        where: { id: register.plcConfig.id },
        include: { registers: true },
      });

      if (updatedConfig) {
        await modbusService.reconnectWithNewConfig(updatedConfig);
      }
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar registro' });
  }
}

/**
 * Testa conexão com um CLP
 */
export async function testPlcConnection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { host, port, unitId, timeout } = req.body;

    const result = await modbusService.testConnection({
      host,
      port: port || 502,
      unitId: unitId || 1,
      timeout: timeout || 5000,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Erro ao testar conexão:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Erro ao testar conexão' 
    });
  }
}

