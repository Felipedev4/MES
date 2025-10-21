/**
 * Rotas para gerenciamento de defeitos
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { createDefectSchema, updateDefectSchema } from '../validators/defectValidator';
import * as defectController from '../controllers/defectController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/defects:
 *   get:
 *     summary: Lista todos os defeitos
 *     tags: [Defects]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: Lista de defeitos
 */
router.get('/', defectController.listDefects);

/**
 * @swagger
 * /api/defects/{id}:
 *   get:
 *     summary: Busca um defeito por ID
 *     tags: [Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Defeito encontrado
 *       404:
 *         description: Defeito não encontrado
 */
router.get('/:id', defectController.getDefect);

/**
 * @swagger
 * /api/defects:
 *   post:
 *     summary: Cria um novo defeito
 *     tags: [Defects]
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
 *         description: Defeito criado
 */
router.post('/', validateRequest(createDefectSchema), defectController.createDefect);

/**
 * @swagger
 * /api/defects/{id}:
 *   put:
 *     summary: Atualiza um defeito
 *     tags: [Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Defeito atualizado
 */
router.put('/:id', validateRequest(updateDefectSchema), defectController.updateDefect);

/**
 * @swagger
 * /api/defects/{id}:
 *   delete:
 *     summary: Deleta um defeito
 *     tags: [Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Defeito deletado
 */
router.delete('/:id', defectController.deleteDefect);

export default router;

