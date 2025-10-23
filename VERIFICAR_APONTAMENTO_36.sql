-- Verificar se o apontamento de 36 peças foi gravado

-- 1. Buscar apontamentos de 36 peças
SELECT 
  pa.id,
  po."orderNumber" as "Ordem",
  pa.quantity as "Quantidade",
  pa."clpCounterValue" as "Contador CLP",
  pa.timestamp as "Data/Hora",
  pa.automatic as "Automático"
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
WHERE pa.quantity = 36
AND pa.automatic = true
ORDER BY pa.timestamp DESC
LIMIT 5;

-- 2. Buscar todos apontamentos de hoje
SELECT 
  pa.id,
  po."orderNumber",
  pa.quantity,
  pa."clpCounterValue",
  pa.timestamp,
  TO_CHAR(pa.timestamp, 'HH24:MI:SS') as "Hora"
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
WHERE DATE(pa.timestamp) = CURRENT_DATE
AND pa.automatic = true
ORDER BY pa.timestamp DESC;

-- 3. Últimos 10 apontamentos (qualquer quantidade)
SELECT 
  pa.id,
  po."orderNumber",
  pa.quantity,
  pa."clpCounterValue",
  pa.timestamp,
  TO_CHAR(pa.timestamp, 'HH24:MI:SS') as "Hora"
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
WHERE pa.automatic = true
ORDER BY pa.timestamp DESC
LIMIT 10;

-- 4. Status atual da ordem OP-2025-001
SELECT 
  "orderNumber",
  status,
  "plannedQuantity" as "Planejado",
  "producedQuantity" as "Produzido",
  "rejectedQuantity" as "Rejeitado",
  ROUND(("producedQuantity"::numeric / NULLIF("plannedQuantity", 0)) * 100, 2) as "% Completo"
FROM production_orders
WHERE "orderNumber" = 'OP-2025-001';

