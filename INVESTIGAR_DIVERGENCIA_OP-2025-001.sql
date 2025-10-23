-- ============================================================
-- INVESTIGAÇÃO DE DIVERGÊNCIA - OP-2025-001
-- ============================================================
-- Card mostra: 2.645
-- Order Summary mostra: 246
-- ============================================================

-- 1. VERIFICAR DADOS REAIS DA ORDEM NO BANCO
SELECT 
    id AS "ID Ordem",
    "orderNumber" AS "Número Ordem",
    "producedQuantity" AS "Campo producedQuantity (deve ser este que o card usa)",
    "rejectedQuantity" AS "Campo rejectedQuantity",
    "plannedQuantity" AS "Planejado",
    status AS "Status",
    "createdAt" AS "Criado Em",
    "updatedAt" AS "Atualizado Em"
FROM production_orders
WHERE "orderNumber" = 'OP-2025-001';

-- ============================================================

-- 2. VERIFICAR SOMA REAL DOS APONTAMENTOS
SELECT 
    COUNT(*) AS "Total de Apontamentos",
    SUM(quantity) AS "Soma de quantity (total produzido REAL)",
    SUM("rejectedQuantity") AS "Soma de rejeitados",
    MIN(quantity) AS "Menor apontamento",
    MAX(quantity) AS "Maior apontamento",
    AVG(quantity) AS "Média por apontamento"
FROM production_appointments
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'
);

-- ============================================================

-- 3. LISTAR TODOS OS APONTAMENTOS (VERIFICAR SE HÁ ALGO ESTRANHO)
SELECT 
    pa.id AS "ID Apt",
    pa.quantity AS "Quantidade",
    pa."rejectedQuantity" AS "Rejeitado",
    pa.automatic AS "Automático?",
    pa."clpCounterValue" AS "Contador CLP",
    TO_CHAR(pa.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS "Data/Hora",
    u.name AS "Usuário",
    pa.notes AS "Observações"
FROM production_appointments pa
JOIN users u ON u.id = pa."userId"
WHERE pa."productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'
)
ORDER BY pa.timestamp DESC;

-- ============================================================

-- 4. COMPARAÇÃO DIRETA (DETECTAR DIVERGÊNCIA)
SELECT 
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Campo producedQuantity (Card usa)",
    COALESCE(SUM(pa.quantity), 0) AS "Soma Apontamentos (OrderSummary calcula?)",
    po."producedQuantity" - COALESCE(SUM(pa.quantity), 0) AS "Diferença",
    CASE 
        WHEN po."producedQuantity" = COALESCE(SUM(pa.quantity), 0) THEN '✅ OK'
        ELSE '❌ DIVERGÊNCIA DETECTADA'
    END AS "Status"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-001'
GROUP BY po.id, po."orderNumber", po."producedQuantity";

-- ============================================================

-- 5. VERIFICAR SE HÁ APONTAMENTOS DUPLICADOS (POSSÍVEL CAUSA)
SELECT 
    "productionOrderId",
    quantity,
    timestamp,
    "clpCounterValue",
    COUNT(*) AS "Quantidade de Duplicatas"
FROM production_appointments
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'
)
GROUP BY "productionOrderId", quantity, timestamp, "clpCounterValue"
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- ============================================================

-- 6. HISTÓRICO DE ATUALIZAÇÕES (VER SE FOI MANUALMENTE ALTERADO)
-- Nota: Isso só funciona se houver audit log
SELECT 
    "orderNumber",
    "producedQuantity",
    "updatedAt",
    "createdAt"
FROM production_orders
WHERE "orderNumber" = 'OP-2025-001';

-- ============================================================

-- 7. SOLUÇÃO: RECALCULAR O CAMPO producedQuantity PARA ESTA ORDEM
-- DESCOMENTE PARA EXECUTAR:

/*
UPDATE production_orders
SET "producedQuantity" = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM production_appointments
    WHERE "productionOrderId" = production_orders.id
),
"rejectedQuantity" = (
    SELECT COALESCE(SUM("rejectedQuantity"), 0)
    FROM production_appointments
    WHERE "productionOrderId" = production_orders.id
)
WHERE "orderNumber" = 'OP-2025-001';

-- Verificar resultado após atualização:
SELECT 
    "orderNumber",
    "producedQuantity" AS "Novo Valor",
    (SELECT SUM(quantity) FROM production_appointments 
     WHERE "productionOrderId" = production_orders.id) AS "Soma Apontamentos"
FROM production_orders
WHERE "orderNumber" = 'OP-2025-001';
*/

-- ============================================================
-- FIM DA INVESTIGAÇÃO
-- ============================================================

