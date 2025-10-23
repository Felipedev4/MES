-- Script: Adicionar Permissões Faltantes (CORRIGIDO)
-- Adiciona permissões para recursos que existem no frontend mas não têm permissões cadastradas

-- =============================================================================
-- 1. PERMISSÕES PARA "permissions" (Gerenciamento de Permissões)
-- =============================================================================

-- ADMIN: Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'permissions', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = true,
    "canEdit" = true,
    "canDelete" = true,
    "updatedAt" = NOW();

-- DIRECTOR: Pode visualizar e editar (não pode deletar)
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'permissions', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = true,
    "canEdit" = true,
    "canDelete" = false,
    "updatedAt" = NOW();

-- MANAGER: Pode apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'permissions', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- SUPERVISOR: Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'permissions', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = false,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- LEADER: Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('LEADER', 'permissions', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = false,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- OPERATOR: Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('OPERATOR', 'permissions', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = false,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- =============================================================================
-- 2. PERMISSÕES PARA "user_companies" (Vínculo de Usuários com Empresas)
-- =============================================================================

-- ADMIN: Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'user_companies', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = true,
    "canEdit" = true,
    "canDelete" = true,
    "updatedAt" = NOW();

-- DIRECTOR: Acesso total exceto deletar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'user_companies', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = true,
    "canEdit" = true,
    "canDelete" = false,
    "updatedAt" = NOW();

-- MANAGER: Pode visualizar, criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'user_companies', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = true,
    "canEdit" = true,
    "canDelete" = false,
    "updatedAt" = NOW();

-- SUPERVISOR: Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'user_companies', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- LEADER: Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('LEADER', 'user_companies', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = true,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- OPERATOR: Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('OPERATOR', 'user_companies', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
    "canView" = false,
    "canCreate" = false,
    "canEdit" = false,
    "canDelete" = false,
    "updatedAt" = NOW();

-- =============================================================================
-- 3. VERIFICAÇÃO FINAL
-- =============================================================================

-- Mostrar recursos adicionados
SELECT '✅ Permissões adicionadas com sucesso!' as status;

-- Listar permissões dos novos recursos
SELECT 
    role,
    resource,
    "canView",
    "canCreate",
    "canEdit",
    "canDelete"
FROM role_permissions
WHERE resource IN ('permissions', 'user_companies')
ORDER BY resource, role;

-- Contar total de recursos com permissões
SELECT COUNT(DISTINCT resource) as total_resources
FROM role_permissions;

-- Listar todos os recursos
SELECT DISTINCT resource 
FROM role_permissions 
ORDER BY resource;

