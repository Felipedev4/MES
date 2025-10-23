/**
 * Rotas para gerenciamento de defeitos de produção (apontamento de perdas)
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { createProductionDefectSchema, updateProductionDefectSchema } from '../validators/productionDefectValidator';
import * as productionDefectController from '../controllers/productionDefectController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/production-defects:
 *   get:
 *     summary: Lista todos os defeitos de produção
 *     tags: [Production Defects]
 *     parameters:
 *       - in: query
 *         name: productionOrderId
 *         schema:
 *           type: integer
 *         description: Filtrar por ordem de produção
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Lista de defeitos de produção
 */
router.get('/', productionDefectController.listProductionDefects);

/**
 * @swagger
 * /api/production-defects/{id}:
 *   get:
 *     summary: Busca um defeito de produção por ID
 *     tags: [Production Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Defeito de produção encontrado
 *       404:
 *         description: Defeito de produção não encontrado
 */
router.get('/:id', productionDefectController.getProductionDefect);

/**
 * @swagger
 * /api/production-defects:
 *   post:
 *     summary: Cria um novo defeito de produção (apontamento de perda)
 *     tags: [Production Defects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productionOrderId
 *               - defectId
 *               - quantity
 *             properties:
 *               productionOrderId:
 *                 type: integer
 *               defectId:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Defeito de produção criado
 *       404:
 *         description: Ordem de produção ou defeito não encontrado
 */
router.post('/', validateRequest(createProductionDefectSchema), productionDefectController.createProductionDefect);

/**
 * @swagger
 * /api/production-defects/{id}:
 *   put:
 *     summary: Atualiza um defeito de produção
 *     tags: [Production Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Defeito de produção atualizado
 */
router.put('/:id', validateRequest(updateProductionDefectSchema), productionDefectController.updateProductionDefect);

/**
 * @swagger
 * /api/production-defects/{id}:
 *   delete:
 *     summary: Deleta um defeito de produção
 *     tags: [Production Defects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Defeito de produção deletado
 */
router.delete('/:id', productionDefectController.deleteProductionDefect);

export default router;

