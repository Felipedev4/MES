/**
 * Serviço de verificação e envio de alertas de manutenção
 */

import { prisma } from '../config/database';
import { sendEmail, getMaintenanceAlertTemplate } from './emailService';

/**
 * Verifica e envia alertas de manutenção para moldes
 */
export async function checkAndSendMaintenanceAlerts(): Promise<{
  checked: number;
  sent: number;
  errors: string[];
}> {
  console.log('🔍 Verificando alertas de manutenção...');

  const now = new Date();
  const errors: string[] = [];
  let checked = 0;
  let sent = 0;

  try {
    // Buscar todos os alertas ativos
    const alerts = await prisma.maintenanceAlert.findMany({
      where: { active: true },
      include: {
        emailConfig: true,
        mold: true,
        company: true,
      },
    });

    checked = alerts.length;

    for (const alert of alerts) {
      try {
        // Buscar moldes que precisam de alerta
        const whereClause: any = {
          active: true,
          maintenanceDate: { not: null },
        };

        // Filtrar por empresa se especificado
        if (alert.companyId) {
          whereClause.companyId = alert.companyId;
        }

        // Filtrar por molde específico se especificado
        if (alert.moldId) {
          whereClause.id = alert.moldId;
        }

        const molds = await prisma.mold.findMany({
          where: whereClause,
        });

        for (const mold of molds) {
          if (!mold.maintenanceDate) continue;

          // Calcular dias até a manutenção
          const maintenanceDate = new Date(mold.maintenanceDate);
          const diffTime = maintenanceDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Verificar se deve enviar alerta
          if (diffDays <= alert.daysBeforeAlert && diffDays >= 0) {
            // Verificar se já enviou recentemente (últimas 24h)
            const lastLog = await prisma.emailLog.findFirst({
              where: {
                moldId: mold.id,
                success: true,
                sentAt: {
                  gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                },
              },
              orderBy: { sentAt: 'desc' },
            });

            if (lastLog) {
              console.log(`⏭️  Alerta já enviado nas últimas 24h para o molde ${mold.code}`);
              continue;
            }

            // Enviar e-mail
            const recipients = alert.recipients.split(',').map(r => r.trim());
            const result = await sendEmail(
              alert.emailConfigId,
              {
                to: recipients,
                subject: `⚠️ Alerta: Manutenção do Molde ${mold.code} - ${diffDays} dias restantes`,
                html: getMaintenanceAlertTemplate(mold, diffDays),
              },
              mold.id
            );

            if (result.success) {
              sent++;
              console.log(`✅ Alerta enviado: Molde ${mold.code} (${diffDays} dias)`);
            } else {
              errors.push(`Erro ao enviar alerta para molde ${mold.code}: ${result.error}`);
            }
          }
        }

        // Atualizar última verificação
        await prisma.maintenanceAlert.update({
          where: { id: alert.id },
          data: { lastCheck: now },
        });

      } catch (error: any) {
        errors.push(`Erro ao processar alerta ID ${alert.id}: ${error.message}`);
        console.error(`❌ Erro ao processar alerta ${alert.id}:`, error);
      }
    }

    console.log(`✅ Verificação concluída: ${checked} alertas verificados, ${sent} e-mails enviados`);

  } catch (error: any) {
    errors.push(`Erro geral na verificação: ${error.message}`);
    console.error('❌ Erro geral na verificação de alertas:', error);
  }

  return { checked, sent, errors };
}

/**
 * Obtém próximos moldes que precisam de manutenção
 */
export async function getUpcomingMaintenances(days: number = 30, companyId?: number): Promise<any[]> {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const whereClause: any = {
    active: true,
    maintenanceDate: {
      gte: now,
      lte: futureDate,
    },
  };

  if (companyId) {
    whereClause.companyId = companyId;
  }

  const molds = await prisma.mold.findMany({
    where: whereClause,
    orderBy: { maintenanceDate: 'asc' },
    include: {
      company: true,
      productionOrders: {
        where: { status: 'ACTIVE' },
        take: 1,
      },
    },
  });

  return molds.map(mold => {
    const diffTime = new Date(mold.maintenanceDate!).getTime() - now.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      moldId: mold.id,
      moldCode: mold.code,
      moldDescription: mold.description,
      nextMaintenanceDate: mold.maintenanceDate,
      daysUntilMaintenance: daysUntil,
      isUrgent: daysUntil <= 7,
      hasActiveProduction: mold.productionOrders.length > 0,
      companyId: mold.companyId,
    };
  });
}

