/**
 * Rotas de Usuários/Colaboradores
 */

import { Router } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword,
} from '../controllers/userController';

const router = Router();

// Listar usuários
router.get('/', listUsers);

// Obter usuário por ID
router.get('/:id', getUserById);

// Criar usuário
router.post('/', createUser);

// Atualizar usuário
router.put('/:id', updateUser);

// Deletar usuário
router.delete('/:id', deleteUser);

// Trocar senha
router.post('/:id/change-password', changePassword);

// Resetar senha (admin)
router.post('/:id/reset-password', resetPassword);

export default router;

