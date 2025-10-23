-- Script para adicionar permissões da Central de E-mails
-- Execute este script no banco de dados 'mes_db'

-- ADMIN - Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('ADMIN', 'email_logs', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canCreate" = true,
  "canEdit" = true,
  "canDelete" = true,
  "updatedAt" = NOW();

-- DIRECTOR - Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('DIRECTOR', 'email_logs', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "canCreate" = true,
  "canEdit" = true,
  "canDelete" = true,
  "updatedAt" = NOW();

-- MANAGER - Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('MANAGER', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "updatedAt" = NOW();

-- SUPERVISOR - Apenas visualizar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('SUPERVISOR', 'email_logs', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE SET
  "canView" = true,
  "updatedAt" = NOW();

-- LEADER - Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('LEADER', 'email_logs', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO NOTHING;

-- OPERATOR - Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES ('OPERATOR', 'email_logs', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO NOTHING;

-- Verificar se as permissões foram criadas
SELECT role, resource, "canView", "canCreate", "canEdit", "canDelete"
FROM role_permissions
WHERE resource = 'email_logs'
ORDER BY role;

