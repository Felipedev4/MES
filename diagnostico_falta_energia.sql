-- Diagnóstico específico para "Falta de Energia"

-- 1. Verificar a atividade "Falta de Energia"
SELECT 
  'ATIVIDADE' AS tipo,
  at.id,
  at.code,
  at.name,
  at.type,
  at.active,
  at.description
FROM activity_types at
WHERE at.name ILIKE '%falta%energia%' OR at.name ILIKE '%energia%'
ORDER BY at."createdAt" DESC;

-- 2. Setores vinculados a essa atividade
SELECT 
  'SETORES VINCULADOS' AS tipo,
  s.id AS setor_id,
  s.code AS setor_codigo,
  s.name AS setor_nome,
  s.email AS setor_email,
  s.active AS setor_ativo,
  s."sendEmailOnAlert" AS envia_email_alerta,
  CASE 
    WHEN s.email IS NULL OR s.email = '' THEN '❌ SEM EMAIL'
    WHEN NOT s.active THEN '❌ SETOR INATIVO'
    WHEN NOT s."sendEmailOnAlert" THEN '❌ ENVIO EMAIL DESABILITADO'
    ELSE '✅ CONFIGURADO OK'
  END AS status
FROM activity_type_sectors ats
INNER JOIN sectors s ON ats."sectorId" = s.id
INNER JOIN activity_types at ON ats."activityTypeId" = at.id
WHERE at.name ILIKE '%falta%energia%' OR at.name ILIKE '%energia%'
ORDER BY s.name;

-- 3. Última parada de "Falta de Energia"
SELECT 
  'ÚLTIMA PARADA' AS tipo,
  d.id AS downtime_id,
  d.reason,
  d."startTime",
  d."endTime",
  po."orderNumber",
  c.name AS empresa
FROM downtimes d
INNER JOIN activity_types at ON d."activityTypeId" = at.id
INNER JOIN production_orders po ON d."productionOrderId" = po.id
INNER JOIN companies c ON po."companyId" = c.id
WHERE at.name ILIKE '%falta%energia%' OR at.name ILIKE '%energia%'
ORDER BY d."startTime" DESC
LIMIT 1;

-- 4. Logs de email dessa parada
SELECT 
  'LOGS EMAIL' AS tipo,
  el.id,
  el.recipients,
  el.subject,
  el.success,
  el.error,
  el."sentAt",
  el."downtimeId"
FROM email_logs el
WHERE el."downtimeId" = (
  SELECT d.id
  FROM downtimes d
  INNER JOIN activity_types at ON d."activityTypeId" = at.id
  WHERE at.name ILIKE '%falta%energia%' OR at.name ILIKE '%energia%'
  ORDER BY d."startTime" DESC
  LIMIT 1
);

-- 5. Configuração de email da empresa
SELECT 
  'CONFIG EMAIL' AS tipo,
  ec.id,
  ec.name,
  ec.host,
  ec.port,
  ec.active,
  c.name AS empresa
FROM email_configs ec
INNER JOIN companies c ON ec."companyId" = c.id
WHERE c.id = (
  SELECT po."companyId"
  FROM downtimes d
  INNER JOIN activity_types at ON d."activityTypeId" = at.id
  INNER JOIN production_orders po ON d."productionOrderId" = po.id
  WHERE at.name ILIKE '%falta%energia%' OR at.name ILIKE '%energia%'
  ORDER BY d."startTime" DESC
  LIMIT 1
)
AND ec.active = true;

