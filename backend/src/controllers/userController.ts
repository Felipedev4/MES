/**
 * Controller de Usuários/Colaboradores
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Listar usuários
export const listUsers = async (req: Request, res: Response) => {
  try {
    const { active, role } = req.query;
    
    const where: any = {};
    
    if (active !== undefined) {
      where.active = active === 'true';
    }
    
    if (role) {
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        employeeCode: true,
        phone: true,
        department: true,
        mustChangePassword: true,
        lastPasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return res.json(users);
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};

// Obter usuário por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        employeeCode: true,
        phone: true,
        department: true,
        mustChangePassword: true,
        lastPasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  } catch (error: any) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// Criar usuário
export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      role,
      active = true,
      employeeCode,
      phone,
      department,
      mustChangePassword = true,
    } = req.body;

    // Validações
    if (!email || !password || !name || !role) {
      return res.status(400).json({ 
        error: 'Email, senha, nome e perfil são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Verificar se código de funcionário já existe
    if (employeeCode) {
      const existingCode = await prisma.user.findUnique({
        where: { employeeCode },
      });

      if (existingCode) {
        return res.status(400).json({ 
          error: 'Código de funcionário já cadastrado' 
        });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        active,
        employeeCode: employeeCode || null,
        phone: phone || null,
        department: department || null,
        mustChangePassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        employeeCode: true,
        phone: true,
        department: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(user);
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

// Atualizar usuário
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      email,
      name,
      role,
      active,
      employeeCode,
      phone,
      department,
      mustChangePassword,
      password,
    } = req.body;

    const userId = parseInt(id);

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar duplicidade de email
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }

    // Verificar duplicidade de código de funcionário
    if (employeeCode && employeeCode !== existingUser.employeeCode) {
      const codeExists = await prisma.user.findUnique({
        where: { employeeCode },
      });

      if (codeExists) {
        return res.status(400).json({ 
          error: 'Código de funcionário já cadastrado' 
        });
      }
    }

    const updateData: any = {
      email,
      name,
      role,
      active,
      employeeCode: employeeCode || null,
      phone: phone || null,
      department: department || null,
      mustChangePassword,
    };

    // Se senha foi fornecida, atualizar
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
      updateData.lastPasswordChange = new Date();
      updateData.mustChangePassword = false;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        employeeCode: true,
        phone: true,
        department: true,
        mustChangePassword: true,
        lastPasswordChange: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(user);
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Soft delete - apenas desativar
    await prisma.user.update({
      where: { id: userId },
      data: { active: false },
    });

    return res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar usuário:', error);
    return res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
};

// Trocar senha
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const userId = parseInt(id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Senha atual e nova senha são obrigatórias' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Nova senha deve ter no mínimo 6 caracteres' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    // Atualizar senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        lastPasswordChange: new Date(),
      },
    });

    return res.json({ message: 'Senha alterada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao trocar senha:', error);
    return res.status(500).json({ error: 'Erro ao trocar senha' });
  }
};

// Resetar senha (admin)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword, mustChangePassword = true } = req.body;
    const userId = parseInt(id);

    if (!newPassword) {
      return res.status(400).json({ error: 'Nova senha é obrigatória' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'Nova senha deve ter no mínimo 6 caracteres' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword,
        lastPasswordChange: new Date(),
      },
    });

    return res.json({ message: 'Senha resetada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao resetar senha:', error);
    return res.status(500).json({ error: 'Erro ao resetar senha' });
  }
};

