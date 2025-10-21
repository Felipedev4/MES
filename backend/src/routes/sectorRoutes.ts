/**
 * Rotas para gerenciamento de setores
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { createSectorSchema, updateSectorSchema } from '../validators/sectorValidator';
import * as sectorController from '../controllers/sectorController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/sectors:
 *   get:
 *     summary: Lista todos os setores
 *     tags: [Sectors]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *         description: Filtrar por empresa
 *     responses:
 *       200:
 *         description: Lista de setores
 */
router.get('/', sectorController.listSectors);

/**
 * @swagger
 * /api/sectors/{id}:
 *   get:
 *     summary: Busca um setor por ID
 *     tags: [Sectors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Setor encontrado
 *       404:
 *         description: Setor não encontrado
 */
router.get('/:id', sectorController.getSector);

/**
 * @swagger
 * /api/sectors:
 *   post:
 *     summary: Cria um novo setor
 *     tags: [Sectors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyId
 *               - code
 *               - name
 *     responses:
 *       201:
 *         description: Setor criado com sucesso
 */
router.post('/', validateRequest(createSectorSchema), sectorController.createSector);

/**
 * @swagger
 * /api/sectors/{id}:
 *   put:
 *     summary: Atualiza um setor
 *     tags: [Sectors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Setor atualizado
 *       404:
 *         description: Setor não encontrado
 */
router.put('/:id', validateRequest(updateSectorSchema), sectorController.updateSector);

/**
 * @swagger
 * /api/sectors/{id}:
 *   delete:
 *     summary: Deleta um setor
 *     tags: [Sectors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Setor deletado
 *       404:
 *         description: Setor não encontrado
 */
router.delete('/:id', sectorController.deleteSector);

export default router;

