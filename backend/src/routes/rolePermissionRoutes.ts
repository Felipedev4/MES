/**
 * Rotas de Permissões por Role
 */

import { Router } from 'express';
import {
  listPermissions,
  getPermissionsByRole,
  checkPermission,
  upsertPermission,
  bulkUpdatePermissions,
  deletePermission,
  initializeDefaultPermissions,
} from '../controllers/rolePermissionController';

const router = Router();

// Listar todas as permissões
router.get('/', listPermissions);

// Obter permissões por role
router.get('/role/:role', getPermissionsByRole);

// Verificar permissão específica
router.get('/check', checkPermission);

// Criar ou atualizar permissão
router.post('/', upsertPermission);

// Atualizar permissões em lote
router.post('/bulk', bulkUpdatePermissions);

// Inicializar permissões padrão
router.post('/initialize', initializeDefaultPermissions);

// Deletar permissão
router.delete('/:id', deletePermission);

export default router;

