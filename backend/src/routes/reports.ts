/**
 * Rotas de Relatórios
 */

import { Router } from 'express';
import {
  getProductionReport,
  getDefectsReport,
  getDowntimeReport,
  getEfficiencyReport,
  getOrdersReport,
} from '../controllers/reportsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar autenticação a todas as rotas
router.use(authenticateToken);

// Rotas de relatórios
router.get('/production', getProductionReport);
router.get('/defects', getDefectsReport);
router.get('/downtime', getDowntimeReport);
router.get('/efficiency', getEfficiencyReport);
router.get('/orders', getOrdersReport);

export default router;

