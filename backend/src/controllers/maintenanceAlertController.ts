/**
 * Controller de Alertas de Manutenção
 */

import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthenticatedRequest } from '../middleware/companyFilter';
import { checkAndSendMaintenanceAlerts, getUpcomingMaintenances } from '../services/maintenanceAlertService';

/**
 * Helper: Converte campos do backend para frontend
 * - recipients → recipientEmails
 * - daysBeforeAlert → daysBeforeMaintenance
 */
function mapAlertToResponse(alert: any) {
  if (!alert) return null;
  const { recipients, daysBeforeAlert, ...rest } = alert;
  return { 
    ...rest, 
    recipientEmails: recipients,
    daysBeforeMaintenance: daysBeforeAlert
  };
}

/**
 * Lista todos os alertas
 */
export async function listMaintenanceAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;

    const where: any = {};
    if (companyId) {
      where.OR = [
        { companyId },
        { companyId: null }, // Alertas globais
      ];
    }

    const alerts = await prisma.maintenanceAlert.findMany({
      where,
      include: {
        emailConfig: {
          select: {
            id: true,
            name: true,
            fromEmail: true,
          },
        },
        company: true,
        mold: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(alerts.map(mapAlertToResponse));
  } catch (error) {
    console.error('Erro ao listar alertas:', error);
    res.status(500).json({ error: 'Erro ao listar alertas' });
  }
}

/**
 * Busca alerta por ID
 */
export async function getMaintenanceAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const alertId = parseInt(id);

    if (isNaN(alertId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const alert = await prisma.maintenanceAlert.findUnique({
      where: { id: alertId },
      include: {
        emailConfig: true,
        company: true,
        mold: true,
      },
    });

    if (!alert) {
      res.status(404).json({ error: 'Alerta não encontrado' });
      return;
    }

    res.json(mapAlertToResponse(alert));
  } catch (error) {
    console.error('Erro ao buscar alerta:', error);
    res.status(500).json({ error: 'Erro ao buscar alerta' });
  }
}

/**
 * Cria novo alerta
 */
export async function createMaintenanceAlert(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;
    const { emailConfigId, moldId, daysBeforeMaintenance, recipientEmails, active = true } = req.body;
    const recipients = recipientEmails; // Frontend envia recipientEmails, mas schema usa recipients
    const daysBeforeAlert = daysBeforeMaintenance; // Frontend envia daysBeforeMaintenance, mas schema usa daysBeforeAlert

    // Verificar se config de e-mail existe
    const emailConfig = await prisma.emailConfig.findUnique({
      where: { id: emailConfigId },
    });

    if (!emailConfig) {
      res.status(404).json({ error: 'Configuração de e-mail não encontrada' });
      return;
    }

    // Verificar se molde existe (se especificado)
    if (moldId) {
      const mold = await prisma.mold.findUnique({
        where: { id: moldId },
      });

      if (!mold) {
        res.status(404).json({ error: 'Molde não encontrado' });
        return;
      }
    }

    const alert = await prisma.maintenanceAlert.create({
      data: {
        emailConfigId,
        companyId: moldId ? undefined : companyId, // Se molde específico, não usa companyId
        moldId,
        daysBeforeAlert: daysBeforeAlert || 7,
        recipients,
        active,
      },
      include: {
        emailConfig: true,
        company: true,
        mold: true,
      },
    });

    console.log(`✅ Alerta de manutenção criado: ID ${alert.id}`);
    res.status(201).json(mapAlertToResponse(alert));
  } catch (error: any) {
    console.error('Erro ao criar alerta:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar alerta' });
  }
}

/**
 * Atualiza alerta
 */
export async function updateMaintenanceAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const alertId = parseInt(id);

    if (isNaN(alertId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const { emailConfigId, moldId, daysBeforeMaintenance, recipientEmails, active } = req.body;
    const recipients = recipientEmails; // Frontend envia recipientEmails, mas schema usa recipients
    const daysBeforeAlert = daysBeforeMaintenance; // Frontend envia daysBeforeMaintenance, mas schema usa daysBeforeAlert

    const data: any = {
      emailConfigId,
      moldId,
      daysBeforeAlert,
      recipients,
      active,
    };

    // Remover undefined
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

    const alert = await prisma.maintenanceAlert.update({
      where: { id: alertId },
      data,
      include: {
        emailConfig: true,
        company: true,
        mold: true,
      },
    });

    console.log(`✅ Alerta de manutenção atualizado: ID ${alert.id}`);
    res.json(mapAlertToResponse(alert));
  } catch (error: any) {
    console.error('Erro ao atualizar alerta:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar alerta' });
  }
}

/**
 * Deleta alerta
 */
export async function deleteMaintenanceAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const alertId = parseInt(id);

    if (isNaN(alertId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    await prisma.maintenanceAlert.delete({
      where: { id: alertId },
    });

    console.log(`✅ Alerta de manutenção excluído: ID ${alertId}`);
    res.json({ message: 'Alerta excluído com sucesso' });
  } catch (error: any) {
    console.error('Erro ao excluir alerta:', error);
    res.status(500).json({ error: error.message || 'Erro ao excluir alerta' });
  }
}

/**
 * Verifica e envia alertas manualmente
 */
export async function checkAlerts(_req: Request, res: Response): Promise<void> {
  try {
    const result = await checkAndSendMaintenanceAlerts();
    res.json({
      message: 'Verificação concluída',
      ...result,
    });
  } catch (error: any) {
    console.error('Erro ao verificar alertas:', error);
    res.status(500).json({ error: error.message || 'Erro ao verificar alertas' });
  }
}

/**
 * Força envio de alerta específico (manual)
 */
export async function forceSendAlert(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const alertId = parseInt(id);

    if (isNaN(alertId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    // Buscar o alerta
    const alert = await prisma.maintenanceAlert.findUnique({
      where: { id: alertId },
      include: {
        emailConfig: true,
        mold: true,
      },
    });

    if (!alert) {
      res.status(404).json({ error: 'Alerta não encontrado' });
      return;
    }

    if (!alert.mold) {
      res.status(400).json({ error: 'Este alerta não está vinculado a um molde específico' });
      return;
    }

    if (!alert.mold.maintenanceDate) {
      res.status(400).json({ error: 'O molde não possui data de manutenção cadastrada' });
      return;
    }

    // Importar sendEmail
    const { sendEmail } = await import('../services/emailService');

    // Calcular dias até manutenção
    const now = new Date();
    const maintenanceDate = new Date(alert.mold.maintenanceDate);
    const daysUntil = Math.ceil((maintenanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Preparar corpo do e-mail
    const emailBody = `
      <h2>Alerta de Manutenção - ENVIO MANUAL</h2>
      <p>Prezado(a),</p>
      <p>Este é um alerta <strong>manual</strong> de manutenção programada.</p>
      <h3>Informações do Molde:</h3>
      <ul>
        <li><strong>Código:</strong> ${alert.mold.code}</li>
        <li><strong>Descrição:</strong> ${alert.mold.description || 'N/A'}</li>
        <li><strong>Data da Próxima Manutenção:</strong> ${maintenanceDate.toLocaleDateString('pt-BR')}</li>
        <li><strong>Dias Restantes:</strong> ${daysUntil} dia(s)</li>
      </ul>
      <p>Por favor, programe a manutenção preventiva.</p>
      <hr>
      <p><small>Sistema MES - Manufacturing Execution System</small></p>
    `;

    // Enviar para cada destinatário
    const recipients = alert.recipients.split(',').map(e => e.trim());
    const results = [];

    for (const recipient of recipients) {
      try {
        // sendEmail já cria o log automaticamente, não precisa criar manualmente
        await sendEmail(
          alert.emailConfigId,
          {
            to: recipient,
            subject: `Alerta de Manutenção - ${alert.mold.code} (MANUAL)`,
            html: emailBody,
          },
          alert.moldId || undefined
        );
        results.push({ recipient, status: 'enviado' });
      } catch (error: any) {
        results.push({ recipient, status: 'erro', error: error.message });
      }
    }

    // Atualizar lastCheck
    await prisma.maintenanceAlert.update({
      where: { id: alert.id },
      data: { lastCheck: new Date() },
    });

    console.log(`✅ Alerta manual enviado: ${alert.mold.code} para ${recipients.length} destinatário(s)`);
    
    res.json({
      message: `Alerta enviado manualmente para ${results.length} destinatário(s)`,
      results,
    });
  } catch (error: any) {
    console.error('Erro ao enviar alerta manual:', error);
    res.status(500).json({ error: error.message || 'Erro ao enviar alerta manual' });
  }
}

/**
 * Obtém próximas manutenções
 */
export async function getUpcoming(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { days = 30 } = req.query;
    const companyId = req.user?.companyId;

    const maintenances = await getUpcomingMaintenances(parseInt(days as string), companyId);
    res.json(maintenances);
  } catch (error: any) {
    console.error('Erro ao buscar próximas manutenções:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar próximas manutenções' });
  }
}

/**
 * Obtém histórico de envios de e-mail
 */
export async function getEmailLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { limit = 50 } = req.query;
    const companyId = req.user?.companyId;

    const logs = await prisma.emailLog.findMany({
      where: companyId
        ? {
            emailConfig: {
              companyId: companyId,
            },
          }
        : undefined,
      include: {
        emailConfig: {
          select: {
            name: true,
          },
        },
        mold: {
          select: {
            code: true,
            description: true,
          },
        },
      },
      orderBy: {
        sentAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json(logs);
  } catch (error: any) {
    console.error('Erro ao buscar logs de e-mail:', error);
    res.status(500).json({ error: error.message || 'Erro ao buscar logs de e-mail' });
  }
}

/**
 * Limpa histórico de logs de e-mail
 */
export async function clearEmailLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const companyId = req.user?.companyId;

    // Deletar logs filtrados por empresa (se aplicável)
    const result = await prisma.emailLog.deleteMany({
      where: companyId
        ? {
            emailConfig: {
              companyId: companyId,
            },
          }
        : undefined,
    });

    console.log(`🗑️  ${result.count} logs de e-mail deletados (Empresa: ${companyId || 'todas'})`);
    res.json({ 
      message: 'Histórico de e-mails limpo com sucesso', 
      deletedCount: result.count 
    });
  } catch (error: any) {
    console.error('Erro ao limpar logs de e-mail:', error);
    res.status(500).json({ error: error.message || 'Erro ao limpar logs de e-mail' });
  }
}

