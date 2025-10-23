/**
 * Rotas de Produção e Apontamentos
 */

import { Router } from 'express';
import { 
  createAppointment,
  setActiveOrder,
  clearActiveOrder,
  getActiveOrder,
  getProductionStats,
  getPlcStatus,
  readPlcRegister,
  resetPlcCounter,
} from '../controllers/productionController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { injectCompanyId } from '../middleware/companyFilter';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(injectCompanyId); // Injeta companyId do JWT

router.post('/appointments', createAppointment);
router.post('/active-order', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), setActiveOrder);
router.delete('/active-order', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), clearActiveOrder);
router.get('/active-order', getActiveOrder);
router.get('/stats', getProductionStats);
router.get('/plc/status', getPlcStatus);
router.get('/plc/read', readPlcRegister);
router.post('/plc/reset', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), resetPlcCounter);

export default router;


