-- Script de Validação: Verificar se todas as telas possuem permissões

-- Lista de recursos esperados (todas as telas do frontend)
WITH recursos_esperados AS (
  SELECT unnest(ARRAY[
    'activity_types',
    'companies',
    'dashboard',
    'defects',
    'downtimes',
    'injectors',
    'items',
    'molds',
    'permissions',
    'plc_config',
    'production',
    'production_orders',
    'production_posting',
    'reference_types',
    'sectors',
    'user_companies',
    'users'
  ]) AS resource
),
recursos_cadastrados AS (
  SELECT DISTINCT resource
  FROM role_permissions
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCESSO: Todas as telas possuem permissões cadastradas!'
    ELSE '❌ ERRO: Existem telas sem permissões'
  END AS status,
  COUNT(*) AS telas_faltantes
FROM recursos_esperados re
LEFT JOIN recursos_cadastrados rc ON re.resource = rc.resource
WHERE rc.resource IS NULL;

-- Listar recursos faltantes (se houver)
WITH recursos_esperados AS (
  SELECT unnest(ARRAY[
    'activity_types',
    'companies',
    'dashboard',
    'defects',
    'downtimes',
    'injectors',
    'items',
    'molds',
    'permissions',
    'plc_config',
    'production',
    'production_orders',
    'production_posting',
    'reference_types',
    'sectors',
    'user_companies',
    'users'
  ]) AS resource
),
recursos_cadastrados AS (
  SELECT DISTINCT resource
  FROM role_permissions
)
SELECT 
  'Recursos faltantes:' AS info,
  re.resource
FROM recursos_esperados re
LEFT JOIN recursos_cadastrados rc ON re.resource = rc.resource
WHERE rc.resource IS NULL;

-- Estatísticas finais
SELECT 
  '📊 Estatísticas do Sistema de Permissões' AS titulo;

SELECT 
  COUNT(DISTINCT resource) AS total_recursos,
  COUNT(DISTINCT role) AS total_roles,
  COUNT(*) AS total_permissoes
FROM role_permissions;

-- Verificar se todos os roles têm permissões para todos os recursos
SELECT 
  resource,
  COUNT(DISTINCT role) AS roles_configurados,
  CASE 
    WHEN COUNT(DISTINCT role) = 6 THEN '✅'
    ELSE '❌ Faltam ' || (6 - COUNT(DISTINCT role))::text || ' roles'
  END AS status
FROM role_permissions
GROUP BY resource
ORDER BY resource;

