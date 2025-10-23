-- Script de Diagnóstico: Início de Produção
-- Este script verifica possíveis problemas ao iniciar apontamento de produção

-- 1. Verificar ordens de produção e seus status
SELECT 
    po.id,
    po."orderNumber",
    po.status,
    po."plcConfigId",
    po."companyId",
    po."startDate",
    pc.name as plc_name,
    c.name as company_name
FROM production_orders po
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
LEFT JOIN companies c ON po."companyId" = c.id
WHERE po.status IN ('PROGRAMMING', 'ACTIVE', 'PAUSED')
ORDER BY po.id DESC
LIMIT 10;

-- 2. Verificar se há ordens ACTIVE (deveria ter no máximo 1 por CLP/empresa)
SELECT 
    po."companyId",
    po."plcConfigId",
    pc.name as plc_name,
    COUNT(*) as active_orders_count,
    STRING_AGG(po."orderNumber", ', ') as order_numbers
FROM production_orders po
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po.status = 'ACTIVE'
GROUP BY po."companyId", po."plcConfigId", pc.name;

-- 3. Verificar ordens sem PLC vinculado
SELECT 
    po.id,
    po."orderNumber",
    po.status,
    po."plcConfigId",
    po."companyId"
FROM production_orders po
WHERE po."plcConfigId" IS NULL
AND po.status IN ('PROGRAMMING', 'ACTIVE', 'PAUSED')
ORDER BY po.id DESC;

-- 4. Verificar últimos apontamentos de produção
SELECT 
    pa.id,
    pa."productionOrderId",
    po."orderNumber",
    pa.quantity,
    pa.timestamp,
    pa.automatic,
    u.name as user_name
FROM production_appointments pa
JOIN production_orders po ON pa."productionOrderId" = po.id
JOIN users u ON pa."userId" = u.id
ORDER BY pa.timestamp DESC
LIMIT 10;

-- 5. Verificar setups ativos (setup deve ser finalizado antes de iniciar produção)
SELECT 
    d.id,
    d."productionOrderId",
    po."orderNumber",
    d."startTime",
    d."endTime",
    d.type,
    at.name as activity_type_name
FROM downtimes d
JOIN production_orders po ON d."productionOrderId" = po.id
LEFT JOIN activity_types at ON d."activityTypeId" = at.id
WHERE d.type = 'SETUP' AND d."endTime" IS NULL
ORDER BY d."startTime" DESC;

