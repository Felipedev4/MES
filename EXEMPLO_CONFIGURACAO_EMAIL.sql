-- Exemplo de Configuração de E-mail para Teste
-- ATENÇÃO: Substitua os valores pelos seus dados reais

-- ============================================================================
-- OPÇÃO 1: Gmail (Recomendado para testes)
-- ============================================================================

-- Para usar Gmail, você precisa gerar uma "Senha de App":
-- 1. Acesse: https://myaccount.google.com/apppasswords
-- 2. Selecione "Correio" e "Outro (nome personalizado)"
-- 3. Copie a senha gerada (16 caracteres)
-- 4. Use essa senha no campo 'password' abaixo

-- NOTA: A senha será criptografada automaticamente pelo backend
INSERT INTO email_configs (
  "companyId",
  name,
  host,
  port,
  secure,
  username,
  password,
  "fromEmail",
  "fromName",
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  NULL, -- NULL = configuração global
  'Gmail - Sistema MES',
  'smtp.gmail.com',
  587,
  true,
  'seu-email@gmail.com', -- ← SUBSTITUA
  'sua-senha-de-app-16-caracteres', -- ← SUBSTITUA (será criptografada)
  'seu-email@gmail.com', -- ← SUBSTITUA
  'Sistema MES - Alertas',
  true,
  NOW(),
  NOW()
);

-- ============================================================================
-- OPÇÃO 2: Outlook / Office 365
-- ============================================================================

-- Descomente para usar Outlook:
/*
INSERT INTO email_configs (
  "companyId",
  name,
  host,
  port,
  secure,
  username,
  password,
  "fromEmail",
  "fromName",
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  NULL,
  'Outlook - Sistema MES',
  'smtp.office365.com',
  587,
  true,
  'seu-email@outlook.com', -- ← SUBSTITUA
  'sua-senha', -- ← SUBSTITUA
  'seu-email@outlook.com', -- ← SUBSTITUA
  'Sistema MES - Alertas',
  true,
  NOW(),
  NOW()
);
*/

-- ============================================================================
-- Verificar configuração criada
-- ============================================================================

SELECT 
  id,
  name,
  host,
  port,
  username,
  "fromEmail",
  active
FROM email_configs
ORDER BY id DESC
LIMIT 1;

-- ============================================================================
-- EXEMPLO: Criar Alerta de Manutenção
-- ============================================================================

-- ATENÇÃO: Substitua os valores antes de executar

-- Para TODOS os moldes da empresa
/*
INSERT INTO maintenance_alerts (
  "emailConfigId",
  "companyId",
  "moldId",
  "daysBeforeAlert",
  recipients,
  active,
  "lastCheck",
  "createdAt",
  "updatedAt"
) VALUES (
  1, -- ID da configuração de e-mail criada acima
  NULL, -- NULL = todos os moldes
  NULL, -- NULL = não é específico
  7, -- Alertar 7 dias antes
  'manutencao@empresa.com,gerente@empresa.com', -- ← SUBSTITUA
  true,
  NULL,
  NOW(),
  NOW()
);
*/

-- Para molde ESPECÍFICO (mais urgente)
/*
INSERT INTO maintenance_alerts (
  "emailConfigId",
  "moldId",
  "daysBeforeAlert",
  recipients,
  active,
  "createdAt",
  "updatedAt"
) VALUES (
  1, -- ID da configuração
  1, -- ← SUBSTITUA pelo ID do molde
  3, -- Alertar 3 dias antes (mais urgente)
  'urgente@empresa.com,supervisor@empresa.com', -- ← SUBSTITUA
  true,
  NOW(),
  NOW()
);
*/

-- ============================================================================
-- Verificar alertas criados
-- ============================================================================

SELECT 
  ma.id,
  ec.name as config_email,
  COALESCE(m.code, 'Todos os moldes') as molde,
  ma."daysBeforeAlert" as dias_antes,
  ma.recipients,
  ma.active
FROM maintenance_alerts ma
JOIN email_configs ec ON ec.id = ma."emailConfigId"
LEFT JOIN molds m ON m.id = ma."moldId"
ORDER BY ma.id DESC;

-- ============================================================================
-- TESTAR: Buscar moldes que precisam de manutenção em breve
-- ============================================================================

SELECT 
  id,
  code,
  name,
  cavities,
  "maintenanceDate",
  CASE 
    WHEN "maintenanceDate" IS NULL THEN 'Sem manutenção agendada'
    WHEN "maintenanceDate" < NOW() THEN 'VENCIDA!'
    ELSE CONCAT(
      CEIL(EXTRACT(EPOCH FROM ("maintenanceDate" - NOW())) / 86400),
      ' dias restantes'
    )
  END as status
FROM molds
WHERE active = true
ORDER BY "maintenanceDate" ASC NULLS LAST
LIMIT 10;

-- ============================================================================
-- ÚTIL: Atualizar data de manutenção de um molde para teste
-- ============================================================================

-- Colocar manutenção para daqui a 5 dias (para testar alerta)
/*
UPDATE molds
SET "maintenanceDate" = NOW() + INTERVAL '5 days'
WHERE code = 'MOLD-001'; -- ← SUBSTITUA pelo código do seu molde
*/

-- Colocar manutenção para daqui a 2 dias (urgente!)
/*
UPDATE molds
SET "maintenanceDate" = NOW() + INTERVAL '2 days'
WHERE code = 'MOLD-002'; -- ← SUBSTITUA pelo código do seu molde
*/

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

SELECT '✅ Script executado! Agora configure seus dados reais.' as resultado;

