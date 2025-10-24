import { Router } from 'express';
import {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  getShiftByTime,
} from '../controllers/shiftController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas de turnos
router.get('/', getAllShifts);
router.get('/by-time', getShiftByTime);
router.get('/:id', getShiftById);
router.post('/', createShift);
router.put('/:id', updateShift);
router.delete('/:id', deleteShift);

export default router;

