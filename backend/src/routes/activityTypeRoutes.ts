/**
 * Rotas para gerenciamento de tipos de atividade
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { createActivityTypeSchema, updateActivityTypeSchema } from '../validators/activityTypeValidator';
import * as activityTypeController from '../controllers/activityTypeController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/activity-types:
 *   get:
 *     summary: Lista todos os tipos de atividade
 *     tags: [ActivityTypes]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de tipos de atividade
 */
router.get('/', activityTypeController.listActivityTypes);

/**
 * @swagger
 * /api/activity-types/{id}:
 *   get:
 *     summary: Busca um tipo de atividade por ID
 *     tags: [ActivityTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de atividade encontrado
 *       404:
 *         description: Tipo de atividade não encontrado
 */
router.get('/:id', activityTypeController.getActivityType);

/**
 * @swagger
 * /api/activity-types:
 *   post:
 *     summary: Cria um novo tipo de atividade
 *     tags: [ActivityTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *     responses:
 *       201:
 *         description: Tipo de atividade criado
 */
router.post('/', validateRequest(createActivityTypeSchema), activityTypeController.createActivityType);

/**
 * @swagger
 * /api/activity-types/{id}:
 *   put:
 *     summary: Atualiza um tipo de atividade
 *     tags: [ActivityTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de atividade atualizado
 */
router.put('/:id', validateRequest(updateActivityTypeSchema), activityTypeController.updateActivityType);

/**
 * @swagger
 * /api/activity-types/{id}:
 *   delete:
 *     summary: Deleta um tipo de atividade
 *     tags: [ActivityTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tipo de atividade deletado
 */
router.delete('/:id', activityTypeController.deleteActivityType);

export default router;

