-- ================================================================================================
-- 🔍 SCRIPT DE VERIFICAÇÃO - Vínculos com Empresa
-- ================================================================================================
-- Execute este script para verificar como os dados estão vinculados às empresas
-- ================================================================================================

-- ================================================================================================
-- 1️⃣ EMPRESAS CADASTRADAS
-- ================================================================================================
SELECT 
    '📊 EMPRESAS CADASTRADAS' as secao,
    id,
    code as codigo,
    name as nome,
    trade_name as nome_fantasia,
    active as ativa
FROM companies
ORDER BY id;

-- ================================================================================================
-- 2️⃣ USUÁRIOS E SUAS EMPRESAS
-- ================================================================================================
SELECT 
    '👥 USUÁRIOS E EMPRESAS' as secao,
    u.id as user_id,
    u.name as usuario,
    u.email,
    u.role as cargo,
    u.selected_company_id as empresa_selecionada,
    c.name as nome_empresa_selecionada,
    (
        SELECT COUNT(*) 
        FROM user_companies uc 
        WHERE uc.user_id = u.id
    ) as total_empresas_vinculadas
FROM users u
LEFT JOIN companies c ON u.selected_company_id = c.id
ORDER BY u.id;

-- ================================================================================================
-- 3️⃣ VÍNCULO USER-COMPANY (Quais empresas cada usuário pode acessar)
-- ================================================================================================
SELECT 
    '🔗 VÍNCULOS USUÁRIO-EMPRESA' as secao,
    u.id as user_id,
    u.name as usuario,
    c.id as company_id,
    c.name as empresa,
    uc.is_default as empresa_padrao
FROM user_companies uc
INNER JOIN users u ON uc.user_id = u.id
INNER JOIN companies c ON uc.company_id = c.id
ORDER BY u.id, uc.is_default DESC, c.name;

-- ================================================================================================
-- 4️⃣ MOLDES POR EMPRESA
-- ================================================================================================
SELECT 
    '🔧 MOLDES POR EMPRESA' as secao,
    COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
    m.company_id,
    COUNT(m.id) as total_moldes,
    COUNT(CASE WHEN m.active THEN 1 END) as moldes_ativos,
    COUNT(CASE WHEN NOT m.active THEN 1 END) as moldes_inativos
FROM molds m
LEFT JOIN companies c ON m.company_id = c.id
GROUP BY m.company_id, c.name
ORDER BY m.company_id NULLS FIRST;

-- ================================================================================================
-- 5️⃣ ITENS POR EMPRESA
-- ================================================================================================
SELECT 
    '📦 ITENS POR EMPRESA' as secao,
    COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
    i.company_id,
    COUNT(i.id) as total_itens,
    COUNT(CASE WHEN i.active THEN 1 END) as itens_ativos,
    COUNT(CASE WHEN NOT i.active THEN 1 END) as itens_inativos
FROM items i
LEFT JOIN companies c ON i.company_id = c.id
GROUP BY i.company_id, c.name
ORDER BY i.company_id NULLS FIRST;

-- ================================================================================================
-- 6️⃣ ORDENS DE PRODUÇÃO POR EMPRESA
-- ================================================================================================
SELECT 
    '📋 ORDENS DE PRODUÇÃO POR EMPRESA' as secao,
    COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
    po.company_id,
    COUNT(po.id) as total_ordens,
    COUNT(CASE WHEN po.status = 'PROGRAMMING' THEN 1 END) as programacao,
    COUNT(CASE WHEN po.status = 'ACTIVE' THEN 1 END) as ativas,
    COUNT(CASE WHEN po.status = 'PAUSED' THEN 1 END) as pausadas,
    COUNT(CASE WHEN po.status = 'FINISHED' THEN 1 END) as finalizadas,
    COUNT(CASE WHEN po.status = 'CANCELLED' THEN 1 END) as canceladas
FROM production_orders po
LEFT JOIN companies c ON po.company_id = c.id
GROUP BY po.company_id, c.name
ORDER BY po.company_id NULLS FIRST;

-- ================================================================================================
-- 7️⃣ APONTAMENTOS POR EMPRESA (INDIRETO VIA ORDEM)
-- ================================================================================================
SELECT 
    '✍️ APONTAMENTOS POR EMPRESA' as secao,
    COALESCE(c.name, '❌ SEM EMPRESA (órfãos)') as empresa,
    po.company_id,
    COUNT(pa.id) as total_apontamentos,
    COUNT(CASE WHEN pa.automatic THEN 1 END) as automaticos,
    COUNT(CASE WHEN NOT pa.automatic THEN 1 END) as manuais,
    SUM(pa.quantity) as total_produzido,
    SUM(pa.rejected_quantity) as total_rejeitado
FROM production_appointments pa
INNER JOIN production_orders po ON pa.production_order_id = po.id
LEFT JOIN companies c ON po.company_id = c.id
GROUP BY po.company_id, c.name
ORDER BY po.company_id NULLS FIRST;

-- ================================================================================================
-- 8️⃣ PARADAS (DOWNTIME) POR EMPRESA (INDIRETO VIA ORDEM)
-- ================================================================================================
SELECT 
    '⏸️ PARADAS POR EMPRESA' as secao,
    COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
    po.company_id,
    COUNT(d.id) as total_paradas,
    COUNT(CASE WHEN d.type = 'PRODUCTIVE' THEN 1 END) as produtivas,
    COUNT(CASE WHEN d.type = 'UNPRODUCTIVE' THEN 1 END) as improdutivas,
    COUNT(CASE WHEN d.type = 'PLANNED' THEN 1 END) as planejadas,
    ROUND(SUM(d.duration)::numeric / 3600, 2) as total_horas_parada
FROM downtimes d
LEFT JOIN production_orders po ON d.production_order_id = po.id
LEFT JOIN companies c ON po.company_id = c.id
WHERE d.production_order_id IS NOT NULL
GROUP BY po.company_id, c.name
ORDER BY po.company_id NULLS FIRST;

-- ================================================================================================
-- 9️⃣ SETORES POR EMPRESA
-- ================================================================================================
SELECT 
    '🏭 SETORES POR EMPRESA' as secao,
    c.name as empresa,
    s.company_id,
    COUNT(s.id) as total_setores,
    COUNT(CASE WHEN s.active THEN 1 END) as setores_ativos
FROM sectors s
INNER JOIN companies c ON s.company_id = c.id
GROUP BY s.company_id, c.name
ORDER BY s.company_id;

-- ================================================================================================
-- 🔟 CONFIGURAÇÕES PLC POR EMPRESA (INDIRETO VIA SETOR)
-- ================================================================================================
SELECT 
    '⚙️ PLCs POR EMPRESA' as secao,
    COALESCE(c.name, '❌ SEM EMPRESA') as empresa,
    s.company_id,
    COUNT(pc.id) as total_plcs,
    COUNT(CASE WHEN pc.active THEN 1 END) as plcs_ativos
FROM plc_configs pc
LEFT JOIN sectors s ON pc.sector_id = s.id
LEFT JOIN companies c ON s.company_id = c.id
GROUP BY s.company_id, c.name
ORDER BY s.company_id NULLS FIRST;

-- ================================================================================================
-- 🚨 VERIFICAÇÃO DE REGISTROS ÓRFÃOS (SEM EMPRESA)
-- ================================================================================================

-- Moldes sem empresa
SELECT 
    '🚨 MOLDES SEM EMPRESA' as problema,
    m.id,
    m.code as codigo,
    m.name as nome,
    m.company_id
FROM molds m
WHERE m.company_id IS NULL
ORDER BY m.id;

-- Itens sem empresa
SELECT 
    '🚨 ITENS SEM EMPRESA' as problema,
    i.id,
    i.code as codigo,
    i.name as nome,
    i.company_id
FROM items i
WHERE i.company_id IS NULL
ORDER BY i.id;

-- Ordens sem empresa
SELECT 
    '🚨 ORDENS SEM EMPRESA' as problema,
    po.id,
    po.order_number as numero_ordem,
    po.status,
    po.company_id
FROM production_orders po
WHERE po.company_id IS NULL
ORDER BY po.id;

-- ================================================================================================
-- 📊 RESUMO GERAL
-- ================================================================================================
SELECT 
    '📊 RESUMO GERAL' as titulo,
    (SELECT COUNT(*) FROM companies WHERE active = true) as empresas_ativas,
    (SELECT COUNT(*) FROM users WHERE active = true) as usuarios_ativos,
    (SELECT COUNT(*) FROM user_companies) as vinculos_user_company,
    (SELECT COUNT(*) FROM molds WHERE company_id IS NOT NULL) as moldes_vinculados,
    (SELECT COUNT(*) FROM molds WHERE company_id IS NULL) as moldes_orfaos,
    (SELECT COUNT(*) FROM items WHERE company_id IS NOT NULL) as itens_vinculados,
    (SELECT COUNT(*) FROM items WHERE company_id IS NULL) as itens_orfaos,
    (SELECT COUNT(*) FROM production_orders WHERE company_id IS NOT NULL) as ordens_vinculadas,
    (SELECT COUNT(*) FROM production_orders WHERE company_id IS NULL) as ordens_orfas,
    (SELECT COUNT(*) FROM production_appointments) as total_apontamentos,
    (SELECT COUNT(*) FROM downtimes) as total_paradas;

-- ================================================================================================
-- 💡 DICAS DE CORREÇÃO
-- ================================================================================================

-- Se encontrou registros órfãos, use os scripts abaixo para corrigi-los:

/*
-- ✅ Associar moldes órfãos à empresa 1
UPDATE molds 
SET company_id = 1 
WHERE company_id IS NULL;

-- ✅ Associar itens órfãos à empresa 1
UPDATE items 
SET company_id = 1 
WHERE company_id IS NULL;

-- ✅ Associar ordens órfãs à empresa 1
UPDATE production_orders 
SET company_id = 1 
WHERE company_id IS NULL;

-- ✅ Vincular usuário 1 à empresa 1 (se ainda não estiver)
INSERT INTO user_companies (user_id, company_id, is_default)
VALUES (1, 1, true)
ON CONFLICT (user_id, company_id) DO NOTHING;

-- ✅ Definir empresa 1 como selecionada para usuário 1
UPDATE users 
SET selected_company_id = 1 
WHERE id = 1;
*/

-- ================================================================================================
-- FIM DO SCRIPT DE VERIFICAÇÃO
-- ================================================================================================

