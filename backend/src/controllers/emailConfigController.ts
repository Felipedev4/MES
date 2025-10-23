/**
 * Controller de Configurações de E-mail
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/companyFilter';
import { encryptPassword, testEmailConfig } from '../services/emailService';

/**
 * Lista todas as configurações de e-mail
 */
export async function listEmailConfigs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;

    const where: any = {};
    if (companyId) {
      where.OR = [
        { companyId },
        { companyId: null }, // Configurações globais
      ];
    }

    const configs = await prisma.emailConfig.findMany({
      where,
      include: {
        company: true,
        _count: {
          select: {
            maintenanceAlerts: true,
            emailLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Remover senha da resposta
    const sanitized = configs.map(config => {
      const { password, ...rest } = config as any;
      return rest;
    });

    res.json(sanitized);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ error: 'Erro ao listar configurações' });
  }
}

/**
 * Busca configuração por ID
 */
export async function getEmailConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const config = await prisma.emailConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        company: true,
        maintenanceAlerts: {
          include: {
            mold: true,
            company: true,
          },
        },
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Configuração não encontrada' });
      return;
    }

    // Remover senha
    const { password, ...sanitized } = config as any;
    res.json(sanitized);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
}

/**
 * Cria nova configuração
 */
export async function createEmailConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const { name, host, port, secure, username, password, fromEmail, fromName, active = true } = req.body;

    // Criptografar senha
    const encryptedPassword = encryptPassword(password);

    const config = await prisma.emailConfig.create({
      data: {
        companyId,
        name,
        host,
        port: parseInt(port),
        secure: secure !== false,
        username,
        password: encryptedPassword,
        fromEmail,
        fromName,
        active,
      },
      include: {
        company: true,
      },
    });

    console.log(`✅ Configuração de e-mail criada: ${config.name}`);

    // Remover senha
    const { password: _, ...sanitized } = config as any;
    res.status(201).json(sanitized);
  } catch (error: any) {
    console.error('Erro ao criar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar configuração' });
  }
}

/**
 * Atualiza configuração
 */
export async function updateEmailConfig(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, host, port, secure, username, password, fromEmail, fromName, active } = req.body;

    const data: any = {
      name,
      host,
      port: port ? parseInt(port) : undefined,
      secure,
      username,
      fromEmail,
      fromName,
      active,
    };

    // Se senha foi fornecida, criptografar
    if (password) {
      data.password = encryptPassword(password);
    }

    // Remover campos undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const config = await prisma.emailConfig.update({
      where: { id: parseInt(id) },
      data,
      include: {
        company: true,
      },
    });

    console.log(`✅ Configuração de e-mail atualizada: ${config.name}`);

    // Remover senha
    const { password: _, ...sanitized } = config as any;
    res.json(sanitized);
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar configuração' });
  }
}

/**
 * Deleta configuração
 */
export async function deleteEmailConfig(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Verificar se tem alertas vinculados
    const config = await prisma.emailConfig.findUnique({
      where: { id: parseInt(id) },
      include: {
        maintenanceAlerts: true,
      },
    });

    if (!config) {
      res.status(404).json({ error: 'Configuração não encontrada' });
      return;
    }

    if (config.maintenanceAlerts.length > 0) {
      res.status(400).json({ 
        error: 'Não é possível excluir. Existem alertas de manutenção vinculados.' 
      });
      return;
    }

    await prisma.emailConfig.delete({
      where: { id: parseInt(id) },
    });

    console.log(`✅ Configuração de e-mail excluída: ${config.name}`);
    res.json({ message: 'Configuração excluída com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir configuração' });
  }
}

/**
 * Testa configuração de e-mail
 */
export async function testConfig(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await testEmailConfig(parseInt(id));

    if (result.success) {
      res.json({ message: 'Conexão testada com sucesso!' });
    } else {
      res.status(400).json({ error: result.error || 'Erro ao testar configuração' });
    }
  } catch (error: any) {
    console.error('Erro ao testar configuração:', error);
    res.status(500).json({ error: error.message || 'Erro ao testar configuração' });
  }
}

