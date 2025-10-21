/**
 * Rotas de Dashboard
 */

import { Router } from 'express';
import { 
  getMainKPIs,
  getProductionByPeriod,
  getDowntimeDistribution,
  getTopItems,
  getRealtimePlcData,
} from '../controllers/dashboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/kpis', getMainKPIs);
router.get('/production-by-period', getProductionByPeriod);
router.get('/downtime-distribution', getDowntimeDistribution);
router.get('/top-items', getTopItems);
router.get('/plc-data', getRealtimePlcData);

export default router;


