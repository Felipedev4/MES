/**
 * Rotas de Paradas (Downtime)
 */

import { Router } from 'express';
import { 
  listDowntimes, 
  getDowntime, 
  createDowntime, 
  updateDowntime,
  endDowntime,
  deleteDowntime,
  getDowntimeStats,
} from '../controllers/downtimeController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { 
  createDowntimeSchema, 
  updateDowntimeSchema, 
  getDowntimeSchema, 
  deleteDowntimeSchema,
  endDowntimeSchema,
} from '../validators/downtimeValidator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/', listDowntimes);
router.get('/stats', getDowntimeStats);
router.get('/:id', validateRequest(getDowntimeSchema), getDowntime);
router.post('/', validateRequest(createDowntimeSchema), createDowntime);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateDowntimeSchema), updateDowntime);
router.patch('/:id/end', validateRequest(endDowntimeSchema), endDowntime);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), validateRequest(deleteDowntimeSchema), deleteDowntime);

export default router;


