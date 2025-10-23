/**
 * Rotas de Cores
 */

import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import {
  listColors,
  getColor,
  createColor,
  updateColor,
  deleteColor,
} from '../controllers/colorController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @route   GET /api/colors
 * @desc    Listar todas as cores
 * @access  Private
 */
router.get('/', listColors);

/**
 * @route   GET /api/colors/:id
 * @desc    Buscar cor por ID
 * @access  Private
 */
router.get('/:id', getColor);

/**
 * @route   POST /api/colors
 * @desc    Criar nova cor
 * @access  Private (ADMIN, MANAGER)
 */
router.post('/', requireRole('ADMIN', 'MANAGER'), createColor);

/**
 * @route   PUT /api/colors/:id
 * @desc    Atualizar cor
 * @access  Private (ADMIN, MANAGER)
 */
router.put('/:id', requireRole('ADMIN', 'MANAGER'), updateColor);

/**
 * @route   DELETE /api/colors/:id
 * @desc    Deletar cor
 * @access  Private (ADMIN, MANAGER)
 */
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), deleteColor);

export default router;
