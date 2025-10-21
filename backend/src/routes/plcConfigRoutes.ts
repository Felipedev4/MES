/**
 * Rotas de Configuração do CLP
 */

import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
  listPlcConfigs,
  getPlcConfig,
  createPlcConfig,
  updatePlcConfig,
  deletePlcConfig,
  activatePlcConfig,
  getActiveConfig,
  createPlcRegister,
  updatePlcRegister,
  deletePlcRegister,
  testPlcConnection,
} from '../controllers/plcConfigController';
import {
  createPlcConfigValidator,
  updatePlcConfigValidator,
  createPlcRegisterValidator,
  updatePlcRegisterValidator,
  idValidator,
} from '../validators/plcConfigValidator';

const router = Router();

// Middleware para validação com express-validator
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      success: false,
      error: 'Erro de validação',
      details: errors.array() 
    });
    return;
  }
  next();
};

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: PLC Config
 *   description: Gerenciamento de configurações do CLP
 */

/**
 * @swagger
 * /api/plc-config:
 *   get:
 *     summary: Lista todas as configurações de CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de configurações
 */
router.get('/', listPlcConfigs);

/**
 * @swagger
 * /api/plc-config/active:
 *   get:
 *     summary: Obtém a configuração ativa
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuração ativa
 */
router.get('/active', getActiveConfig);

/**
 * @swagger
 * /api/plc-config/{id}:
 *   get:
 *     summary: Obtém uma configuração por ID
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Configuração encontrada
 *       404:
 *         description: Configuração não encontrada
 */
router.get('/:id', ...idValidator, validate, getPlcConfig);

/**
 * @swagger
 * /api/plc-config:
 *   post:
 *     summary: Cria uma nova configuração de CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - host
 *             properties:
 *               name:
 *                 type: string
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               unitId:
 *                 type: integer
 *               timeout:
 *                 type: integer
 *               pollingInterval:
 *                 type: integer
 *               reconnectInterval:
 *                 type: integer
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Configuração criada
 */
router.post(
  '/',
  authorizeRoles('ADMIN', 'MANAGER'),
  ...createPlcConfigValidator,
  validate,
  createPlcConfig
);

/**
 * @swagger
 * /api/plc-config/{id}:
 *   put:
 *     summary: Atualiza uma configuração de CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Configuração atualizada
 */
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  ...updatePlcConfigValidator,
  validate,
  updatePlcConfig
);

/**
 * @swagger
 * /api/plc-config/{id}:
 *   delete:
 *     summary: Deleta uma configuração de CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Configuração deletada
 */
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  ...idValidator,
  validate,
  deletePlcConfig
);

/**
 * @swagger
 * /api/plc-config/{id}/activate:
 *   post:
 *     summary: Ativa uma configuração de CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Configuração ativada
 */
router.post(
  '/:id/activate',
  authorizeRoles('ADMIN', 'MANAGER'),
  ...idValidator,
  validate,
  activatePlcConfig
);

/**
 * @swagger
 * /api/plc-config/test-connection:
 *   post:
 *     summary: Testa conexão com CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - host
 *             properties:
 *               host:
 *                 type: string
 *               port:
 *                 type: integer
 *               unitId:
 *                 type: integer
 *               timeout:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resultado do teste
 */
router.post(
  '/test-connection',
  authorizeRoles('ADMIN', 'MANAGER'),
  testPlcConnection
);

// ============== ROTAS DE REGISTROS ==============

/**
 * @swagger
 * /api/plc-config/registers:
 *   post:
 *     summary: Cria um novo registro para um CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Registro criado
 */
router.post(
  '/registers',
  authorizeRoles('ADMIN', 'MANAGER'),
  ...createPlcRegisterValidator,
  validate,
  createPlcRegister
);

/**
 * @swagger
 * /api/plc-config/registers/{id}:
 *   put:
 *     summary: Atualiza um registro do CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro atualizado
 */
router.put(
  '/registers/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  ...updatePlcRegisterValidator,
  validate,
  updatePlcRegister
);

/**
 * @swagger
 * /api/plc-config/registers/{id}:
 *   delete:
 *     summary: Deleta um registro do CLP
 *     tags: [PLC Config]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Registro deletado
 */
router.delete(
  '/registers/:id',
  authorizeRoles('ADMIN', 'MANAGER'),
  ...idValidator,
  validate,
  deletePlcRegister
);

export default router;

