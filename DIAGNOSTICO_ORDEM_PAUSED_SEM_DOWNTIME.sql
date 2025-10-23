-- Diagnóstico: Ordens PAUSED sem Downtime Ativo
-- Identifica ordens pausadas que não têm parada ativa registrada

-- 1. Listar ordens com status PAUSED
SELECT 
    po.id,
    po."orderNumber",
    po.status,
    po."companyId",
    c.name as company_name
FROM production_orders po
LEFT JOIN companies c ON po."companyId" = c.id
WHERE po.status = 'PAUSED';

-- 2. Verificar downtimes ativos (sem endTime) para essas ordens
SELECT 
    po.id as order_id,
    po."orderNumber",
    po.status as order_status,
    d.id as downtime_id,
    d.type as downtime_type,
    d."startTime",
    d."endTime",
    at.name as activity_name
FROM production_orders po
LEFT JOIN downtimes d ON d."productionOrderId" = po.id AND d."endTime" IS NULL
LEFT JOIN activity_types at ON d."activityTypeId" = at.id
WHERE po.status = 'PAUSED';

-- 3. Identificar ordens PAUSED SEM downtime ativo (problema!)
SELECT 
    po.id,
    po."orderNumber",
    po.status,
    po."startDate",
    COUNT(d.id) as active_downtimes_count
FROM production_orders po
LEFT JOIN downtimes d ON d."productionOrderId" = po.id AND d."endTime" IS NULL
WHERE po.status = 'PAUSED'
GROUP BY po.id, po."orderNumber", po.status, po."startDate"
HAVING COUNT(d.id) = 0;

-- 4. Ver todos os downtimes da ordem (ativos e finalizados)
SELECT 
    po.id as order_id,
    po."orderNumber",
    po.status as order_status,
    d.id as downtime_id,
    d.type as downtime_type,
    d."startTime",
    d."endTime",
    d.duration,
    at.name as activity_name
FROM production_orders po
LEFT JOIN downtimes d ON d."productionOrderId" = po.id
LEFT JOIN activity_types at ON d."activityTypeId" = at.id
WHERE po.status = 'PAUSED'
ORDER BY d."startTime" DESC;

