-- ============================================
-- CORREÇÃO: clpCounterValue incorreto na OP-2025-001
-- ============================================
-- Problema: clpCounterValue está 3, mas molde tem 4 cavidades
-- Resultado: 219 peças não contabilizadas!
-- ============================================

-- 1. BACKUP (sempre!)
CREATE TABLE IF NOT EXISTS production_appointments_backup_20251023 AS
SELECT * FROM production_appointments;

-- 2. Ver o problema antes de corrigir
SELECT 
    po."orderNumber",
    m.name as molde,
    m.cavities as cavidades_corretas,
    COUNT(pa.id) as total_apontamentos,
    MAX(pa."clpCounterValue") as clp_value_atual,
    SUM(pa."clpCounterValue") as total_pecas_atual,
    COUNT(pa.id) * m.cavities as total_pecas_correto,
    (COUNT(pa.id) * m.cavities) - SUM(pa."clpCounterValue") as pecas_faltantes
FROM production_orders po
JOIN molds m ON po."moldId" = m.id
JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-001'
GROUP BY po.id, m.id, m.cavities;

\echo ' '
\echo '=========================================='
\echo 'CORRIGINDO clpCounterValue...'
\echo '=========================================='

-- 3. CORRIGIR os apontamentos da OP-2025-001
UPDATE production_appointments pa
SET "clpCounterValue" = m.cavities
FROM production_orders po
JOIN molds m ON po."moldId" = m.id
WHERE pa."productionOrderId" = po.id
  AND po."orderNumber" = 'OP-2025-001'
  AND pa."clpCounterValue" != m.cavities;

-- 4. Verificar após correção
SELECT 
    po."orderNumber",
    m.name as molde,
    m.cavities as cavidades,
    COUNT(pa.id) as total_apontamentos,
    MAX(pa."clpCounterValue") as clp_value,
    SUM(pa."clpCounterValue") as total_pecas,
    '✅ CORRIGIDO!' as status
FROM production_orders po
JOIN molds m ON po."moldId" = m.id
JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-001'
GROUP BY po.id, m.id, m.cavities;

\echo ' '
\echo '=========================================='
\echo 'ATUALIZAR producedQuantity na ordem'
\echo '=========================================='

-- 5. Recalcular e atualizar producedQuantity na ordem
UPDATE production_orders po
SET "producedQuantity" = (
    SELECT COALESCE(SUM(pa."clpCounterValue"), 0)
    FROM production_appointments pa
    WHERE pa."productionOrderId" = po.id
)
WHERE po."orderNumber" = 'OP-2025-001';

-- 6. Verificar ordem atualizada
SELECT 
    "orderNumber",
    "producedQuantity" as quantidade_produzida,
    "plannedQuantity" as quantidade_planejada,
    ROUND(("producedQuantity"::numeric / "plannedQuantity"::numeric * 100), 2) as percentual_completo
FROM production_orders
WHERE "orderNumber" = 'OP-2025-001';


