-- Script: Atualizar Permissões - Substituir production e production_posting por manual_posting
-- Remove as permissões antigas e adiciona as novas

-- =============================================================================
-- 1. REMOVER PERMISSÕES ANTIGAS
-- =============================================================================

DELETE FROM role_permissions WHERE resource = 'production';
DELETE FROM role_permissions WHERE resource = 'production_posting';

-- =============================================================================
-- 2. ADICIONAR PERMISSÕES PARA "manual_posting" (Apontamento Manual)
-- =============================================================================

-- ADMIN: Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'manual_posting', true, true, true, true, NOW(), NOW());

-- DIRECTOR: Completo exceto deletar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'manual_posting', true, true, true, false, NOW(), NOW());

-- MANAGER: Completo com delete
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'manual_posting', true, true, true, true, NOW(), NOW());

-- SUPERVISOR: Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'manual_posting', true, true, true, false, NOW(), NOW());

-- LEADER: Pode criar e editar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('LEADER', 'manual_posting', true, true, true, false, NOW(), NOW());

-- OPERATOR: Pode visualizar e criar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('OPERATOR', 'manual_posting', true, true, false, false, NOW(), NOW());

-- =============================================================================
-- 3. VERIFICAÇÃO
-- =============================================================================

-- Verificar se as antigas foram removidas
SELECT 'Verificação: Permissões antigas' as status;
SELECT COUNT(*) as total_antigas
FROM role_permissions
WHERE resource IN ('production', 'production_posting');

-- Verificar se as novas foram adicionadas
SELECT 'Verificação: Novas permissões' as status;
SELECT role, "canView", "canCreate", "canEdit", "canDelete"
FROM role_permissions
WHERE resource = 'manual_posting'
ORDER BY 
  CASE role
    WHEN 'ADMIN' THEN 1
    WHEN 'DIRECTOR' THEN 2
    WHEN 'MANAGER' THEN 3
    WHEN 'SUPERVISOR' THEN 4
    WHEN 'LEADER' THEN 5
    WHEN 'OPERATOR' THEN 6
  END;

-- Listar todos os recursos atuais
SELECT 'Total de recursos cadastrados' as status;
SELECT COUNT(DISTINCT resource) as total_recursos
FROM role_permissions;

SELECT 'Lista de recursos' as status;
SELECT DISTINCT resource 
FROM role_permissions 
ORDER BY resource;

