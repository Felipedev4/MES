-- ⚠️ SCRIPT CRÍTICO: Limpeza de Apontamentos Duplicados
-- Este script identifica e remove apontamentos duplicados do banco de dados
-- ATENÇÃO: Faça backup antes de executar!

-- ==================================================
-- PARTE 1: IDENTIFICAR DUPLICATAS
-- ==================================================

-- Ver duplicatas automáticas (menos de 10 segundos de diferença, mesma quantidade e contador)
SELECT 
  pa1.id as "ID Original",
  pa1."productionOrderId" as "Ordem",
  pa1.timestamp as "Timestamp Original",
  pa1.quantity as "Quantidade",
  pa1."clpCounterValue" as "Contador CLP",
  pa2.id as "ID Duplicado",
  pa2.timestamp as "Timestamp Duplicado",
  EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp)) as "Diferença (segundos)"
FROM production_appointments pa1
INNER JOIN production_appointments pa2 ON 
  pa1."productionOrderId" = pa2."productionOrderId"
  AND pa1.automatic = true
  AND pa2.automatic = true
  AND pa1.id < pa2.id
  AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
  AND pa1.quantity = pa2.quantity
  AND (
    (pa1."clpCounterValue" IS NULL AND pa2."clpCounterValue" IS NULL) OR
    pa1."clpCounterValue" = pa2."clpCounterValue"
  )
ORDER BY pa1.timestamp DESC, pa1.id;

-- ==================================================
-- PARTE 2: ESTATÍSTICAS DE DUPLICATAS
-- ==================================================

-- Contar quantas duplicatas existem
WITH duplicates AS (
  SELECT 
    pa1.id as original_id,
    pa2.id as duplicate_id,
    pa1."productionOrderId",
    pa1.quantity,
    EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp)) as diff_seconds
  FROM production_appointments pa1
  INNER JOIN production_appointments pa2 ON 
    pa1."productionOrderId" = pa2."productionOrderId"
    AND pa1.automatic = true
    AND pa2.automatic = true
    AND pa1.id < pa2.id
    AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
    AND pa1.quantity = pa2.quantity
    AND (
      (pa1."clpCounterValue" IS NULL AND pa2."clpCounterValue" IS NULL) OR
      pa1."clpCounterValue" = pa2."clpCounterValue"
    )
)
SELECT 
  COUNT(*) as "Total de Duplicatas",
  SUM(quantity) as "Peças Contadas em Duplicidade",
  COUNT(DISTINCT "productionOrderId") as "Ordens Afetadas"
FROM duplicates;

-- ==================================================
-- PARTE 3: REMOVER DUPLICATAS (MANTER O MAIS ANTIGO)
-- ==================================================

-- ATENÇÃO: Este DELETE é IRREVERSÍVEL! Faça backup antes!
-- Remove apenas o registro mais recente de cada par de duplicatas

BEGIN;

-- Criar tabela temporária com IDs a serem deletados
CREATE TEMP TABLE duplicates_to_delete AS
WITH duplicates AS (
  SELECT 
    pa1.id as original_id,
    pa2.id as duplicate_id,
    pa1."productionOrderId",
    pa1.quantity,
    pa2.quantity as dup_quantity,
    EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp)) as diff_seconds
  FROM production_appointments pa1
  INNER JOIN production_appointments pa2 ON 
    pa1."productionOrderId" = pa2."productionOrderId"
    AND pa1.automatic = true
    AND pa2.automatic = true
    AND pa1.id < pa2.id
    AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
    AND pa1.quantity = pa2.quantity
    AND (
      (pa1."clpCounterValue" IS NULL AND pa2."clpCounterValue" IS NULL) OR
      pa1."clpCounterValue" = pa2."clpCounterValue"
    )
)
SELECT DISTINCT duplicate_id, "productionOrderId", dup_quantity
FROM duplicates;

-- Mostrar o que será deletado
SELECT 
  COUNT(*) as "Registros que serão DELETADOS",
  SUM(dup_quantity) as "Peças a serem REMOVIDAS da contagem"
FROM duplicates_to_delete;

-- ATENÇÃO: Descomente as linhas abaixo para executar a remoção
-- Corrigir as quantidades nas ordens de produção ANTES de deletar
UPDATE production_orders po
SET 
  "producedQuantity" = "producedQuantity" - (
    SELECT COALESCE(SUM(dtd.dup_quantity), 0)
    FROM duplicates_to_delete dtd
    WHERE dtd."productionOrderId" = po.id
  )
WHERE po.id IN (SELECT DISTINCT "productionOrderId" FROM duplicates_to_delete);

-- Deletar os apontamentos duplicados
DELETE FROM production_appointments
WHERE id IN (SELECT duplicate_id FROM duplicates_to_delete);

-- Verificar resultado
SELECT 
  'Duplicatas removidas com sucesso!' as "Status",
  COUNT(*) as "Registros deletados"
FROM duplicates_to_delete;

-- Se tudo estiver OK, confirmar
COMMIT;

-- Se algo deu errado, reverter
-- ROLLBACK;

-- ==================================================
-- PARTE 4: VERIFICAÇÃO PÓS-LIMPEZA
-- ==================================================

-- Verificar se ainda existem duplicatas
WITH duplicates AS (
  SELECT 
    pa1.id as original_id,
    pa2.id as duplicate_id
  FROM production_appointments pa1
  INNER JOIN production_appointments pa2 ON 
    pa1."productionOrderId" = pa2."productionOrderId"
    AND pa1.automatic = true
    AND pa2.automatic = true
    AND pa1.id < pa2.id
    AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
    AND pa1.quantity = pa2.quantity
    AND (
      (pa1."clpCounterValue" IS NULL AND pa2."clpCounterValue" IS NULL) OR
      pa1."clpCounterValue" = pa2."clpCounterValue"
    )
)
SELECT 
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ Nenhuma duplicata encontrada!'
    ELSE CONCAT('⚠️ Ainda existem ', COUNT(*), ' duplicatas')
  END as "Resultado da Verificação"
FROM duplicates;

-- ==================================================
-- PARTE 5: CRIAR ÍNDICES PARA PREVENÇÃO
-- ==================================================

-- Aplicar os índices para melhor performance na detecção de duplicatas
CREATE INDEX IF NOT EXISTS "idx_appointment_dedup_auto" 
ON "production_appointments" ("productionOrderId", "automatic", "timestamp", "clpCounterValue")
WHERE "automatic" = true AND "clpCounterValue" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_appointment_recent" 
ON "production_appointments" ("productionOrderId", "timestamp" DESC, "automatic");

SELECT '✅ Índices criados com sucesso!' as "Status";

-- ==================================================
-- FIM DO SCRIPT
-- ==================================================

