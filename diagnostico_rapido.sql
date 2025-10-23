-- Verificar últimos apontamentos
SELECT 
    id,
    "productionOrderId" as ordem_id,
    quantity as tempo,
    "clpCounterValue" as pecas,
    automatic,
    to_char(timestamp, 'DD/MM HH24:MI:SS') as data_hora
FROM production_appointments
ORDER BY timestamp DESC
LIMIT 15;

-- Linha separadora
\echo ' '
\echo '=========================================='
\echo 'TOTAIS:'
\echo '=========================================='

-- Ver totais
SELECT 
    COUNT(*) as total_apontamentos,
    SUM(quantity) as soma_tempo,
    SUM("clpCounterValue") as soma_pecas,
    COUNT("clpCounterValue") as com_clp_value
FROM production_appointments;

-- Linha separadora
\echo ' '
\echo '=========================================='
\echo 'ORDENS ATIVAS E MOLDES:'
\echo '=========================================='

-- Verificar ordens ativas
SELECT 
    po.id,
    po."orderNumber" as ordem,
    po.status,
    m.name as molde,
    m.cavities as cavidades,
    COUNT(pa.id) as total_apt,
    SUM(pa."clpCounterValue") as total_pecas
FROM production_orders po
LEFT JOIN molds m ON po."moldId" = m.id
LEFT JOIN production_appointments pa ON pa."productionOrderId" = po.id
WHERE po.status = 'ACTIVE'
GROUP BY po.id, m.id;

