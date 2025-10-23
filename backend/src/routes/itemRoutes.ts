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
import {
  getItemColors,
  updateItemColors,
  addColorToItem,
  removeColorFromItem,
} from '../controllers/colorController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { injectCompanyId } from '../middleware/companyFilter';
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
router.use(injectCompanyId); // Injeta companyId do JWT

// Rotas de Itens
router.get('/', listItems);
router.get('/:id', validateRequest(getItemSchema), getItem);
router.post('/', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(createItemSchema), createItem);
router.put('/:id', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateItemSchema), updateItem);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(deleteItemSchema), deleteItem);

// Rotas de Cores por Item
router.get('/:itemId/colors', getItemColors);
router.put('/:itemId/colors', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), updateItemColors);
router.post('/:itemId/colors/:colorId', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), addColorToItem);
router.delete('/:itemId/colors/:colorId', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), removeColorFromItem);

export default router;


