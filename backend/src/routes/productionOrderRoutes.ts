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
} from '../controllers/productionOrderController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
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

router.get('/', listProductionOrders);
router.get('/:id', validateRequest(getProductionOrderSchema), getProductionOrder);
router.get('/:id/stats', validateRequest(getProductionOrderSchema), getOrderStats);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(createProductionOrderSchema), createProductionOrder);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateProductionOrderSchema), updateProductionOrder);
router.patch('/:id/status', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR', 'OPERATOR'), validateRequest(updateStatusSchema), updateStatus);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), validateRequest(deleteProductionOrderSchema), deleteProductionOrder);

export default router;


