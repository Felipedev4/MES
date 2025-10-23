/**
 * Serviço de envio de e-mails
 */

import nodemailer from 'nodemailer';
import { prisma } from '../config/database';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.EMAIL_ENCRYPTION_KEY || 'mes-email-secret-key-default!';
const ALGORITHM = 'aes-256-cbc';

/**
 * Gera chave de 32 bytes para AES-256
 */
function getEncryptionKey(): Buffer {
  // Garantir que a chave tenha exatamente 32 bytes
  const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32);
  return Buffer.from(key, 'utf8');
}

/**
 * Criptografa senha
 */
export function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografa senha
 */
export function decryptPassword(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envia e-mail usando configuração específica
 */
export async function sendEmail(
  emailConfigId: number,
  options: SendEmailOptions,
  moldId?: number,
  downtimeId?: number,
  emailType?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Buscar configuração
    const config = await prisma.emailConfig.findUnique({
      where: { id: emailConfigId },
    });

    if (!config || !config.active) {
      throw new Error('Configuração de e-mail não encontrada ou inativa');
    }

    // Descriptografar senha
    const password = decryptPassword(config.password);

    // Criar transportador com mais opções de debug
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: password,
      },
      // Opções adicionais para melhor compatibilidade
      tls: {
        // Não rejeitar certificados não autorizados (útil para desenvolvimento)
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development', // Ativar debug em desenvolvimento
      logger: process.env.NODE_ENV === 'development', // Ativar log em desenvolvimento
    });

    console.log(`📧 Configuração de e-mail: ${config.host}:${config.port} (secure: ${config.secure})`);
    console.log(`📧 De: ${config.fromEmail} | Para: ${Array.isArray(options.to) ? options.to.join(', ') : options.to}`);

    // Preparar destinatários
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    // Enviar e-mail
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: recipients,
      subject: options.subject,
      text: options.text || '',
      html: options.html,
    });

    // Registrar log de sucesso
    await prisma.emailLog.create({
      data: {
        emailConfigId,
        recipients,
        subject: options.subject,
        body: options.html,
        moldId,
        downtimeId,
        emailType: emailType || 'other',
        success: true,
      },
    });

    console.log(`✅ E-mail enviado com sucesso: ${options.subject} para ${recipients}`);
    return { success: true };

  } catch (error: any) {
    console.error('❌ Erro ao enviar e-mail:', error);

    // Registrar log de erro
    try {
      const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
      await prisma.emailLog.create({
        data: {
          emailConfigId,
          recipients,
          subject: options.subject,
          body: options.html,
          moldId,
          downtimeId,
          emailType: emailType || 'other',
          success: false,
          error: error.message,
        },
      });
    } catch (logError) {
      console.error('Erro ao registrar log de e-mail:', logError);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Testa configuração de e-mail
 */
export async function testEmailConfig(emailConfigId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await prisma.emailConfig.findUnique({
      where: { id: emailConfigId },
    });

    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    const password = decryptPassword(config.password);

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.username,
        pass: password,
      },
      // IMPORTANTE: Mesmas opções TLS do sendEmail para evitar erro de certificado
      tls: {
        rejectUnauthorized: false
      },
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development',
    });

    console.log(`🧪 Testando: ${config.host}:${config.port} (secure: ${config.secure})`);

    // Verificar conexão
    await transporter.verify();

    console.log(`✅ Configuração de e-mail testada com sucesso: ${config.name}`);
    return { success: true };

  } catch (error: any) {
    console.error('❌ Erro ao testar configuração:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Template de e-mail para alerta de manutenção
 */
export function getMaintenanceAlertTemplate(mold: any, daysUntilMaintenance: number): string {
  const isUrgent = daysUntilMaintenance <= 3;
  const urgencyColor = isUrgent ? '#f44336' : '#ff9800';
  const urgencyText = isUrgent ? 'URGENTE' : 'Atenção';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-box { background: white; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .urgency { background: ${urgencyColor}; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
        .mold-info { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { color: #333; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Alerta de Manutenção de Molde</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <span class="urgency">${urgencyText}</span>
            <h2 style="margin: 15px 0;">Manutenção Programada se Aproxima</h2>
            <p style="font-size: 18px; margin: 10px 0;">
              <strong>Faltam ${daysUntilMaintenance} dias</strong> para a data de manutenção programada.
            </p>
          </div>

          <div class="mold-info">
            <h3 style="margin-top: 0; color: #1976d2;">Informações do Molde</h3>
            <div class="info-row">
              <span class="info-label">Código:</span>
              <span class="info-value">${mold.code}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Nome:</span>
              <span class="info-value">${mold.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Cavidades:</span>
              <span class="info-value">${mold.cavities}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data de Manutenção:</span>
              <span class="info-value">${new Date(mold.maintenanceDate).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          <div style="background: white; padding: 20px; border-radius: 4px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #1976d2;">Ações Recomendadas:</h3>
            <ul style="line-height: 2;">
              <li>Verificar disponibilidade da equipe de manutenção</li>
              <li>Preparar peças de reposição necessárias</li>
              <li>Programar parada de produção</li>
              <li>Notificar departamento de planejamento</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>Este é um e-mail automático do Sistema MES.</p>
          <p>Para mais informações, acesse o sistema.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template de e-mail para notificação de parada improdutiva
 */
export function getDowntimeNotificationTemplate(downtime: any, productionOrder: any, defect: any, sectors: any[]): string {
  const severityColors = {
    LOW: '#4caf50',
    MEDIUM: '#ff9800',
    HIGH: '#f44336',
    CRITICAL: '#9c27b0'
  };
  const severityLabels = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta',
    CRITICAL: 'Crítica'
  };
  
  const severityColor = severityColors[defect.severity as keyof typeof severityColors] || '#ff9800';
  const severityLabel = severityLabels[defect.severity as keyof typeof severityLabels] || 'Média';
  const sectorsText = sectors.map(s => s.name).join(', ');
  const startTime = new Date(downtime.startTime).toLocaleString('pt-BR');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-box { background: white; border-left: 4px solid ${severityColor}; padding: 20px; margin: 20px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .severity { background: ${severityColor}; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
        .info-box { background: white; padding: 20px; border-radius: 4px; margin: 15px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-row:last-child { border-bottom: none; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { color: #333; text-align: right; }
        .sector-box { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); color: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .action-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        h2 { margin: 15px 0 10px 0; color: #333; }
        h3 { margin: 10px 0; color: #1976d2; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛑 Alerta de Parada Improdutiva</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <span class="severity">Severidade: ${severityLabel}</span>
            <h2>Parada Improdutiva Detectada</h2>
            <p style="font-size: 16px; margin: 15px 0;">
              Uma parada improdutiva foi registrada e requer <strong>atenção imediata</strong> do(s) setor(es) responsável(is).
            </p>
            <p style="font-size: 14px; color: #666; margin: 5px 0;">
              <strong>Iniciada em:</strong> ${startTime}
            </p>
          </div>

          <div class="sector-box">
            <h3 style="color: white; margin-top: 0;">👥 Setor(es) Responsável(is)</h3>
            <p style="font-size: 16px; margin: 10px 0;">
              ${sectorsText}
            </p>
            <p style="font-size: 13px; opacity: 0.9; margin: 5px 0;">
              Você está recebendo este e-mail porque seu setor foi designado como responsável por resolver este tipo de defeito.
            </p>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0;">📋 Informações da Parada</h3>
            <div class="info-row">
              <span class="info-label">Motivo:</span>
              <span class="info-value">${downtime.reason}</span>
            </div>
            ${downtime.description ? `
            <div class="info-row">
              <span class="info-label">Descrição:</span>
              <span class="info-value">${downtime.description}</span>
            </div>
            ` : ''}
            <div class="info-row">
              <span class="info-label">Tipo de Defeito:</span>
              <span class="info-value">${defect.name} (${defect.code})</span>
            </div>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0;">🏭 Informações da Ordem de Produção</h3>
            <div class="info-row">
              <span class="info-label">Número da Ordem:</span>
              <span class="info-value">${productionOrder.orderNumber}</span>
            </div>
            ${productionOrder.item ? `
            <div class="info-row">
              <span class="info-label">Item:</span>
              <span class="info-value">${productionOrder.item.name} (${productionOrder.item.code})</span>
            </div>
            ` : ''}
            ${productionOrder.mold ? `
            <div class="info-row">
              <span class="info-label">Molde:</span>
              <span class="info-value">${productionOrder.mold.name} (${productionOrder.mold.code})</span>
            </div>
            ` : ''}
            ${productionOrder.sector ? `
            <div class="info-row">
              <span class="info-label">Setor de Produção:</span>
              <span class="info-value">${productionOrder.sector.name}</span>
            </div>
            ` : ''}
          </div>

          <div class="action-box">
            <h3 style="margin-top: 0; color: #f57c00;">⚡ Ações Recomendadas</h3>
            <ul style="line-height: 2; margin: 10px 0;">
              <li>Dirija-se ao local da parada <strong>o mais rápido possível</strong></li>
              <li>Avalie a situação e identifique a causa raiz</li>
              <li>Implemente ações corretivas necessárias</li>
              <li>Registre as ações tomadas no sistema</li>
              <li>Comunique o status ao responsável pela produção</li>
            </ul>
          </div>

          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 5px 0; font-size: 14px;">
              <strong>💡 Dica:</strong> Acesse o Sistema MES para visualizar mais detalhes, histórico de paradas e registrar as ações tomadas.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>Este é um e-mail automático do Sistema MES - Gestão de Paradas.</p>
          <p>Responda rapidamente para minimizar o impacto na produção.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Envia notificação de parada improdutiva para setores responsáveis
 */
export async function sendDowntimeNotification(
  downtimeId: number,
  productionOrderId: number,
  defectId: number
): Promise<{ success: boolean; error?: string; sentTo?: string[] }> {
  try {
    console.log(`📧 Iniciando envio de notificação de parada ID: ${downtimeId}`);

    // Buscar informações da parada
    const downtime = await prisma.downtime.findUnique({
      where: { id: downtimeId },
    });

    if (!downtime) {
      throw new Error('Parada não encontrada');
    }

    // Buscar informações da ordem de produção com relações
    const productionOrder = await prisma.productionOrder.findUnique({
      where: { id: productionOrderId },
      include: {
        item: true,
        mold: true,
        sector: true,
        company: {
          include: {
            emailConfigs: {
              where: { active: true },
              take: 1
            }
          }
        }
      }
    });

    if (!productionOrder) {
      throw new Error('Ordem de produção não encontrada');
    }

    // Buscar informações do defeito com setores responsáveis
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
      include: {
        defectSectors: {
          include: {
            sector: true
          }
        }
      }
    });

    if (!defect) {
      throw new Error('Defeito não encontrado');
    }

    // Filtrar setores que têm e-mail e estão configurados para receber alertas
    const responsibleSectors = defect.defectSectors
      .map(ds => ds.sector)
      .filter(sector => sector.active && sector.sendEmailOnAlert && sector.email);

    if (responsibleSectors.length === 0) {
      console.log(`⚠️ Nenhum setor configurado para receber e-mails sobre o defeito ${defect.code}`);
      return {
        success: false,
        error: 'Nenhum setor configurado para receber notificações'
      };
    }

    // Verificar se há configuração de e-mail ativa
    const emailConfigs = productionOrder.company?.emailConfigs || [];
    if (emailConfigs.length === 0) {
      console.log(`⚠️ Nenhuma configuração de e-mail ativa encontrada para a empresa`);
      return {
        success: false,
        error: 'Nenhuma configuração de e-mail ativa encontrada'
      };
    }

    const emailConfig = emailConfigs[0];

    // Preparar lista de destinatários
    const recipients = responsibleSectors.map(s => s.email!);
    const sectorsInfo = responsibleSectors.map(s => ({ name: s.name, code: s.code }));

    // Gerar template de e-mail
    const htmlTemplate = getDowntimeNotificationTemplate(downtime, productionOrder, defect, sectorsInfo);

    const subject = `🛑 ALERTA: Parada Improdutiva - ${defect.name} - OP ${productionOrder.orderNumber}`;

    // Enviar e-mail
    const result = await sendEmail(
      emailConfig.id,
      {
        to: recipients,
        subject,
        html: htmlTemplate,
        text: `Parada improdutiva detectada. Defeito: ${defect.name}. Ordem: ${productionOrder.orderNumber}. Setores responsáveis: ${sectorsInfo.map(s => s.name).join(', ')}.`
      },
      undefined, // moldId
      downtimeId,
      'downtime_notification'
    );

    if (result.success) {
      console.log(`✅ Notificação de parada enviada para ${recipients.length} setor(es): ${recipients.join(', ')}`);
      return {
        success: true,
        sentTo: recipients
      };
    } else {
      console.error(`❌ Falha ao enviar notificação de parada: ${result.error}`);
      return result;
    }

  } catch (error: any) {
    console.error('❌ Erro ao enviar notificação de parada:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

