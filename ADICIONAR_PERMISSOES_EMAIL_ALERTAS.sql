-- =============================================
-- ADICIONAR PERMISSÕES DE E-MAIL E ALERTAS
-- =============================================
-- Este script adiciona as permissões para os novos recursos:
-- - email_config: Configuração de E-mail
-- - maintenance_alerts: Alertas de Manutenção

-- ADMIN: Acesso total
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES 
  ('ADMIN', 'email_config', true, true, true, true, NOW(), NOW()),
  ('ADMIN', 'maintenance_alerts', true, true, true, true, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE
SET 
  "canView" = EXCLUDED."canView",
  "canCreate" = EXCLUDED."canCreate",
  "canEdit" = EXCLUDED."canEdit",
  "canDelete" = EXCLUDED."canDelete",
  "updatedAt" = NOW();

-- DIRECTOR: Pode ver, criar e editar, mas não deletar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES 
  ('DIRECTOR', 'email_config', true, true, true, false, NOW(), NOW()),
  ('DIRECTOR', 'maintenance_alerts', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE
SET 
  "canView" = EXCLUDED."canView",
  "canCreate" = EXCLUDED."canCreate",
  "canEdit" = EXCLUDED."canEdit",
  "canDelete" = EXCLUDED."canDelete",
  "updatedAt" = NOW();

-- MANAGER: Pode ver, criar e editar, mas não deletar
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES 
  ('MANAGER', 'email_config', true, true, true, false, NOW(), NOW()),
  ('MANAGER', 'maintenance_alerts', true, true, true, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE
SET 
  "canView" = EXCLUDED."canView",
  "canCreate" = EXCLUDED."canCreate",
  "canEdit" = EXCLUDED."canEdit",
  "canDelete" = EXCLUDED."canDelete",
  "updatedAt" = NOW();

-- SUPERVISOR: Pode ver apenas
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES 
  ('SUPERVISOR', 'email_config', true, false, false, false, NOW(), NOW()),
  ('SUPERVISOR', 'maintenance_alerts', true, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE
SET 
  "canView" = EXCLUDED."canView",
  "canCreate" = EXCLUDED."canCreate",
  "canEdit" = EXCLUDED."canEdit",
  "canDelete" = EXCLUDED."canDelete",
  "updatedAt" = NOW();

-- LEADER: Pode ver apenas
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES 
  ('LEADER', 'email_config', false, false, false, false, NOW(), NOW()),
  ('LEADER', 'maintenance_alerts', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE
SET 
  "canView" = EXCLUDED."canView",
  "canCreate" = EXCLUDED."canCreate",
  "canEdit" = EXCLUDED."canEdit",
  "canDelete" = EXCLUDED."canDelete",
  "updatedAt" = NOW();

-- OPERATOR: Sem acesso
INSERT INTO role_permissions (role, resource, "canView", "canCreate", "canEdit", "canDelete", "createdAt", "updatedAt")
VALUES 
  ('OPERATOR', 'email_config', false, false, false, false, NOW(), NOW()),
  ('OPERATOR', 'maintenance_alerts', false, false, false, false, NOW(), NOW())
ON CONFLICT (role, resource) DO UPDATE
SET 
  "canView" = EXCLUDED."canView",
  "canCreate" = EXCLUDED."canCreate",
  "canEdit" = EXCLUDED."canEdit",
  "canDelete" = EXCLUDED."canDelete",
  "updatedAt" = NOW();

-- Verificar permissões criadas
SELECT 
  role,
  resource,
  "canView",
  "canCreate",
  "canEdit",
  "canDelete"
FROM role_permissions
WHERE resource IN ('email_config', 'maintenance_alerts')
ORDER BY 
  CASE role
    WHEN 'ADMIN' THEN 1
    WHEN 'DIRECTOR' THEN 2
    WHEN 'MANAGER' THEN 3
    WHEN 'SUPERVISOR' THEN 4
    WHEN 'LEADER' THEN 5
    WHEN 'OPERATOR' THEN 6
  END,
  resource;

PRINT '✅ Permissões de E-mail e Alertas adicionadas com sucesso!';

