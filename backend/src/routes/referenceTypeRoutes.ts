/**
 * Rotas para gerenciamento de tipos de referência
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { createReferenceTypeSchema, updateReferenceTypeSchema } from '../validators/referenceTypeValidator';
import * as referenceTypeController from '../controllers/referenceTypeController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/reference-types:
 *   get:
 *     summary: Lista todos os tipos de referência
 *     tags: [ReferenceTypes]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de tipos de referência
 */
router.get('/', referenceTypeController.listReferenceTypes);

/**
 * @swagger
 * /api/reference-types/{id}:
 *   get:
 *     summary: Busca um tipo de referência por ID
 *     tags: [ReferenceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de referência encontrado
 *       404:
 *         description: Tipo de referência não encontrado
 */
router.get('/:id', referenceTypeController.getReferenceType);

/**
 * @swagger
 * /api/reference-types:
 *   post:
 *     summary: Cria um novo tipo de referência
 *     tags: [ReferenceTypes]
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
 *         description: Tipo de referência criado
 */
router.post('/', validateRequest(createReferenceTypeSchema), referenceTypeController.createReferenceType);

/**
 * @swagger
 * /api/reference-types/{id}:
 *   put:
 *     summary: Atualiza um tipo de referência
 *     tags: [ReferenceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de referência atualizado
 */
router.put('/:id', validateRequest(updateReferenceTypeSchema), referenceTypeController.updateReferenceType);

/**
 * @swagger
 * /api/reference-types/{id}:
 *   delete:
 *     summary: Deleta um tipo de referência
 *     tags: [ReferenceTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tipo de referência deletado
 */
router.delete('/:id', referenceTypeController.deleteReferenceType);

export default router;

