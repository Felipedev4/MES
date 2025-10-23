/**
 * Rotas de Paradas (Downtime)
 */

import { Router } from 'express';
import { 
  listDowntimes, 
  getDowntime, 
  createDowntime, 
  updateDowntime,
  endDowntime,
  deleteDowntime,
  getDowntimeStats,
  startSetup,
  getActiveSetup,
  registerProductionStop,
  resumeProduction,
  getDowntimeEmailLogs,
} from '../controllers/downtimeController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { 
  createDowntimeSchema, 
  updateDowntimeSchema, 
  getDowntimeSchema, 
  deleteDowntimeSchema,
  endDowntimeSchema,
} from '../validators/downtimeValidator';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

router.get('/', listDowntimes);
router.get('/stats', getDowntimeStats);
router.get('/email-logs', getDowntimeEmailLogs); // Buscar logs de e-mails - DEVE VIR ANTES DAS ROTAS COM :id
router.get('/active-setup', getActiveSetup); // Buscar setup ativo - DEVE VIR ANTES DAS ROTAS COM :id
router.post('/start-setup', startSetup); // Endpoint para iniciar setup - DEVE VIR ANTES DAS ROTAS COM :id
router.post('/register-stop', registerProductionStop); // Endpoint para registrar parada de produção - DEVE VIR ANTES DAS ROTAS COM :id
router.post('/resume-production', resumeProduction); // Endpoint para retomar produção - DEVE VIR ANTES DAS ROTAS COM :id
router.get('/:id', validateRequest(getDowntimeSchema), getDowntime);
router.post('/', validateRequest(createDowntimeSchema), createDowntime);
router.put('/:id', requireRole('ADMIN', 'MANAGER', 'SUPERVISOR'), validateRequest(updateDowntimeSchema), updateDowntime);
router.patch('/:id/end', validateRequest(endDowntimeSchema), endDowntime);
router.delete('/:id', requireRole('ADMIN', 'MANAGER'), validateRequest(deleteDowntimeSchema), deleteDowntime);

export default router;


