/**
 * Rotas de Configurações de E-mail
 */

import { Router } from 'express';
import {
  listEmailConfigs,
  getEmailConfig,
  createEmailConfig,
  updateEmailConfig,
  deleteEmailConfig,
  testConfig,
} from '../controllers/emailConfigController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { injectCompanyId } from '../middleware/companyFilter';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(injectCompanyId);

// Listar configurações (Admin/Gerente)
router.get('/', requireRole('ADMIN', 'MANAGER'), listEmailConfigs);

// Buscar configuração por ID
router.get('/:id', requireRole('ADMIN', 'MANAGER'), getEmailConfig);

// Criar nova configuração (Admin)
router.post('/', requireRole('ADMIN'), createEmailConfig);

// Atualizar configuração (Admin)
router.put('/:id', requireRole('ADMIN'), updateEmailConfig);

// Deletar configuração (Admin)
router.delete('/:id', requireRole('ADMIN'), deleteEmailConfig);

// Testar configuração (Admin/Gerente)
router.post('/:id/test', requireRole('ADMIN', 'MANAGER'), testConfig);

export default router;

