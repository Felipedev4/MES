/**
 * Rotas de Itens
 */

import { Router } from 'express';
import { 
  listItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem 
} from '../controllers/itemController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { 
  createItemSchema, 
  updateItemSchema, 
  getItemSchema, 
  deleteItemSchema 
} from '../validators/itemValidator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/', listItems);
router.get('/:id', validateRequest(getItemSchema), getItem);
router.post('/', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(createItemSchema), createItem);
router.put('/:id', authorizeRoles('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateItemSchema), updateItem);
router.delete('/:id', authorizeRoles('ADMIN', 'MANAGER'), validateRequest(deleteItemSchema), deleteItem);

export default router;


