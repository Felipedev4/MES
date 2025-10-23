/**
 * Rotas de autenticação
 */

import { Router } from 'express';
import { login, register, selectCompany } from '../controllers/authController';
import { validateRequest } from '../middleware/validator';
import { loginSchema, registerSchema } from '../validators/authValidator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e autorização
 */

router.post('/login', validateRequest(loginSchema), login);
router.post('/register', validateRequest(registerSchema), register);
router.post('/select-company', selectCompany);

export default router;


