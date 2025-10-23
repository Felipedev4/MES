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
import { authenticateToken, requireRole } from '../middleware/auth';
import { injectCompanyId } from '../middleware/companyFilter';
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
router.use(injectCompanyId); // Injeta companyId do JWT

router.get('/', listMolds);
router.get('/:id', validateRequest(getMoldSchema), getMold);
router.post('/', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(createMoldSchema), createMold);
router.put('/:id', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateMoldSchema), updateMold);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(deleteMoldSchema), deleteMold);

export default router;


