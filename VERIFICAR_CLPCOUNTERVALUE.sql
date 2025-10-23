-- Verificar se clpCounterValue está sendo preenchido corretamente nos apontamentos
-- Script de diagnóstico

-- 1. Ver apontamentos recentes e comparar quantity vs clpCounterValue
SELECT 
    id,
    "productionOrderId",
    quantity,
    "clpCounterValue",
    automatic,
    timestamp,
    CASE 
        WHEN "clpCounterValue" IS NULL THEN '❌ NULL'
        WHEN "clpCounterValue" = 0 THEN '⚠️ ZERO'
        ELSE '✅ OK'
    END as status
FROM production_appointments
ORDER BY timestamp DESC
LIMIT 20;

-- 2. Contar quantos apontamentos têm clpCounterValue NULL ou 0
SELECT 
    COUNT(*) as total_apontamentos,
    COUNT("clpCounterValue") as com_clp_value,
    COUNT(*) - COUNT("clpCounterValue") as sem_clp_value,
    SUM(CASE WHEN "clpCounterValue" = 0 THEN 1 ELSE 0 END) as clp_value_zero
FROM production_appointments;

-- 3. Soma de quantidade por campo (para ver a diferença)
SELECT 
    SUM(quantity) as soma_quantity,
    SUM("clpCounterValue") as soma_clpCounterValue,
    COUNT(*) as total_registros
FROM production_appointments;

-- 4. Ver detalhes de uma ordem específica (se você souber o ID)
-- Descomente e ajuste o ID se necessário:
-- SELECT 
--     pa.id,
--     pa.quantity,
--     pa."clpCounterValue",
--     pa.automatic,
--     pa.timestamp,
--     po."orderNumber",
--     po."producedQuantity"
-- FROM production_appointments pa
-- JOIN production_orders po ON pa."productionOrderId" = po.id
-- WHERE pa."productionOrderId" = 1  -- AJUSTE O ID DA ORDEM
-- ORDER BY pa.timestamp DESC;


