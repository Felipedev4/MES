-- Script para investigar apontamentos perdidos

-- 1. Ver TODOS os apontamentos de hoje
SELECT 
  id,
  "productionOrderId" as "Ordem",
  quantity as "Qtd",
  "clpCounterValue" as "Contador",
  TO_CHAR(timestamp, 'HH24:MI:SS') as "Hora",
  automatic
FROM production_appointments
WHERE DATE(timestamp) = CURRENT_DATE
ORDER BY timestamp DESC;

-- 2. Ver diferença entre timestamps (detectar gaps)
WITH apontamentos_ordenados AS (
  SELECT 
    id,
    quantity,
    "clpCounterValue",
    timestamp,
    LAG(timestamp) OVER (ORDER BY timestamp) as timestamp_anterior,
    LAG(quantity) OVER (ORDER BY timestamp) as quantidade_anterior
  FROM production_appointments
  WHERE DATE(timestamp) = CURRENT_DATE
  AND automatic = true
)
SELECT 
  id,
  quantity,
  "clpCounterValue",
  TO_CHAR(timestamp, 'HH24:MI:SS.MS') as "Hora",
  TO_CHAR(timestamp_anterior, 'HH24:MI:SS.MS') as "Hora Anterior",
  EXTRACT(EPOCH FROM (timestamp - timestamp_anterior)) as "Diferença (seg)",
  quantidade_anterior as "Qtd Anterior"
FROM apontamentos_ordenados
WHERE timestamp_anterior IS NOT NULL
ORDER BY timestamp DESC;

-- 3. Total de peças por apontamento
SELECT 
  COUNT(*) as "Total Apontamentos",
  SUM(quantity) as "Total Peças",
  MIN(quantity) as "Menor Qtd",
  MAX(quantity) as "Maior Qtd",
  ROUND(AVG(quantity), 2) as "Média Qtd"
FROM production_appointments
WHERE DATE(timestamp) = CURRENT_DATE
AND automatic = true;

-- 4. Ver se há padrão nas quantidades
SELECT 
  quantity as "Quantidade",
  COUNT(*) as "Frequência"
FROM production_appointments
WHERE DATE(timestamp) = CURRENT_DATE
AND automatic = true
GROUP BY quantity
ORDER BY quantity;

-- 5. Últimos 20 apontamentos com detalhes
SELECT 
  pa.id,
  po."orderNumber" as "Ordem",
  pa.quantity as "Quantidade",
  pa."clpCounterValue" as "Contador CLP",
  TO_CHAR(pa.timestamp, 'DD/MM HH24:MI:SS') as "Data/Hora",
  pa.automatic as "Auto"
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
ORDER BY pa.timestamp DESC
LIMIT 20;

