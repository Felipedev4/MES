-- ==========================================
-- DIAGNÓSTICO RÁPIDO - EMAIL DE PARADA NÃO ENVIADO
-- ==========================================
-- Execute este script no banco de dados para descobrir o problema

-- ==========================================
-- 1. VERIFICAR ÚLTIMA PARADA REGISTRADA
-- ==========================================
SELECT 
  '🔍 ÚLTIMA PARADA' AS info,
  d.id AS parada_id,
  d.reason AS motivo,
  d."startTime" AS inicio,
  at.id AS atividade_id,
  at.code AS atividade_codigo,
  at.name AS atividade_nome,
  at.type AS atividade_tipo,
  po."orderNumber" AS ordem,
  po.status AS ordem_status,
  c.name AS empresa
FROM downtimes d
INNER JOIN activity_types at ON d."activityTypeId" = at.id
INNER JOIN production_orders po ON d."productionOrderId" = po.id
INNER JOIN companies c ON po."companyId" = c.id
ORDER BY d."startTime" DESC
LIMIT 1;

-- ==========================================
-- 2. SETORES VINCULADOS A ESSA ATIVIDADE
-- ==========================================
-- Copie o atividade_id da query acima e substitua abaixo
SELECT 
  '👥 SETORES VINCULADOS' AS info,
  s.id AS setor_id,
  s.code AS setor_codigo,
  s.name AS setor_nome,
  s.email AS setor_email,
  s.active AS setor_ativo,
  s."sendEmailOnAlert" AS email_habilitado,
  CASE 
    WHEN s.email IS NULL OR s.email = '' THEN '❌ SEM EMAIL'
    WHEN NOT s.active THEN '❌ INATIVO'
    WHEN NOT s."sendEmailOnAlert" THEN '❌ EMAIL DESABILITADO'
    ELSE '✅ OK'
  END AS status_email
FROM activity_type_sectors ats
INNER JOIN sectors s ON ats."sectorId" = s.id
WHERE ats."activityTypeId" = (
  SELECT at.id 
  FROM downtimes d
  INNER JOIN activity_types at ON d."activityTypeId" = at.id
  ORDER BY d."startTime" DESC
  LIMIT 1
);

-- ==========================================
-- 3. CONFIGURAÇÃO DE EMAIL DA EMPRESA
-- ==========================================
SELECT 
  '📧 CONFIG EMAIL EMPRESA' AS info,
  ec.id AS config_id,
  ec.name AS config_nome,
  ec.host AS smtp_host,
  ec.port AS smtp_porta,
  ec.username AS smtp_usuario,
  ec.active AS config_ativa,
  c.name AS empresa_nome,
  CASE 
    WHEN NOT ec.active THEN '❌ INATIVA'
    ELSE '✅ ATIVA'
  END AS status_config
FROM email_configs ec
INNER JOIN companies c ON ec."companyId" = c.id
WHERE c.id = (
  SELECT po."companyId"
  FROM downtimes d
  INNER JOIN production_orders po ON d."productionOrderId" = po.id
  ORDER BY d."startTime" DESC
  LIMIT 1
)
ORDER BY ec.active DESC, ec."createdAt" DESC
LIMIT 1;

-- ==========================================
-- 4. LOGS DE EMAIL DESSA PARADA
-- ==========================================
SELECT 
  '📬 LOGS DE EMAIL' AS info,
  el.id AS log_id,
  el.recipients AS destinatarios,
  el.subject AS assunto,
  el.success AS enviado_com_sucesso,
  el.error AS erro,
  el."sentAt" AS data_envio,
  el."downtimeId" AS parada_id
FROM email_logs el
WHERE el."downtimeId" = (
  SELECT d.id 
  FROM downtimes d
  ORDER BY d."startTime" DESC
  LIMIT 1
)
ORDER BY el."sentAt" DESC;

-- ==========================================
-- 5. RESUMO DO DIAGNÓSTICO
-- ==========================================
SELECT 
  '📊 RESUMO' AS info,
  -- Última atividade
  (SELECT at.name FROM downtimes d 
   INNER JOIN activity_types at ON d."activityTypeId" = at.id
   ORDER BY d."startTime" DESC LIMIT 1) AS ultima_atividade,
  
  -- Quantos setores vinculados
  (SELECT COUNT(*)
   FROM activity_type_sectors ats
   WHERE ats."activityTypeId" = (
     SELECT d."activityTypeId" FROM downtimes d ORDER BY d."startTime" DESC LIMIT 1
   )) AS qtd_setores_vinculados,
  
  -- Quantos setores com email OK
  (SELECT COUNT(*)
   FROM activity_type_sectors ats
   INNER JOIN sectors s ON ats."sectorId" = s.id
   WHERE ats."activityTypeId" = (
     SELECT d."activityTypeId" FROM downtimes d ORDER BY d."startTime" DESC LIMIT 1
   )
   AND s.active = true
   AND s."sendEmailOnAlert" = true
   AND s.email IS NOT NULL
   AND s.email != '') AS qtd_setores_com_email_ok,
  
  -- Tem config de email ativa?
  (SELECT COUNT(*)
   FROM email_configs ec
   INNER JOIN companies c ON ec."companyId" = c.id
   WHERE c.id = (
     SELECT po."companyId" FROM downtimes d
     INNER JOIN production_orders po ON d."productionOrderId" = po.id
     ORDER BY d."startTime" DESC LIMIT 1
   )
   AND ec.active = true) AS config_email_ativa,
  
  -- Emails enviados dessa parada
  (SELECT COUNT(*)
   FROM email_logs el
   WHERE el."downtimeId" = (
     SELECT d.id FROM downtimes d ORDER BY d."startTime" DESC LIMIT 1
   )) AS emails_enviados;

-- ==========================================
-- 6. DIAGNÓSTICO FINAL
-- ==========================================
SELECT 
  '🎯 DIAGNÓSTICO' AS titulo,
  CASE 
    WHEN setores_vinculados = 0 THEN 
      '❌ PROBLEMA: Atividade não tem setores vinculados. Vá em Cadastros > Tipos de Atividade e adicione setores.'
    
    WHEN setores_com_email_ok = 0 AND setores_vinculados > 0 THEN 
      '❌ PROBLEMA: Setores vinculados não têm email configurado. Vá em Cadastros > Setores e configure: Email, Ativo, Enviar Email em Alertas.'
    
    WHEN config_email_ativa = 0 THEN 
      '❌ PROBLEMA: Empresa não tem configuração de email ativa. Vá em Configurações > Central de E-mails e configure o SMTP.'
    
    WHEN emails_enviados > 0 THEN 
      '✅ Email FOI enviado! Verifique a caixa de entrada dos destinatários ou a pasta de SPAM.'
    
    ELSE 
      '⚠️ Configuração parece OK, mas email não foi enviado. Verifique logs do backend no console.'
  END AS diagnostico
FROM (
  SELECT 
    (SELECT COUNT(*) FROM activity_type_sectors ats
     WHERE ats."activityTypeId" = (
       SELECT d."activityTypeId" FROM downtimes d ORDER BY d."startTime" DESC LIMIT 1
     )) AS setores_vinculados,
    
    (SELECT COUNT(*) FROM activity_type_sectors ats
     INNER JOIN sectors s ON ats."sectorId" = s.id
     WHERE ats."activityTypeId" = (
       SELECT d."activityTypeId" FROM downtimes d ORDER BY d."startTime" DESC LIMIT 1
     )
     AND s.active = true
     AND s."sendEmailOnAlert" = true
     AND s.email IS NOT NULL
     AND s.email != '') AS setores_com_email_ok,
    
    (SELECT COUNT(*) FROM email_configs ec
     INNER JOIN companies c ON ec."companyId" = c.id
     WHERE c.id = (
       SELECT po."companyId" FROM downtimes d
       INNER JOIN production_orders po ON d."productionOrderId" = po.id
       ORDER BY d."startTime" DESC LIMIT 1
     )
     AND ec.active = true) AS config_email_ativa,
    
    (SELECT COUNT(*) FROM email_logs el
     WHERE el."downtimeId" = (
       SELECT d.id FROM downtimes d ORDER BY d."startTime" DESC LIMIT 1
     )) AS emails_enviados
) AS diagnostico_data;

-- ==========================================
-- 7. SOLUÇÃO RÁPIDA (Se necessário)
-- ==========================================
-- Execute APENAS se o diagnóstico indicar problemas
-- Descomente as linhas abaixo conforme necessário:

-- ❌ Se o problema for "Setores não configurados":
-- 1. Vá em Cadastros > Setores
-- 2. Para cada setor, edite e configure:
/*
UPDATE sectors 
SET 
  active = true,
  "sendEmailOnAlert" = true,
  email = 'setor@empresa.com'  -- Substitua pelo email real
WHERE code = 'CODIGO_SETOR';  -- Substitua pelo código do setor
*/

-- ❌ Se o problema for "Atividade sem setores vinculados":
-- 1. Vá em Cadastros > Tipos de Atividade
-- 2. Edite a atividade e adicione setores na seção "Setores Responsáveis"
-- OU execute:
/*
INSERT INTO activity_type_sectors ("activityTypeId", "sectorId", "createdAt")
VALUES (
  (SELECT id FROM activity_types WHERE code = 'CODIGO_ATIVIDADE'),
  (SELECT id FROM sectors WHERE code = 'CODIGO_SETOR'),
  NOW()
);
*/

-- ==========================================
-- FIM DO DIAGNÓSTICO
-- ==========================================
-- Execute todas as queries acima e analise os resultados
-- A query "DIAGNÓSTICO FINAL" dirá exatamente qual é o problema

