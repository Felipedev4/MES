-- ============================================================
-- VERIFICAÇÃO DE QUANTIDADE PRODUZIDA NOS CARDS
-- ============================================================
-- Este script verifica se a quantidade produzida nos cards
-- está compatível com os apontamentos reais no banco de dados
-- ============================================================

-- 1. COMPARAR producedQuantity DA ORDEM COM SOMA DOS APONTAMENTOS
SELECT 
    po.id AS "ID Ordem",
    po."orderNumber" AS "Número Ordem",
    po."producedQuantity" AS "Qtd Produzida (Campo)",
    COALESCE(SUM(pa.quantity), 0) AS "Qtd Produzida (Apontamentos)",
    po."rejectedQuantity" AS "Qtd Rejeitada (Campo)",
    COALESCE(SUM(pa."rejectedQuantity"), 0) AS "Qtd Rejeitada (Apontamentos)",
    COUNT(pa.id) AS "Total Apontamentos",
    CASE 
        WHEN po."producedQuantity" = COALESCE(SUM(pa.quantity), 0) THEN '✅ OK'
        ELSE '❌ DIVERGÊNCIA'
    END AS "Status Produzido",
    CASE 
        WHEN po."rejectedQuantity" = COALESCE(SUM(pa."rejectedQuantity"), 0) THEN '✅ OK'
        ELSE '❌ DIVERGÊNCIA'
    END AS "Status Rejeitado"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status IN ('ACTIVE', 'PROGRAMMING', 'PAUSED')
GROUP BY po.id, po."orderNumber", po."producedQuantity", po."rejectedQuantity"
ORDER BY po."orderNumber";

-- ============================================================

-- 2. DETALHES DE CADA ORDEM ATIVA (DADOS QUE APARECEM NOS CARDS)
SELECT 
    po.id AS "ID",
    po."orderNumber" AS "Ordem",
    po."plannedQuantity" AS "Planejado",
    po."producedQuantity" AS "Produzido",
    po."rejectedQuantity" AS "Rejeitado",
    (po."plannedQuantity" - po."producedQuantity") AS "Faltante",
    ROUND((po."producedQuantity"::DECIMAL / NULLIF(po."plannedQuantity", 0)) * 100, 2) AS "% Conclusão",
    po.status AS "Status",
    i.name AS "Produto",
    m.name AS "Molde",
    COALESCE(m."activeCavities", m.cavities) AS "Cavidades",
    TO_CHAR(po."plannedStartDate", 'DD/MM/YYYY') AS "Data Inicial",
    TO_CHAR(po."plannedEndDate", 'DD/MM/YYYY') AS "Data Final",
    COUNT(pa.id) AS "Nº Apontamentos"
FROM production_orders po
LEFT JOIN items i ON i.id = po."itemId"
LEFT JOIN molds m ON m.id = po."moldId"
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status IN ('ACTIVE', 'PROGRAMMING', 'PAUSED')
GROUP BY po.id, po."orderNumber", po."plannedQuantity", po."producedQuantity", 
         po."rejectedQuantity", po.status, i.name, m.name, m."activeCavities", 
         m.cavities, po."plannedStartDate", po."plannedEndDate"
ORDER BY po."orderNumber";

-- ============================================================

-- 3. ÚLTIMOS APONTAMENTOS DE CADA ORDEM (VERIFICAR ATUALIZAÇÃO)
SELECT 
    po."orderNumber" AS "Ordem",
    pa.quantity AS "Quantidade",
    pa."rejectedQuantity" AS "Rejeitado",
    pa.automatic AS "Automático",
    pa."clpCounterValue" AS "Contador CLP",
    TO_CHAR(pa.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS "Data/Hora",
    u.name AS "Usuário"
FROM production_appointments pa
JOIN production_orders po ON po.id = pa."productionOrderId"
JOIN users u ON u.id = pa."userId"
WHERE po.status IN ('ACTIVE', 'PROGRAMMING', 'PAUSED')
ORDER BY pa.timestamp DESC
LIMIT 20;

-- ============================================================

-- 4. ESTATÍSTICAS GERAIS POR ORDEM
SELECT 
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Total Produzido",
    po."rejectedQuantity" AS "Total Rejeitado",
    COUNT(pa.id) AS "Total Apontamentos",
    MIN(pa.quantity) AS "Menor Apontamento",
    MAX(pa.quantity) AS "Maior Apontamento",
    ROUND(AVG(pa.quantity), 2) AS "Média Apontamento",
    TO_CHAR(MIN(pa.timestamp), 'DD/MM HH24:MI') AS "Primeiro Apontamento",
    TO_CHAR(MAX(pa.timestamp), 'DD/MM HH24:MI') AS "Último Apontamento"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status IN ('ACTIVE', 'PROGRAMMING', 'PAUSED')
GROUP BY po.id, po."orderNumber", po."producedQuantity", po."rejectedQuantity"
ORDER BY po."orderNumber";

-- ============================================================

-- 5. VERIFICAR SE HÁ ORDENS SEM APONTAMENTOS MAS COM producedQuantity > 0
SELECT 
    po.id AS "ID Ordem",
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Qtd Produzida",
    COUNT(pa.id) AS "Nº Apontamentos",
    '⚠️ INCONSISTÊNCIA: Quantidade produzida sem apontamentos' AS "Alerta"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."producedQuantity" > 0
GROUP BY po.id, po."orderNumber", po."producedQuantity"
HAVING COUNT(pa.id) = 0;

-- ============================================================

-- 6. RESUMO GERAL
SELECT 
    COUNT(DISTINCT po.id) AS "Total de Ordens Ativas",
    SUM(po."plannedQuantity") AS "Total Planejado",
    SUM(po."producedQuantity") AS "Total Produzido",
    SUM(po."rejectedQuantity") AS "Total Rejeitado",
    COUNT(pa.id) AS "Total de Apontamentos",
    ROUND(AVG(po."producedQuantity"::DECIMAL / NULLIF(po."plannedQuantity", 0)) * 100, 2) AS "% Média de Conclusão"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status IN ('ACTIVE', 'PROGRAMMING', 'PAUSED');

-- ============================================================
-- FIM DA VERIFICAÇÃO
-- ============================================================

/*
COMO INTERPRETAR OS RESULTADOS:

Query 1: Compara o campo producedQuantity com a soma real dos apontamentos
  - Se aparecer "❌ DIVERGÊNCIA", há inconsistência nos dados
  - Todos devem mostrar "✅ OK"

Query 2: Mostra exatamente os dados que aparecem nos cards
  - Confira se os valores batem com o que você vê na tela

Query 3: Mostra os últimos apontamentos para verificar se estão sendo gravados

Query 4: Estatísticas para entender o padrão de apontamentos

Query 5: Detecta inconsistências (quantidade produzida sem apontamentos)

Query 6: Resumo geral de todas as ordens

POSSÍVEIS PROBLEMAS:
1. Se Query 1 mostrar divergências, precisa recalcular producedQuantity
2. Se Query 5 retornar linhas, há dados inconsistentes
3. Se os valores da Query 2 não batem com os cards, problema no frontend

SOLUÇÃO PARA RECALCULAR (se necessário):
UPDATE production_orders po
SET "producedQuantity" = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM production_appointments
    WHERE "productionOrderId" = po.id
),
"rejectedQuantity" = (
    SELECT COALESCE(SUM("rejectedQuantity"), 0)
    FROM production_appointments
    WHERE "productionOrderId" = po.id
);
*/

