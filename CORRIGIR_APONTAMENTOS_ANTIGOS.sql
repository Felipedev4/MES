-- ============================================
-- CORRIGIR APONTAMENTOS ANTIGOS
-- ============================================
-- Este script corrige os apontamentos que foram registrados
-- com a quantidade errada (4 ao invés de 2)

-- ============================================
-- IMPORTANTE: Ajuste conforme sua ordem
-- ============================================
-- Ordem: OP-2025-004
-- Molde: Tampa 4 Cavidades
-- Cavidades Totais: 4
-- Cavidades Ativas: 2
-- Apontamentos registrados com: 4 (ERRADO)
-- Apontamentos deveriam ter: 2 (CORRETO)

-- ============================================
-- PASSO 1: Verificar os dados atuais
-- ============================================

SELECT 
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Total Atual",
    COUNT(pa.id) AS "Num Apontamentos",
    SUM(pa.quantity) AS "Soma Apontamentos"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-004'
GROUP BY po.id, po."orderNumber", po."producedQuantity";

-- Verificar apontamentos individuais
SELECT 
    id,
    quantity AS "Quantidade Registrada",
    "clpCounterValue" AS "Tempo Ciclo",
    timestamp AS "Data/Hora",
    automatic AS "Automático"
FROM production_appointments
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-004'
)
ORDER BY timestamp DESC;

-- ============================================
-- PASSO 2: Corrigir quantidades (BACKUP ANTES!)
-- ============================================

-- ATENÇÃO: Execute apenas se tiver certeza!
-- Faça backup antes: pg_dump mes_db > backup_antes_correcao.sql

BEGIN;

-- Corrigir quantidade nos apontamentos automáticos
-- Dividindo por 2 (de 4 para 2 cavidades ativas)
UPDATE production_appointments
SET quantity = quantity / 2
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-004'
)
AND automatic = true
AND quantity = 4;  -- Apenas os que estão com 4

-- Recalcular total produzido na ordem
UPDATE production_orders
SET "producedQuantity" = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM production_appointments
    WHERE "productionOrderId" = production_orders.id
)
WHERE "orderNumber" = 'OP-2025-004';

-- Verificar resultado
SELECT 
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Total Corrigido",
    COUNT(pa.id) AS "Num Apontamentos",
    SUM(pa.quantity) AS "Soma Apontamentos"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-004'
GROUP BY po.id, po."orderNumber", po."producedQuantity";

-- Se estiver correto, execute:
COMMIT;

-- Se algo deu errado, execute:
-- ROLLBACK;

-- ============================================
-- PASSO 3: Verificar outros moldes
-- ============================================

-- Verificar se há outros moldes com cavidades ativas diferentes
SELECT 
    m.id,
    m.code AS "Código",
    m.name AS "Nome",
    m.cavities AS "Cav. Totais",
    m."activeCavities" AS "Cav. Ativas",
    CASE 
        WHEN m."activeCavities" IS NULL THEN '⚠️ Não configurado'
        WHEN m."activeCavities" = m.cavities THEN '✅ OK'
        ELSE '⚠️ Diferente - requer correção'
    END AS "Status"
FROM molds m
WHERE m.active = true
ORDER BY m.name;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Conferir últimos apontamentos
SELECT 
    po."orderNumber",
    pa.quantity,
    pa."clpCounterValue",
    pa.timestamp,
    pa.automatic
FROM production_appointments pa
JOIN production_orders po ON po.id = pa."productionOrderId"
WHERE po."orderNumber" = 'OP-2025-004'
ORDER BY pa.timestamp DESC
LIMIT 10;

