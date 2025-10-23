-- Verificar detalhes da OP-2025-001
SELECT 
    po."orderNumber" as ordem,
    po."producedQuantity" as campo_producedQuantity,
    po."plannedQuantity" as planejado,
    COALESCE(SUM(pa."clpCounterValue"), 0) as soma_clpCounterValue,
    COUNT(pa.id) as total_apontamentos,
    COUNT(CASE WHEN pa."clpCounterValue" IS NOT NULL THEN 1 END) as com_contador,
    ROUND((po."producedQuantity"::DECIMAL / po."plannedQuantity") * 100, 1) as percentual
FROM production_orders po
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po."orderNumber" = 'OP-2025-001'
GROUP BY po.id, po."orderNumber", po."producedQuantity", po."plannedQuantity";

