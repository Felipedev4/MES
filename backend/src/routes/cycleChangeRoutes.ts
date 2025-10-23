/**
 * Rotas de Alterações de Ciclo
 */

import { Router } from 'express';
import {
  listCycleChanges,
  getCycleChangeById,
  createCycleChange,
  deleteCycleChange,
  getCycleHistory,
} from '../controllers/cycleChangeController';

const router = Router();

// Listar alterações de ciclo
router.get('/', listCycleChanges);

// Obter histórico completo de uma ordem
router.get('/history/:orderId', getCycleHistory);

// Obter alteração de ciclo por ID
router.get('/:id', getCycleChangeById);

// Criar alteração de ciclo
router.post('/', createCycleChange);

// Deletar alteração de ciclo
router.delete('/:id', deleteCycleChange);

export default router;

