/**
 * Controller de Permissões por Role
 */

import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todas as permissões
export const listPermissions = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    const where: any = {};
    if (role) {
      where.role = role;
    }

    const permissions = await prisma.rolePermission.findMany({
      where,
      orderBy: [
        { role: 'asc' },
        { resource: 'asc' },
      ],
    });

    return res.json(permissions);
  } catch (error: any) {
    console.error('Erro ao listar permissões:', error);
    return res.status(500).json({ error: 'Erro ao listar permissões' });
  }
};

// Obter permissões de um role específico
export const getPermissionsByRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;

    const permissions = await prisma.rolePermission.findMany({
      where: { role: role as Role },
      orderBy: { resource: 'asc' },
    });

    return res.json(permissions);
  } catch (error: any) {
    console.error('Erro ao buscar permissões:', error);
    return res.status(500).json({ error: 'Erro ao buscar permissões' });
  }
};

// Verificar permissão específica
export const checkPermission = async (req: Request, res: Response) => {
  try {
    const { role, resource, action } = req.query;

    if (!role || !resource || !action) {
      return res.status(400).json({ 
        error: 'Role, resource e action são obrigatórios' 
      });
    }

    const permission = await prisma.rolePermission.findUnique({
      where: {
        role_resource: {
          role: role as Role,
          resource: resource as string,
        },
      },
    });

    if (!permission) {
      return res.json({ allowed: false });
    }

    let allowed = false;
    switch (action) {
      case 'view':
        allowed = permission.canView;
        break;
      case 'create':
        allowed = permission.canCreate;
        break;
      case 'edit':
        allowed = permission.canEdit;
        break;
      case 'delete':
        allowed = permission.canDelete;
        break;
    }

    return res.json({ allowed });
  } catch (error: any) {
    console.error('Erro ao verificar permissão:', error);
    return res.status(500).json({ error: 'Erro ao verificar permissão' });
  }
};

// Criar ou atualizar permissão
export const upsertPermission = async (req: Request, res: Response) => {
  try {
    const {
      role,
      resource,
      canView = false,
      canCreate = false,
      canEdit = false,
      canDelete = false,
    } = req.body;

    if (!role || !resource) {
      return res.status(400).json({ 
        error: 'Role e resource são obrigatórios' 
      });
    }

    const permission = await prisma.rolePermission.upsert({
      where: {
        role_resource: {
          role: role as Role,
          resource,
        },
      },
      update: {
        canView,
        canCreate,
        canEdit,
        canDelete,
      },
      create: {
        role: role as Role,
        resource,
        canView,
        canCreate,
        canEdit,
        canDelete,
      },
    });

    return res.json(permission);
  } catch (error: any) {
    console.error('Erro ao salvar permissão:', error);
    return res.status(500).json({ error: 'Erro ao salvar permissão' });
  }
};

// Atualizar permissões em lote para um role
export const bulkUpdatePermissions = async (req: Request, res: Response) => {
  try {
    const { role, permissions } = req.body;

    if (!role || !Array.isArray(permissions)) {
      return res.status(400).json({ 
        error: 'Role e array de permissões são obrigatórios' 
      });
    }

    const results = [];

    for (const perm of permissions) {
      const result = await prisma.rolePermission.upsert({
        where: {
          role_resource: {
            role: role as Role,
            resource: perm.resource,
          },
        },
        update: {
          canView: perm.canView ?? false,
          canCreate: perm.canCreate ?? false,
          canEdit: perm.canEdit ?? false,
          canDelete: perm.canDelete ?? false,
        },
        create: {
          role: role as Role,
          resource: perm.resource,
          canView: perm.canView ?? false,
          canCreate: perm.canCreate ?? false,
          canEdit: perm.canEdit ?? false,
          canDelete: perm.canDelete ?? false,
        },
      });
      results.push(result);
    }

    return res.json({ 
      message: 'Permissões atualizadas com sucesso',
      permissions: results 
    });
  } catch (error: any) {
    console.error('Erro ao atualizar permissões em lote:', error);
    return res.status(500).json({ error: 'Erro ao atualizar permissões' });
  }
};

// Deletar permissão
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.rolePermission.delete({
      where: { id: parseInt(id) },
    });

    return res.json({ message: 'Permissão deletada com sucesso' });
  } catch (error: any) {
    console.error('Erro ao deletar permissão:', error);
    return res.status(500).json({ error: 'Erro ao deletar permissão' });
  }
};

// Inicializar permissões padrão
export const initializeDefaultPermissions = async (_req: Request, res: Response) => {
  try {
    const resources = [
      'activity_types',
      'companies',
      'dashboard',
      'defects',
      'downtimes',
      'email_config',
      'email_logs',
      'injectors',
      'items',
      'maintenance_alerts',
      'manual_posting',
      'molds',
      'permissions',
      'plc_config',
      'production',
      'production_orders',
      'production_posting',
      'reference_types',
      'reports',
      'sectors',
      'user_companies',
      'users',
    ];

    const defaultPermissions = [
      // ADMIN - Acesso total
      ...resources.map(resource => ({
        role: 'ADMIN' as Role,
        resource,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      })),
      
      // DIRECTOR - Visualização total, edição limitada
      ...resources.map(resource => ({
        role: 'DIRECTOR' as Role,
        resource,
        canView: true,
        canCreate: resource === 'users' || resource === 'plc_config' ? false : true,
        canEdit: resource === 'users' || resource === 'plc_config' ? false : true,
        canDelete: false,
      })),
      
      // MANAGER - Gestão operacional
      ...resources.map(resource => ({
        role: 'MANAGER' as Role,
        resource,
        canView: true,
        canCreate: !['users', 'user_companies', 'companies', 'permissions', 'plc_config'].includes(resource),
        canEdit: !['users', 'user_companies', 'companies', 'permissions', 'plc_config'].includes(resource),
        canDelete: ['downtimes', 'production_posting', 'manual_posting'].includes(resource),
      })),
      
      // SUPERVISOR - Supervisão operacional
      ...resources.map(resource => ({
        role: 'SUPERVISOR' as Role,
        resource,
        canView: !['users', 'user_companies', 'permissions', 'plc_config', 'email_config'].includes(resource),
        canCreate: ['production_posting', 'manual_posting', 'downtimes', 'defects', 'production_orders'].includes(resource),
        canEdit: ['production_posting', 'manual_posting', 'downtimes', 'production_orders', 'items', 'molds'].includes(resource),
        canDelete: ['downtimes', 'production_posting', 'manual_posting'].includes(resource),
      })),
      
      // LEADER - Operações do chão de fábrica
      ...resources.map(resource => ({
        role: 'LEADER' as Role,
        resource,
        canView: !['users', 'user_companies', 'permissions', 'plc_config', 'email_config', 'maintenance_alerts'].includes(resource),
        canCreate: ['production_posting', 'manual_posting', 'downtimes', 'defects'].includes(resource),
        canEdit: ['production_posting', 'manual_posting', 'downtimes', 'production_orders'].includes(resource),
        canDelete: false,
      })),
      
      // OPERATOR - Apenas operações básicas
      ...resources.map(resource => ({
        role: 'OPERATOR' as Role,
        resource,
        canView: ['dashboard', 'injectors', 'production', 'production_posting', 'manual_posting'].includes(resource),
        canCreate: ['production_posting', 'manual_posting'].includes(resource),
        canEdit: false,
        canDelete: false,
      })),
    ];

    for (const perm of defaultPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          role_resource: {
            role: perm.role,
            resource: perm.resource,
          },
        },
        update: perm,
        create: perm,
      });
    }

    return res.json({ 
      message: 'Permissões padrão inicializadas com sucesso',
      count: defaultPermissions.length 
    });
  } catch (error: any) {
    console.error('Erro ao inicializar permissões:', error);
    return res.status(500).json({ error: 'Erro ao inicializar permissões' });
  }
};

