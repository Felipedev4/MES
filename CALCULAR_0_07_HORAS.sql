-- ============================================
-- DESCOBRIR DE ONDE VEM O 0.07 HORAS
-- ============================================

\echo '=========================================='
\echo '1. SOMA TOTAL DOS QUANTITY'
\echo '=========================================='

SELECT 
    COUNT(*) as total_apontamentos,
    SUM(quantity) as soma_quantity_total,
    AVG(quantity) as media_quantity,
    MIN(quantity) as menor_quantity,
    MAX(quantity) as maior_quantity
FROM production_appointments
WHERE "productionOrderId" = (
    SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'
);

\echo ' '
\echo '=========================================='
\echo '2. TIME DIVISOR DO CLP'
\echo '=========================================='

SELECT 
    po."orderNumber",
    po."plcConfigId",
    pc.name as clp_name,
    pc."timeDivisor",
    COALESCE(pc."timeDivisor", 10) as divisor_usado
FROM production_orders po
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001';

\echo ' '
\echo '=========================================='
\echo '3. CÁLCULO COMPLETO (REPRODUZINDO O FRONTEND)'
\echo '=========================================='

SELECT 
    COUNT(*) as total_apontamentos,
    SUM(quantity) as soma_quantity,
    COALESCE(pc."timeDivisor", 10) as time_divisor,
    
    -- Passo 1: totalTimeUnits (soma dos quantity)
    SUM(quantity) as total_time_units,
    
    -- Passo 2: totalSeconds (dividir pelo timeDivisor)
    SUM(quantity) / COALESCE(pc."timeDivisor", 10) as total_seconds,
    
    -- Passo 3: productionHours (dividir por 3600)
    ROUND((SUM(quantity) / COALESCE(pc."timeDivisor", 10)) / 3600.0, 4) as production_hours,
    
    -- Passo 4: Tempo formatado (HH:MM:SS)
    CONCAT(
        LPAD((SUM(quantity) / COALESCE(pc."timeDivisor", 10) / 3600)::int::text, 2, '0'), ':',
        LPAD(((SUM(quantity) / COALESCE(pc."timeDivisor", 10) % 3600) / 60)::int::text, 2, '0'), ':',
        LPAD((SUM(quantity) / COALESCE(pc."timeDivisor", 10) % 60)::int::text, 2, '0')
    ) as tempo_total_formatado,
    
    -- Bonus: Total de peças
    SUM("clpCounterValue") as total_pecas_atual,
    
    -- Bonus: Peças por hora
    CASE 
        WHEN SUM(quantity) > 0 THEN
            ROUND((SUM("clpCounterValue") / (SUM(quantity) / COALESCE(pc."timeDivisor", 10))) * 3600, 2)
        ELSE 0
    END as pecas_por_hora
    
FROM production_appointments pa
JOIN production_orders po ON pa."productionOrderId" = po.id
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001';

\echo ' '
\echo '=========================================='
\echo '4. ANÁLISE: CICLO MÉDIO'
\echo '=========================================='

SELECT 
    ROUND(AVG(quantity / COALESCE(pc."timeDivisor", 10)), 2) as ciclo_medio_segundos,
    ROUND(MIN(quantity / COALESCE(pc."timeDivisor", 10)), 2) as ciclo_menor_segundos,
    ROUND(MAX(quantity / COALESCE(pc."timeDivisor", 10)), 2) as ciclo_maior_segundos,
    
    CASE 
        WHEN AVG(quantity / COALESCE(pc."timeDivisor", 10)) < 5 THEN 
            '⚠️ MUITO RÁPIDO! Ciclos < 5s não são normais'
        WHEN AVG(quantity / COALESCE(pc."timeDivisor", 10)) BETWEEN 5 AND 15 THEN
            '⚠️ Rápido. Ciclos entre 5-15s'
        WHEN AVG(quantity / COALESCE(pc."timeDivisor", 10)) BETWEEN 15 AND 40 THEN
            '✅ Normal. Ciclos entre 15-40s'
        WHEN AVG(quantity / COALESCE(pc."timeDivisor", 10)) > 40 THEN
            '⚠️ Lento. Ciclos > 40s'
        ELSE 'Sem dados'
    END as analise_ciclo
    
FROM production_appointments pa
JOIN production_orders po ON pa."productionOrderId" = po.id
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001';

\echo ' '
\echo '=========================================='
\echo '5. ÚLTIMOS 10 APONTAMENTOS DETALHADOS'
\echo '=========================================='

SELECT 
    pa.id,
    pa.quantity as quantity_unidades,
    ROUND(pa.quantity / COALESCE(pc."timeDivisor", 10), 2) as tempo_segundos,
    pa."clpCounterValue" as pecas,
    to_char(pa.timestamp, 'DD/MM HH24:MI:SS') as data_hora
FROM production_appointments pa
JOIN production_orders po ON pa."productionOrderId" = po.id
LEFT JOIN plc_configs pc ON po."plcConfigId" = pc.id
WHERE po."orderNumber" = 'OP-2025-001'
ORDER BY pa.timestamp DESC
LIMIT 10;

