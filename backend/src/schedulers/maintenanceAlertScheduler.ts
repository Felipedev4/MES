/**
 * Scheduler para verificação automática de alertas de manutenção
 */

import * as cron from 'node-cron';
import { checkAndSendMaintenanceAlerts } from '../services/maintenanceAlertService';

let schedulerTask: cron.ScheduledTask | null = null;

/**
 * Inicia o scheduler de alertas de manutenção
 * Executa todos os dias às 08:00
 */
export function startMaintenanceAlertScheduler(): void {
  // Se já está rodando, não iniciar novamente
  if (schedulerTask) {
    console.log('⏰ Scheduler de alertas de manutenção já está ativo');
    return;
  }

  // Agendar verificação diária às 08:00
  schedulerTask = cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Executando verificação agendada de alertas de manutenção...');
    try {
      const result = await checkAndSendMaintenanceAlerts();
      console.log(`✅ Verificação agendada concluída: ${result.sent} e-mails enviados`);
      
      if (result.errors.length > 0) {
        console.warn('⚠️  Erros durante verificação:', result.errors);
      }
    } catch (error) {
      console.error('❌ Erro na verificação agendada:', error);
    }
  });

  console.log('⏰ Scheduler de alertas de manutenção iniciado (diariamente às 08:00)');
  
  // Executar verificação inicial após 1 minuto
  setTimeout(async () => {
    console.log('🔍 Executando verificação inicial de alertas...');
    try {
      const result = await checkAndSendMaintenanceAlerts();
      console.log(`✅ Verificação inicial concluída: ${result.sent} e-mails enviados`);
    } catch (error) {
      console.error('❌ Erro na verificação inicial:', error);
    }
  }, 60000); // 1 minuto
}

/**
 * Para o scheduler
 */
export function stopMaintenanceAlertScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop();
    schedulerTask = null;
    console.log('⏰ Scheduler de alertas de manutenção parado');
  }
}

/**
 * Verifica se o scheduler está ativo
 */
export function isSchedulerActive(): boolean {
  return schedulerTask !== null;
}

