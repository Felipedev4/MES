-- Script: Verificação Completa de Permissões
-- Verifica quais recursos têm permissões cadastradas e quais estão faltando

-- 1. Listar todos os recursos com permissões cadastradas
SELECT DISTINCT resource 
FROM role_permissions 
ORDER BY resource;

-- 2. Contar permissões por recurso
SELECT 
    resource,
    COUNT(*) as total_permissions,
    SUM(CASE WHEN "canView" THEN 1 ELSE 0 END) as can_view_count,
    SUM(CASE WHEN "canCreate" THEN 1 ELSE 0 END) as can_create_count,
    SUM(CASE WHEN "canEdit" THEN 1 ELSE 0 END) as can_edit_count,
    SUM(CASE WHEN "canDelete" THEN 1 ELSE 0 END) as can_delete_count
FROM role_permissions
GROUP BY resource
ORDER BY resource;

-- 3. Ver todas as permissões detalhadas
SELECT 
    role,
    resource,
    "canView",
    "canCreate",
    "canEdit",
    "canDelete"
FROM role_permissions
ORDER BY resource, role;

