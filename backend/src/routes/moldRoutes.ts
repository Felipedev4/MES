/**
 * Rotas de Moldes
 */

import { Router } from 'express';
import { 
  listMolds, 
  getMold, 
  createMold, 
  updateMold, 
  deleteMold 
} from '../controllers/moldController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { 
  createMoldSchema, 
  updateMoldSchema, 
  getMoldSchema, 
  deleteMoldSchema 
} from '../validators/moldValidator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/', listMolds);
router.get('/:id', validateRequest(getMoldSchema), getMold);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(createMoldSchema), createMold);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateMoldSchema), updateMold);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), validateRequest(deleteMoldSchema), deleteMold);

export default router;


