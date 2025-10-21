/**
 * Rotas para gerenciamento de empresas
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validator';
import { createCompanySchema, updateCompanySchema } from '../validators/companyValidator';
import * as companyController from '../controllers/companyController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Lista todas as empresas
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo/inativo
 *     responses:
 *       200:
 *         description: Lista de empresas
 */
router.get('/', companyController.listCompanies);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Busca uma empresa por ID
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empresa encontrada
 *       404:
 *         description: Empresa não encontrada
 */
router.get('/:id', companyController.getCompany);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Cria uma nova empresa
 *     tags: [Companies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               tradeName:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 */
router.post('/', validateRequest(createCompanySchema), companyController.createCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Atualiza uma empresa
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Empresa atualizada
 *       404:
 *         description: Empresa não encontrada
 */
router.put('/:id', validateRequest(updateCompanySchema), companyController.updateCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   delete:
 *     summary: Deleta uma empresa
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Empresa deletada
 *       404:
 *         description: Empresa não encontrada
 */
router.delete('/:id', companyController.deleteCompany);

export default router;

