-- Script para verificar últimos apontamentos e detectar problemas

-- 1. Ver últimos 20 apontamentos
SELECT 
  pa.id,
  po."orderNumber" as "Ordem",
  pa.timestamp as "Data/Hora",
  pa.quantity as "Quantidade",
  pa."rejectedQuantity" as "Rejeitadas",
  pa."clpCounterValue" as "Contador CLP",
  pa.automatic as "Automático",
  u.name as "Usuário",
  EXTRACT(EPOCH FROM (pa.timestamp - LAG(pa.timestamp) OVER (PARTITION BY pa."productionOrderId" ORDER BY pa.timestamp))) as "Δ segundos"
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
INNER JOIN users u ON pa."userId" = u.id
ORDER BY pa.timestamp DESC
LIMIT 20;

-- 2. Ver se há apontamento de 18 peças (do log do usuário)
SELECT 
  pa.id,
  po."orderNumber",
  pa.timestamp,
  pa.quantity,
  pa."clpCounterValue",
  pa.automatic
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
WHERE pa.quantity = 18
AND pa.automatic = true
ORDER BY pa.timestamp DESC
LIMIT 10;

-- 3. Verificar duplicatas nos últimos registros
SELECT 
  pa1.id as "ID Original",
  pa1.timestamp as "Timestamp Original",
  pa1.quantity as "Quantidade",
  pa2.id as "ID Duplicado",
  pa2.timestamp as "Timestamp Duplicado",
  EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp)) as "Diferença (seg)",
  po."orderNumber" as "Ordem"
FROM production_appointments pa1
INNER JOIN production_appointments pa2 ON 
  pa1."productionOrderId" = pa2."productionOrderId"
  AND pa1.automatic = true
  AND pa2.automatic = true
  AND pa1.id < pa2.id
  AND ABS(EXTRACT(EPOCH FROM (pa2.timestamp - pa1.timestamp))) < 10
  AND pa1.quantity = pa2.quantity
INNER JOIN production_orders po ON pa1."productionOrderId" = po.id
ORDER BY pa1.timestamp DESC
LIMIT 20;

-- 4. Total de apontamentos hoje
SELECT 
  COUNT(*) as "Total Hoje",
  SUM(quantity) as "Total Peças",
  SUM(CASE WHEN automatic THEN quantity ELSE 0 END) as "Peças Automáticas",
  SUM(CASE WHEN NOT automatic THEN quantity ELSE 0 END) as "Peças Manuais"
FROM production_appointments
WHERE DATE(timestamp) = CURRENT_DATE;

-- 5. Status das ordens de produção
SELECT 
  id,
  "orderNumber",
  status,
  "plannedQuantity" as "Planejado",
  "producedQuantity" as "Produzido",
  "rejectedQuantity" as "Rejeitado",
  ROUND(("producedQuantity"::numeric / NULLIF("plannedQuantity", 0)) * 100, 2) as "% Completo"
FROM production_orders
WHERE status IN ('ACTIVE', 'COMPLETED')
ORDER BY "updatedAt" DESC
LIMIT 10;

