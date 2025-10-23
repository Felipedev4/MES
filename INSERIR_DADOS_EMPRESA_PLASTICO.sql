-- ================================================================================================
-- 🏭 DADOS REALISTAS - Empresa de Injeção de Plásticos
-- ================================================================================================
-- Insere dados de exemplo para testar o sistema MES
-- Baseado em uma empresa real de injeção de plásticos
-- ================================================================================================

-- ================================================================================================
-- 1️⃣ MOLDES (Ferramentas de Injeção)
-- ================================================================================================

-- Molde 1: Tampa de Pote
INSERT INTO molds (code, name, description, cavities, "activeCavities", "cycleTime", "companyId", active, "createdAt", "updatedAt")
VALUES (
    'MOL-001',
    'Tampa Pote 500ml',
    'Molde 8 cavidades para tampa de pote plástico 500ml',
    8,
    8,
    12.5,  -- 12.5 segundos de ciclo
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "activeCavities" = 8,
    "updatedAt" = NOW();

-- Molde 2: Copo Descartável
INSERT INTO molds (code, name, description, cavities, "activeCavities", "cycleTime", "companyId", active, "createdAt", "updatedAt")
VALUES (
    'MOL-002',
    'Copo 200ml',
    'Molde 16 cavidades para copo descartável 200ml',
    16,
    16,
    8.0,  -- 8 segundos de ciclo
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "activeCavities" = 16,
    "updatedAt" = NOW();

-- Molde 3: Pote de Margarina
INSERT INTO molds (code, name, description, cavities, "activeCavities", "cycleTime", "companyId", active, "createdAt", "updatedAt")
VALUES (
    'MOL-003',
    'Pote Margarina 500g',
    'Molde 4 cavidades para pote de margarina',
    4,
    4,
    18.0,  -- 18 segundos de ciclo
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "activeCavities" = 4,
    "updatedAt" = NOW();

-- Molde 4: Balde
INSERT INTO molds (code, name, description, cavities, "activeCavities", "cycleTime", "companyId", active, "createdAt", "updatedAt")
VALUES (
    'MOL-004',
    'Balde 10L',
    'Molde 2 cavidades para balde de 10 litros',
    2,
    2,
    35.0,  -- 35 segundos de ciclo
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "activeCavities" = 2,
    "updatedAt" = NOW();

-- ================================================================================================
-- 2️⃣ ITENS/PRODUTOS
-- ================================================================================================

-- Item 1: Tampa de Pote
INSERT INTO items (code, name, description, unit, "companyId", active, "createdAt", "updatedAt")
VALUES (
    'ITEM-001',
    'Tampa Pote 500ml Transparente',
    'Tampa plástica PP transparente para pote 500ml',
    'pç',
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "updatedAt" = NOW();

-- Item 2: Copo Descartável
INSERT INTO items (code, name, description, unit, "companyId", active, "createdAt", "updatedAt")
VALUES (
    'ITEM-002',
    'Copo 200ml Branco',
    'Copo descartável PP branco 200ml',
    'pç',
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "updatedAt" = NOW();

-- Item 3: Pote de Margarina
INSERT INTO items (code, name, description, unit, "companyId", active, "createdAt", "updatedAt")
VALUES (
    'ITEM-003',
    'Pote Margarina 500g Amarelo',
    'Pote plástico PP amarelo para margarina 500g',
    'pç',
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "updatedAt" = NOW();

-- Item 4: Balde
INSERT INTO items (code, name, description, unit, "companyId", active, "createdAt", "updatedAt")
VALUES (
    'ITEM-004',
    'Balde 10L Azul',
    'Balde plástico PP azul 10 litros com alça',
    'pç',
    1,
    true,
    NOW(),
    NOW()
) ON CONFLICT (code) DO UPDATE SET 
    "companyId" = 1,
    "updatedAt" = NOW();

-- ================================================================================================
-- 3️⃣ ORDENS DE PRODUÇÃO
-- ================================================================================================

-- Ordem 1: Tampa de Pote - FINALIZADA (histórico)
INSERT INTO production_orders (
    "orderNumber", "itemId", "moldId", "companyId", 
    "plannedQuantity", "producedQuantity", "rejectedQuantity",
    status, priority,
    "startDate", "endDate",
    "plannedStartDate", "plannedEndDate",
    "createdAt", "updatedAt"
)
VALUES (
    'OP-2025-001',
    (SELECT id FROM items WHERE code = 'ITEM-001'),
    (SELECT id FROM molds WHERE code = 'MOL-001'),
    1,
    5000,  -- 5.000 tampas
    5000,  -- Produzidas
    100,   -- 100 rejeitadas
    'FINISHED',
    5,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '7 days',
    NOW()
) ON CONFLICT ("orderNumber") DO UPDATE SET
    "companyId" = 1,
    "producedQuantity" = 5000,
    "rejectedQuantity" = 100,
    "updatedAt" = NOW();

-- Ordem 2: Copos - ATIVA
INSERT INTO production_orders (
    "orderNumber", "itemId", "moldId", "companyId", 
    "plannedQuantity", "producedQuantity", "rejectedQuantity",
    status, priority,
    "startDate",
    "plannedStartDate", "plannedEndDate",
    "createdAt", "updatedAt"
)
VALUES (
    'OP-2025-002',
    (SELECT id FROM items WHERE code = 'ITEM-002'),
    (SELECT id FROM molds WHERE code = 'MOL-002'),
    1,
    10000,  -- 10.000 copos
    7500,   -- 7.500 produzidos até agora
    150,    -- 150 rejeitados
    'ACTIVE',
    10,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '1 day',
    NOW() - INTERVAL '3 days',
    NOW()
) ON CONFLICT ("orderNumber") DO UPDATE SET
    "companyId" = 1,
    "producedQuantity" = 7500,
    "rejectedQuantity" = 150,
    status = 'ACTIVE',
    "updatedAt" = NOW();

-- Ordem 3: Potes de Margarina - PROGRAMMING
INSERT INTO production_orders (
    "orderNumber", "itemId", "moldId", "companyId", 
    "plannedQuantity", "producedQuantity", "rejectedQuantity",
    status, priority,
    "plannedStartDate", "plannedEndDate",
    "createdAt", "updatedAt"
)
VALUES (
    'OP-2025-003',
    (SELECT id FROM items WHERE code = 'ITEM-003'),
    (SELECT id FROM molds WHERE code = 'MOL-003'),
    1,
    3000,  -- 3.000 potes
    0,
    0,
    'PROGRAMMING',
    7,
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '4 days',
    NOW() - INTERVAL '1 day',
    NOW()
) ON CONFLICT ("orderNumber") DO UPDATE SET
    "companyId" = 1,
    "updatedAt" = NOW();

-- Ordem 4: Baldes - PAUSED
INSERT INTO production_orders (
    "orderNumber", "itemId", "moldId", "companyId", 
    "plannedQuantity", "producedQuantity", "rejectedQuantity",
    status, priority,
    "startDate",
    "plannedStartDate", "plannedEndDate",
    "createdAt", "updatedAt"
)
VALUES (
    'OP-2025-004',
    (SELECT id FROM items WHERE code = 'ITEM-004'),
    (SELECT id FROM molds WHERE code = 'MOL-004'),
    1,
    500,   -- 500 baldes
    350,   -- 350 produzidos
    25,    -- 25 rejeitados
    'PAUSED',
    6,
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '1 day',
    NOW() - INTERVAL '5 days',
    NOW()
) ON CONFLICT ("orderNumber") DO UPDATE SET
    "companyId" = 1,
    "producedQuantity" = 350,
    "rejectedQuantity" = 25,
    "updatedAt" = NOW();

-- ================================================================================================
-- 4️⃣ APONTAMENTOS DE PRODUÇÃO (Histórico Realista)
-- ================================================================================================

-- Apontamentos da Ordem 1 (Tampas - Finalizada)
INSERT INTO production_appointments ("productionOrderId", "userId", quantity, "rejectedQuantity", timestamp, automatic, "createdAt")
SELECT 
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'),
    1,
    400,  -- 400 peças por apontamento (8 cavidades x 50 ciclos)
    8,    -- ~2% de rejeição
    NOW() - INTERVAL '7 days' + (n || ' hours')::INTERVAL,
    true,
    NOW() - INTERVAL '7 days' + (n || ' hours')::INTERVAL
FROM generate_series(0, 11) n  -- 12 apontamentos ao longo do dia
ON CONFLICT DO NOTHING;

-- Apontamentos da Ordem 2 (Copos - Ativa)
INSERT INTO production_appointments ("productionOrderId", "userId", quantity, "rejectedQuantity", timestamp, automatic, "createdAt")
SELECT 
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-002'),
    1,
    500,  -- 500 peças (16 cavidades x ~31 ciclos)
    10,   -- ~2% de rejeição
    NOW() - INTERVAL '2 days' + (n || ' hours')::INTERVAL,
    true,
    NOW() - INTERVAL '2 days' + (n || ' hours')::INTERVAL
FROM generate_series(0, 14) n  -- 15 apontamentos
ON CONFLICT DO NOTHING;

-- Apontamentos da Ordem 4 (Baldes - Pausada)
INSERT INTO production_appointments ("productionOrderId", "userId", quantity, "rejectedQuantity", timestamp, automatic, "createdAt")
SELECT 
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-004'),
    1,
    50,   -- 50 peças (2 cavidades x 25 ciclos)
    5,    -- ~5% de rejeição (produto maior, mais problemas)
    NOW() - INTERVAL '4 days' + (n || ' hours')::INTERVAL,
    true,
    NOW() - INTERVAL '4 days' + (n || ' hours')::INTERVAL
FROM generate_series(0, 6) n  -- 7 apontamentos
ON CONFLICT DO NOTHING;

-- ================================================================================================
-- 5️⃣ PARADAS (Downtimes) - Realistas
-- ================================================================================================

-- Parada 1: Setup de molde (Ordem 1)
INSERT INTO downtimes ("productionOrderId", type, reason, "startTime", "endTime", duration, "createdAt", "updatedAt")
VALUES (
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-001'),
    'PRODUCTIVE',
    'Setup e troca de molde',
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days' + INTERVAL '45 minutes',
    2700,  -- 45 minutos em segundos
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Parada 2: Falta de matéria-prima (Ordem 2)
INSERT INTO downtimes ("productionOrderId", type, reason, description, "startTime", "endTime", duration, "createdAt", "updatedAt")
VALUES (
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-002'),
    'UNPRODUCTIVE',
    'Falta de matéria-prima',
    'Atraso na entrega de PP virgem',
    NOW() - INTERVAL '2 days' + INTERVAL '4 hours',
    NOW() - INTERVAL '2 days' + INTERVAL '5 hours 30 minutes',
    5400,  -- 90 minutos
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Parada 3: Manutenção preventiva
INSERT INTO downtimes ("productionOrderId", type, reason, description, "startTime", "endTime", duration, "createdAt", "updatedAt")
VALUES (
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-002'),
    'PLANNED',
    'Manutenção preventiva',
    'Limpeza de molde e lubrificação',
    NOW() - INTERVAL '1 day' + INTERVAL '12 hours',
    NOW() - INTERVAL '1 day' + INTERVAL '12 hours 30 minutes',
    1800,  -- 30 minutos
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Parada 4: Quebra de injetora (Ordem 4 - por isso pausada)
INSERT INTO downtimes ("productionOrderId", type, reason, description, "startTime", "endTime", duration, "createdAt", "updatedAt")
VALUES (
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-004'),
    'UNPRODUCTIVE',
    'Quebra de equipamento',
    'Falha na unidade hidráulica da injetora',
    NOW() - INTERVAL '3 days' + INTERVAL '10 hours',
    NOW() - INTERVAL '3 days' + INTERVAL '14 hours',
    14400,  -- 4 horas
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Parada 5: Ajuste de temperatura
INSERT INTO downtimes ("productionOrderId", type, reason, description, "startTime", "endTime", duration, "createdAt", "updatedAt")
VALUES (
    (SELECT id FROM production_orders WHERE "orderNumber" = 'OP-2025-002'),
    'PRODUCTIVE',
    'Ajuste de parâmetros',
    'Ajuste de temperatura e pressão de injeção',
    NOW() - INTERVAL '1 day' + INTERVAL '8 hours',
    NOW() - INTERVAL '1 day' + INTERVAL '8 hours 15 minutes',
    900,  -- 15 minutos
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- ================================================================================================
-- ✅ VERIFICAÇÃO DOS DADOS INSERIDOS
-- ================================================================================================

SELECT '🏭 RESUMO DOS DADOS INSERIDOS' as titulo;

SELECT 
    '📊 MOLDES' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN active THEN 1 ELSE 0 END) as ativos
FROM molds WHERE "companyId" = 1;

SELECT 
    '📦 ITENS' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN active THEN 1 ELSE 0 END) as ativos
FROM items WHERE "companyId" = 1;

SELECT 
    '📋 ORDENS' as tipo,
    COUNT(*) as total,
    SUM("producedQuantity") as total_produzido,
    SUM("rejectedQuantity") as total_rejeitado
FROM production_orders WHERE "companyId" = 1;

SELECT 
    '✍️ APONTAMENTOS' as tipo,
    COUNT(*) as total,
    SUM(quantity) as pecas_produzidas,
    SUM("rejectedQuantity") as pecas_rejeitadas
FROM production_appointments pa
INNER JOIN production_orders po ON pa."productionOrderId" = po.id
WHERE po."companyId" = 1;

SELECT 
    '⏸️ PARADAS' as tipo,
    COUNT(*) as total,
    ROUND(SUM(duration)::numeric / 3600, 2) as total_horas
FROM downtimes d
INNER JOIN production_orders po ON d."productionOrderId" = po.id
WHERE po."companyId" = 1;

-- Ver OEE calculado
WITH stats AS (
    SELECT 
        SUM(pa.quantity) as total_prod,
        SUM(pa."rejectedQuantity") as total_rej
    FROM production_appointments pa
    INNER JOIN production_orders po ON pa."productionOrderId" = po.id
    WHERE po."companyId" = 1
)
SELECT 
    '📈 KPIs CALCULADOS' as tipo,
    total_prod as total_produzido,
    total_rej as total_rejeitado,
    ROUND(((total_prod - total_rej)::numeric / total_prod * 100), 2) as taxa_qualidade_percent
FROM stats;

-- ================================================================================================
-- FIM DO SCRIPT
-- ================================================================================================

