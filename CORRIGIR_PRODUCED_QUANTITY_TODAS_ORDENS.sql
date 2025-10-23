-- ============================================================
-- SCRIPT DE CORREÇÃO: producedQuantity de TODAS as Ordens
-- ============================================================
-- PROBLEMA: Campo producedQuantity estava sendo incrementado
--           com quantity (tempo de ciclo) em vez de 
--           clpCounterValue (contador de peças)
--
-- SOLUÇÃO: Recalcular producedQuantity baseado na soma dos
--          clpCounterValue dos apontamentos
-- ============================================================

-- ============================================================
-- ETAPA 1: VERIFICAR DIVERGÊNCIAS ANTES DA CORREÇÃO
-- ============================================================

SELECT 
    po.id AS "ID",
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Atual (ERRADO - usa quantity)",
    COALESCE(SUM(pa."clpCounterValue"), 0) AS "Correto (soma clpCounterValue)",
    po."producedQuantity" - COALESCE(SUM(pa."clpCounterValue"), 0) AS "Diferença",
    CASE 
        WHEN po."producedQuantity" = COALESCE(SUM(pa."clpCounterValue"), 0) THEN '✅ OK'
        WHEN COALESCE(SUM(pa."clpCounterValue"), 0) = 0 THEN '⚠️  Sem clpCounterValue'
        ELSE '❌ DIVERGÊNCIA - PRECISA CORRIGIR'
    END AS "Status",
    COUNT(pa.id) AS "Nº Apontamentos",
    COUNT(CASE WHEN pa."clpCounterValue" IS NOT NULL THEN 1 END) AS "Com clpCounterValue",
    COUNT(CASE WHEN pa."clpCounterValue" IS NULL THEN 1 END) AS "Sem clpCounterValue"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
GROUP BY po.id, po."orderNumber", po."producedQuantity"
ORDER BY 
    CASE 
        WHEN po."producedQuantity" != COALESCE(SUM(pa."clpCounterValue"), 0) THEN 0
        ELSE 1
    END,
    po."orderNumber";

-- ============================================================
-- ETAPA 2: VERIFICAR CASO ESPECÍFICO OP-2025-001
-- ============================================================

SELECT 
    'OP-2025-001 - ANTES DA CORREÇÃO' AS "Verificação",
    po."producedQuantity" AS "producedQuantity Atual (ERRADO)",
    COALESCE(SUM(pa."clpCounterValue"), 0) AS "Soma clpCounterValue (CORRETO)",
    COALESCE(SUM(pa.quantity), 0) AS "Soma quantity (tempo - IGNORAR)"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-001'
GROUP BY po.id, po."producedQuantity";

-- ============================================================
-- ETAPA 3: CORREÇÃO - RECALCULAR producedQuantity
-- ============================================================
-- ⚠️ IMPORTANTE: Revise os resultados acima antes de executar!
-- ⚠️ Esta operação irá sobrescrever o campo producedQuantity
-- ============================================================

-- DESCOMENTE PARA EXECUTAR:
/*

-- Atualizar producedQuantity = soma dos clpCounterValue
UPDATE production_orders po
SET "producedQuantity" = COALESCE((
    SELECT SUM("clpCounterValue")
    FROM production_appointments
    WHERE "productionOrderId" = po.id
    AND "clpCounterValue" IS NOT NULL
), 0),
"updatedAt" = NOW()
WHERE EXISTS (
    SELECT 1 
    FROM production_appointments pa
    WHERE pa."productionOrderId" = po.id
);

*/

-- ============================================================
-- ETAPA 4: VERIFICAR RESULTADO APÓS CORREÇÃO
-- ============================================================
-- Execute após descomentar e rodar a ETAPA 3

SELECT 
    'OP-2025-001 - APÓS CORREÇÃO' AS "Verificação",
    po."producedQuantity" AS "producedQuantity CORRIGIDO",
    COALESCE(SUM(pa."clpCounterValue"), 0) AS "Soma clpCounterValue",
    CASE 
        WHEN po."producedQuantity" = COALESCE(SUM(pa."clpCounterValue"), 0) THEN '✅ CORRIGIDO COM SUCESSO'
        ELSE '❌ AINDA HÁ DIVERGÊNCIA'
    END AS "Status"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-001'
GROUP BY po.id, po."producedQuantity";

-- ============================================================
-- ETAPA 5: VERIFICAR TODAS AS ORDENS APÓS CORREÇÃO
-- ============================================================

SELECT 
    po."orderNumber" AS "Ordem",
    po."producedQuantity" AS "Produzido (Corrigido)",
    COALESCE(SUM(pa."clpCounterValue"), 0) AS "Soma clpCounterValue",
    CASE 
        WHEN po."producedQuantity" = COALESCE(SUM(pa."clpCounterValue"), 0) THEN '✅ OK'
        ELSE '❌ AINDA DIVERGE'
    END AS "Status",
    po.status AS "Status Ordem"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
GROUP BY po.id, po."orderNumber", po."producedQuantity", po.status
ORDER BY po."orderNumber";

-- ============================================================
-- ETAPA 6: ESTATÍSTICAS DA CORREÇÃO
-- ============================================================

SELECT 
    COUNT(*) AS "Total de Ordens",
    COUNT(CASE WHEN po."producedQuantity" > 0 THEN 1 END) AS "Com Produção",
    COUNT(CASE WHEN po."producedQuantity" = COALESCE((
        SELECT SUM("clpCounterValue") 
        FROM production_appointments 
        WHERE "productionOrderId" = po.id
    ), 0) THEN 1 END) AS "Corretas",
    COUNT(CASE WHEN po."producedQuantity" != COALESCE((
        SELECT SUM("clpCounterValue") 
        FROM production_appointments 
        WHERE "productionOrderId" = po.id
    ), 0) THEN 1 END) AS "Ainda com Divergência"
FROM production_orders po;

-- ============================================================
-- DETALHES DOS APONTAMENTOS COM PROBLEMAS
-- ============================================================
-- Mostrar apontamentos que não têm clpCounterValue
-- (estes não serão contabilizados após a correção)

SELECT 
    po."orderNumber" AS "Ordem",
    COUNT(pa.id) AS "Total Apontamentos",
    COUNT(CASE WHEN pa."clpCounterValue" IS NULL THEN 1 END) AS "Sem clpCounterValue",
    COUNT(CASE WHEN pa."clpCounterValue" IS NOT NULL THEN 1 END) AS "Com clpCounterValue",
    ROUND(
        COUNT(CASE WHEN pa."clpCounterValue" IS NOT NULL THEN 1 END)::DECIMAL 
        / NULLIF(COUNT(pa.id), 0) * 100, 
    2) AS "% Com Contador"
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
GROUP BY po.id, po."orderNumber"
HAVING COUNT(CASE WHEN pa."clpCounterValue" IS NULL THEN 1 END) > 0
ORDER BY COUNT(CASE WHEN pa."clpCounterValue" IS NULL THEN 1 END) DESC;

-- ============================================================
-- FIM DO SCRIPT DE CORREÇÃO
-- ============================================================

/*
INSTRUÇÕES DE USO:

1. Execute ETAPA 1 para ver quais ordens têm divergência
2. Execute ETAPA 2 para verificar especificamente OP-2025-001
3. DESCOMENTE e execute ETAPA 3 para fazer a correção
4. Execute ETAPA 4 para verificar se OP-2025-001 foi corrigida
5. Execute ETAPA 5 para verificar todas as ordens
6. Execute ETAPA 6 para ver estatísticas

NOTAS IMPORTANTES:
- A correção usa clpCounterValue (contador do PLC) como fonte
- Apontamentos sem clpCounterValue serão ignorados (=0)
- Se uma ordem não tem nenhum clpCounterValue, ficará com 0
- O backend foi corrigido, então novos apontamentos estarão corretos
- Esta correção é segura e pode ser executada múltiplas vezes

DEPOIS DA CORREÇÃO:
- Cards (OrderPanel) e OrderSummary mostrarão o mesmo valor
- Barra de progresso mostrará percentual correto
- Dados estarão consistentes com a realidade do chão de fábrica
*/

