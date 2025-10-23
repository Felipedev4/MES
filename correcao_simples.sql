-- Correção do campo producedQuantity
-- Executar este script no PostgreSQL

-- Atualizar producedQuantity para usar soma de clpCounterValue
UPDATE production_orders po
SET "producedQuantity" = COALESCE((
    SELECT SUM("clpCounterValue")
    FROM production_appointments
    WHERE "productionOrderId" = po.id
    AND "clpCounterValue" IS NOT NULL
), 0),
"updatedAt" = NOW();

-- Verificar resultado
SELECT 
    "orderNumber" as ordem,
    "producedQuantity" as produzido,
    "plannedQuantity" as planejado,
    ROUND(("producedQuantity"::DECIMAL / "plannedQuantity") * 100, 1) as percentual
FROM production_orders
WHERE "orderNumber" IN ('OP-2025-001', 'OP-2025-002', 'OP-2025-003', 'OP-2025-004')
ORDER BY "orderNumber";

