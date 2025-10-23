-- ============================================
-- PRE-CADASTRO DE SETORES - FABRICA DE PLASTICO
-- ============================================
-- Script para inserir setores padrao de uma industria de injecao plastica
-- Data: 23/10/2024
-- ============================================

-- Nota: Ajuste o companyId conforme necessario
-- Verifique o ID da sua empresa executando: SELECT id, name FROM companies;

DO $$
DECLARE
    v_company_id INTEGER := 1; -- AJUSTE ESTE ID PARA SUA EMPRESA
BEGIN
    -- Verificar se a empresa existe
    IF NOT EXISTS (SELECT 1 FROM companies WHERE id = v_company_id) THEN
        RAISE EXCEPTION 'Empresa com ID % nao encontrada. Ajuste o v_company_id.', v_company_id;
    END IF;

    -- 1. INJECAO / PRODUCAO
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'INJ',
        'Injecao',
        'Setor de producao - Injetoras e processos de transformacao de plastico',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 2. QUALIDADE / INSPECAO
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'QLD',
        'Qualidade',
        'Controle de qualidade e inspecao de produtos - Analise dimensional e visual',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 3. MANUTENCAO
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'MNT',
        'Manutencao',
        'Manutencao preventiva e corretiva de maquinas injetoras e equipamentos',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 4. FERRAMENTARIA
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'FER',
        'Ferramentaria',
        'Manutencao, reparo e ajustes de moldes de injecao',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 5. ALMOXARIFADO
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'ALM',
        'Almoxarifado',
        'Controle de materia-prima, insumos e produtos acabados',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 6. EXPEDICAO / LOGISTICA
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'EXP',
        'Expedicao',
        'Separacao, embalagem e envio de produtos acabados',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 7. PREPARACAO DE MATERIA-PRIMA
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'PMP',
        'Preparacao MP',
        'Secagem, mistura e preparacao de resinas e aditivos',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 8. RECICLAGEM / REPROCESSAMENTO
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'REC',
        'Reciclagem',
        'Moagem e reprocessamento de rebarbas e refugos',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 9. ENGENHARIA DE PROCESSOS
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'ENG',
        'Engenharia',
        'Desenvolvimento e otimizacao de processos produtivos',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 10. SETUP / PREPARACAO
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'SET',
        'Setup',
        'Preparacao e setup de maquinas para inicio de producao',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 11. UTILIDADES / FACILITIES
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'UTI',
        'Utilidades',
        'Gestao de agua gelada, ar comprimido, energia e climatizacao',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    -- 12. PCP (Planejamento e Controle da Producao)
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES (
        v_company_id,
        'PCP',
        'PCP',
        'Planejamento, programacao e controle da producao',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (code) DO NOTHING;

    RAISE NOTICE 'Setores padrao cadastrados com sucesso para empresa ID: %', v_company_id;
END $$;

-- ============================================
-- VERIFICAR SETORES CADASTRADOS
-- ============================================
SELECT 
    s.id,
    s.code,
    s.name,
    s.description,
    c.name as empresa,
    s.active,
    s."createdAt"
FROM sectors s
JOIN companies c ON s."companyId" = c.id
ORDER BY s.code;

-- ============================================
-- ESTATISTICAS
-- ============================================
SELECT 
    c.name as empresa,
    COUNT(s.id) as total_setores,
    COUNT(CASE WHEN s.active THEN 1 END) as ativos,
    COUNT(CASE WHEN NOT s.active THEN 1 END) as inativos
FROM companies c
LEFT JOIN sectors s ON c.id = s."companyId"
GROUP BY c.id, c.name
ORDER BY c.name;
