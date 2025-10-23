/**
 * Rotas de Ordens de Produção
 */

import { Router } from 'express';
import { 
  listProductionOrders, 
  getProductionOrder, 
  createProductionOrder, 
  updateProductionOrder,
  updateStatus,
  deleteProductionOrder,
  getOrderStats,
  hasProductionAppointment,
  startProduction,
} from '../controllers/productionOrderController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { injectCompanyId } from '../middleware/companyFilter';
import { validateRequest } from '../middleware/validator';
import { 
  createProductionOrderSchema, 
  updateProductionOrderSchema, 
  getProductionOrderSchema, 
  deleteProductionOrderSchema,
  updateStatusSchema,
} from '../validators/productionOrderValidator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);
router.use(injectCompanyId); // Injeta companyId do JWT

router.get('/', listProductionOrders);
router.get('/:id', validateRequest(getProductionOrderSchema), getProductionOrder);
router.get('/:id/stats', validateRequest(getProductionOrderSchema), getOrderStats);
router.get('/:id/has-appointment', validateRequest(getProductionOrderSchema), hasProductionAppointment);
router.post('/', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(createProductionOrderSchema), createProductionOrder);
router.post('/:id/start-production', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), validateRequest(getProductionOrderSchema), startProduction);
router.put('/:id', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateProductionOrderSchema), updateProductionOrder);
router.patch('/:id/status', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), validateRequest(updateStatusSchema), updateStatus);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(deleteProductionOrderSchema), deleteProductionOrder);

export default router;


