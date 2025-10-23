-- Script: Adicionar permissões SUPERVISOR para recursos antigos
-- O role SUPERVISOR estava faltando para os recursos criados antes da sua implementação

-- Permissões padrão para SUPERVISOR:
-- - Pode visualizar dados operacionais (production, dashboard, injectors, etc)
-- - Pode criar/editar em produção e downtimes
-- - Não pode acessar configurações de sistema ou cadastros críticos

-- activity_types - Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'activity_types', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- companies - Visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'companies', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- dashboard - Acesso total de visualização
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'dashboard', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- defects - Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'defects', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- downtimes - Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'downtimes', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- injectors - Visualizar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'injectors', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- items - Visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'items', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- molds - Visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'molds', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- plc_config - Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'plc_config', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- production - Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'production', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- production_orders - Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'production_orders', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- production_posting - Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'production_posting', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- reference_types - Visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'reference_types', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- reports - Visualizar e criar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'reports', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = true, "canEdit" = true, "canDelete" = false, "updatedAt" = NOW();

-- sectors - Visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'sectors', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- users - Visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'users', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET "canView" = true, "canCreate" = false, "canEdit" = false, "canDelete" = false, "updatedAt" = NOW();

-- Verificação
SELECT '✅ Permissões SUPERVISOR adicionadas com sucesso!' AS status;

-- Verificar se todos os recursos agora têm 6 roles
SELECT 
  resource,
  COUNT(DISTINCT role) AS roles_configurados,
  CASE 
    WHEN COUNT(DISTINCT role) = 6 THEN '✅ Completo'
    ELSE '❌ Faltam ' || (6 - COUNT(DISTINCT role))::text || ' roles'
  END AS status
FROM role_permissions
GROUP BY resource
ORDER BY resource;

