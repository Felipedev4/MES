-- ================================================================================================
-- 🏢 SCRIPT: Associar Todos os Dados à Empresa EMP-001
-- ================================================================================================
-- Este script associa TODOS os registros existentes à empresa EMP-001
-- Após executar, ao logar com EMP-002, você NÃO verá nenhum dado
-- ================================================================================================

-- ================================================================================================
-- PASSO 1: VERIFICAR EMPRESAS EXISTENTES
-- ================================================================================================
SELECT 
    '📊 EMPRESAS CADASTRADAS' as info,
    id,
    code,
    name,
    active
FROM companies
ORDER BY id;

-- ================================================================================================
-- PASSO 2: CRIAR EMPRESA EMP-001 (SE NÃO EXISTIR)
-- ================================================================================================
INSERT INTO companies (code, name, active, created_at, updated_at)
VALUES ('EMP-001', 'Empresa Principal', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Verificar ID da empresa EMP-001
SELECT 
    '🔍 EMPRESA EMP-001' as info,
    id,
    code,
    name
FROM companies 
WHERE code = 'EMP-001';

-- ================================================================================================
-- PASSO 3: ASSOCIAR TODOS OS MOLDES À EMPRESA EMP-001
-- ================================================================================================

-- Ver moldes antes da atualização
SELECT 
    '📋 MOLDES ANTES' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM molds;

-- Atualizar todos os moldes para EMP-001
UPDATE molds 
SET 
    company_id = (SELECT id FROM companies WHERE code = 'EMP-001'),
    updated_at = NOW()
WHERE company_id IS NULL OR company_id != (SELECT id FROM companies WHERE code = 'EMP-001');

-- Ver moldes depois da atualização
SELECT 
    '✅ MOLDES DEPOIS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM molds;

-- ================================================================================================
-- PASSO 4: ASSOCIAR TODOS OS ITENS À EMPRESA EMP-001
-- ================================================================================================

-- Ver itens antes da atualização
SELECT 
    '📋 ITENS ANTES' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM items;

-- Atualizar todos os itens para EMP-001
UPDATE items 
SET 
    company_id = (SELECT id FROM companies WHERE code = 'EMP-001'),
    updated_at = NOW()
WHERE company_id IS NULL OR company_id != (SELECT id FROM companies WHERE code = 'EMP-001');

-- Ver itens depois da atualização
SELECT 
    '✅ ITENS DEPOIS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM items;

-- ================================================================================================
-- PASSO 5: ASSOCIAR TODAS AS ORDENS À EMPRESA EMP-001
-- ================================================================================================

-- Ver ordens antes da atualização
SELECT 
    '📋 ORDENS ANTES' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM production_orders;

-- Atualizar todas as ordens para EMP-001
UPDATE production_orders 
SET 
    company_id = (SELECT id FROM companies WHERE code = 'EMP-001'),
    updated_at = NOW()
WHERE company_id IS NULL OR company_id != (SELECT id FROM companies WHERE code = 'EMP-001');

-- Ver ordens depois da atualização
SELECT 
    '✅ ORDENS DEPOIS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM production_orders;

-- ================================================================================================
-- PASSO 6: ASSOCIAR SETORES À EMPRESA EMP-001
-- ================================================================================================

-- Ver setores antes
SELECT 
    '📋 SETORES ANTES' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM sectors;

-- Atualizar setores
UPDATE sectors 
SET 
    company_id = (SELECT id FROM companies WHERE code = 'EMP-001'),
    updated_at = NOW()
WHERE company_id IS NULL OR company_id != (SELECT id FROM companies WHERE code = 'EMP-001');

-- Nota: Setores sempre devem ter company_id (obrigatório no schema)
-- Se houver erro, pode ser porque já estão associados

-- Ver setores depois
SELECT 
    '✅ SETORES DEPOIS' as info,
    COUNT(*) as total,
    COUNT(CASE WHEN company_id IS NULL THEN 1 END) as sem_empresa,
    COUNT(CASE WHEN company_id IS NOT NULL THEN 1 END) as com_empresa
FROM sectors;

-- ================================================================================================
-- PASSO 7: CRIAR EMPRESA EMP-002 (VAZIA)
-- ================================================================================================

INSERT INTO companies (code, name, active, created_at, updated_at)
VALUES ('EMP-002', 'Empresa Secundária', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

SELECT 
    '✅ EMPRESA EMP-002 CRIADA' as info,
    id,
    code,
    name
FROM companies 
WHERE code = 'EMP-002';

-- ================================================================================================
-- PASSO 8: VINCULAR USUÁRIOS ÀS EMPRESAS
-- ================================================================================================

-- Verificar usuários existentes
SELECT 
    '👥 USUÁRIOS' as info,
    id,
    email,
    name,
    role
FROM users
ORDER BY id;

-- Vincular usuário 1 à EMP-001 (empresa padrão)
INSERT INTO user_companies (user_id, company_id, is_default, created_at, updated_at)
VALUES (
    1, 
    (SELECT id FROM companies WHERE code = 'EMP-001'),
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id, company_id) DO UPDATE
SET is_default = true, updated_at = NOW();

-- Vincular usuário 1 também à EMP-002 (para testes)
INSERT INTO user_companies (user_id, company_id, is_default, created_at, updated_at)
VALUES (
    1, 
    (SELECT id FROM companies WHERE code = 'EMP-002'),
    false,
    NOW(),
    NOW()
)
ON CONFLICT (user_id, company_id) DO NOTHING;

-- Definir EMP-001 como empresa selecionada
UPDATE users 
SET selected_company_id = (SELECT id FROM companies WHERE code = 'EMP-001')
WHERE id = 1;

-- Ver vínculos criados
SELECT 
    '🔗 VÍNCULOS CRIADOS' as info,
    u.id as user_id,
    u.email,
    c.code as company_code,
    c.name as company_name,
    uc.is_default
FROM user_companies uc
JOIN users u ON uc.user_id = u.id
JOIN companies c ON uc.company_id = c.id
ORDER BY u.id, uc.is_default DESC;

-- ================================================================================================
-- PASSO 9: VERIFICAÇÃO FINAL
-- ================================================================================================

-- Resumo por empresa
SELECT 
    '📊 RESUMO FINAL - DADOS POR EMPRESA' as info,
    c.code as empresa_code,
    c.name as empresa_nome,
    COUNT(DISTINCT m.id) as moldes,
    COUNT(DISTINCT i.id) as itens,
    COUNT(DISTINCT po.id) as ordens,
    COUNT(DISTINCT s.id) as setores
FROM companies c
LEFT JOIN molds m ON m.company_id = c.id
LEFT JOIN items i ON i.company_id = c.id
LEFT JOIN production_orders po ON po.company_id = c.id
LEFT JOIN sectors s ON s.company_id = c.id
GROUP BY c.id, c.code, c.name
ORDER BY c.code;

-- Resultado esperado:
-- EMP-001: Todos os dados (moldes, itens, ordens, setores)
-- EMP-002: 0 dados (empresa vazia)

-- ================================================================================================
-- PASSO 10: TESTE - SIMULAR LOGIN COM CADA EMPRESA
-- ================================================================================================

-- Simulando query como se fosse usuário da EMP-001
SELECT 
    '🔍 TESTE: MOLDES DA EMP-001' as teste,
    COUNT(*) as total
FROM molds 
WHERE company_id = (SELECT id FROM companies WHERE code = 'EMP-001');
-- Deve retornar: todos os moldes

-- Simulando query como se fosse usuário da EMP-002
SELECT 
    '🔍 TESTE: MOLDES DA EMP-002' as teste,
    COUNT(*) as total
FROM molds 
WHERE company_id = (SELECT id FROM companies WHERE code = 'EMP-002');
-- Deve retornar: 0 (nenhum molde)

-- Simulando query de itens EMP-001
SELECT 
    '🔍 TESTE: ITENS DA EMP-001' as teste,
    COUNT(*) as total
FROM items 
WHERE company_id = (SELECT id FROM companies WHERE code = 'EMP-001');

-- Simulando query de itens EMP-002
SELECT 
    '🔍 TESTE: ITENS DA EMP-002' as teste,
    COUNT(*) as total
FROM items 
WHERE company_id = (SELECT id FROM companies WHERE code = 'EMP-002');
-- Deve retornar: 0

-- Simulando query de ordens EMP-001
SELECT 
    '🔍 TESTE: ORDENS DA EMP-001' as teste,
    COUNT(*) as total
FROM production_orders 
WHERE company_id = (SELECT id FROM companies WHERE code = 'EMP-001');

-- Simulando query de ordens EMP-002
SELECT 
    '🔍 TESTE: ORDENS DA EMP-002' as teste,
    COUNT(*) as total
FROM production_orders 
WHERE company_id = (SELECT id FROM companies WHERE code = 'EMP-002');
-- Deve retornar: 0

-- ================================================================================================
-- ✅ SCRIPT CONCLUÍDO
-- ================================================================================================

SELECT 
    '✅ SCRIPT CONCLUÍDO COM SUCESSO!' as status,
    'Todos os dados foram associados à EMP-001' as resultado,
    'EMP-002 está vazia e pronta para novos dados' as proximo_passo;

-- ================================================================================================
-- 🎯 PRÓXIMOS PASSOS
-- ================================================================================================

/*
1. ✅ Execute este script no PostgreSQL
2. 🔄 Faça logout no sistema
3. 🔑 Faça login novamente
4. 🏢 Selecione EMP-001 → Deve ver todos os dados
5. 🏢 Selecione EMP-002 → NÃO deve ver nenhum dado
6. ✅ Teste criar um molde na EMP-002
7. 🔄 Troque para EMP-001 → Não deve ver o molde da EMP-002
8. 🎉 Sistema multi-empresa funcionando!
*/

-- ================================================================================================
-- 📝 NOTAS IMPORTANTES
-- ================================================================================================

/*
APONTAMENTOS e PARADAS são vinculados INDIRETAMENTE via ProductionOrder:
- Ao associar todas as ordens à EMP-001, automaticamente todos os apontamentos
  dessas ordens também ficam vinculados à EMP-001
- Quando logar com EMP-002, não verá apontamentos pois não há ordens da EMP-002

CRIAR DADOS TESTE PARA EMP-002 (opcional):
-- Depois de executar este script, você pode criar dados teste para EMP-002:

INSERT INTO molds (code, name, cavities, company_id, active, created_at, updated_at)
VALUES (
    'M-EMP002-001',
    'Molde Teste EMP-002',
    1,
    (SELECT id FROM companies WHERE code = 'EMP-002'),
    true,
    NOW(),
    NOW()
);
*/

-- ================================================================================================
-- FIM DO SCRIPT
-- ================================================================================================

