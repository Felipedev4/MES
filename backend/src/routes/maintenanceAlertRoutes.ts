/**
 * Rotas de Alertas de Manutenção
 */

import { Router } from 'express';
import {
  listMaintenanceAlerts,
  getMaintenanceAlert,
  createMaintenanceAlert,
  updateMaintenanceAlert,
  deleteMaintenanceAlert,
  checkAlerts,
  forceSendAlert,
  getUpcoming,
  getEmailLogs,
  clearEmailLogs,
} from '../controllers/maintenanceAlertController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { injectCompanyId } from '../middleware/companyFilter';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(injectCompanyId);

// Listar alertas (Admin/Gerente)
router.get('/', requireRole('ADMIN', 'MANAGER'), listMaintenanceAlerts);

// IMPORTANT: Specific routes MUST come before parameterized routes (/:id)

// Obter próximas manutenções
router.get('/upcoming/list', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), getUpcoming);

// Obter histórico de envios de e-mail
router.get('/email-logs', requireRole('ADMIN', 'MANAGER'), getEmailLogs);

// Limpar histórico de envios de e-mail
router.delete('/email-logs', requireRole('ADMIN'), clearEmailLogs);

// Verificar e enviar alertas manualmente (Admin)
router.post('/check', requireRole('ADMIN'), checkAlerts);

// Buscar alerta por ID (MUST be after specific GET routes)
router.get('/:id', requireRole('ADMIN', 'MANAGER'), getMaintenanceAlert);

// Criar novo alerta (Admin/Gerente)
router.post('/', requireRole('ADMIN', 'MANAGER'), createMaintenanceAlert);

// Atualizar alerta (Admin/Gerente)
router.put('/:id', requireRole('ADMIN', 'MANAGER'), updateMaintenanceAlert);

// Deletar alerta (Admin/Gerente)
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), deleteMaintenanceAlert);

// Forçar envio de alerta específico (Admin/Gerente)
router.post('/:id/send', requireRole('ADMIN', 'MANAGER'), forceSendAlert);

export default router;

