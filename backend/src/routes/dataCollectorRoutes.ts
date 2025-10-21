import { Router } from 'express';
import { validateApiKey } from '../middleware/apiKeyAuth';
import * as dataCollectorController from '../controllers/dataCollectorController';

const router = Router();

// Todas as rotas requerem API Key
router.use(validateApiKey);

// Configurações de CLP
router.get('/plc-configs', dataCollectorController.getActivePlcConfigs);
router.get('/plc-configs/:id', dataCollectorController.getPlcConfig);

// Dados de CLP
router.post('/plc-data', dataCollectorController.receivePlcData);
router.post('/plc-data/batch', dataCollectorController.receivePlcDataBatch);

// Ordens de produção
router.get('/production-orders/active', dataCollectorController.getActiveProductionOrders);

// Apontamentos de produção
router.post('/production-appointments', dataCollectorController.receiveProductionAppointment);

export default router;

