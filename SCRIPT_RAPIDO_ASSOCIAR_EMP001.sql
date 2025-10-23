-- ================================================================================================
-- 🚀 SCRIPT RÁPIDO: Associar Dados à EMP-001
-- ================================================================================================
-- Cole este script completo no PgAdmin, DBeaver, ou psql e execute tudo de uma vez
-- ================================================================================================

-- 1️⃣ Criar empresa EMP-001 (se não existir)
INSERT INTO companies (code, name, active, "createdAt", "updatedAt")
VALUES ('EMP-001', 'Empresa Principal', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- 2️⃣ Criar empresa EMP-002 (se não existir)
INSERT INTO companies (code, name, active, "createdAt", "updatedAt")
VALUES ('EMP-002', 'Empresa Secundária', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- 3️⃣ Associar TODOS os moldes à EMP-001
UPDATE molds 
SET "companyId" = (SELECT id FROM companies WHERE code = 'EMP-001'),
    "updatedAt" = NOW();

-- 4️⃣ Associar TODOS os itens à EMP-001
UPDATE items 
SET "companyId" = (SELECT id FROM companies WHERE code = 'EMP-001'),
    "updatedAt" = NOW();

-- 5️⃣ Associar TODAS as ordens à EMP-001
UPDATE production_orders 
SET "companyId" = (SELECT id FROM companies WHERE code = 'EMP-001'),
    "updatedAt" = NOW();

-- 6️⃣ Associar setores à EMP-001 (se houver sem empresa)
UPDATE sectors 
SET "companyId" = (SELECT id FROM companies WHERE code = 'EMP-001'),
    "updatedAt" = NOW()
WHERE "companyId" IS NULL;

-- 7️⃣ Vincular usuário 1 às duas empresas
-- EMP-001 como padrão
INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
VALUES (1, (SELECT id FROM companies WHERE code = 'EMP-001'), true, NOW(), NOW())
ON CONFLICT ("userId", "companyId") DO UPDATE SET "isDefault" = true, "updatedAt" = NOW();

-- EMP-002 como secundária
INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
VALUES (1, (SELECT id FROM companies WHERE code = 'EMP-002'), false, NOW(), NOW())
ON CONFLICT ("userId", "companyId") DO NOTHING;

-- 8️⃣ Definir EMP-001 como empresa selecionada
UPDATE users 
SET "selectedCompanyId" = (SELECT id FROM companies WHERE code = 'EMP-001')
WHERE id = 1;

-- ================================================================================================
-- ✅ VERIFICAÇÃO - Execute para ver o resultado
-- ================================================================================================

-- Ver empresas criadas
SELECT 'EMPRESAS' as tipo, id, code, name, active FROM companies ORDER BY code;

-- Ver distribuição de dados
SELECT 
    '📊 RESUMO' as info,
    c.code as empresa,
    COUNT(DISTINCT m.id) as moldes,
    COUNT(DISTINCT i.id) as itens,
    COUNT(DISTINCT po.id) as ordens
FROM companies c
LEFT JOIN molds m ON m."companyId" = c.id
LEFT JOIN items i ON i."companyId" = c.id
LEFT JOIN production_orders po ON po."companyId" = c.id
GROUP BY c.code
ORDER BY c.code;

-- Ver vínculos de usuário
SELECT 
    '👤 USUÁRIO 1' as info,
    u.email,
    c.code as empresa_vinculada,
    uc."isDefault" as padrao
FROM user_companies uc
JOIN users u ON uc."userId" = u.id
JOIN companies c ON uc."companyId" = c.id
WHERE u.id = 1
ORDER BY uc."isDefault" DESC;

-- ================================================================================================
-- ✅ CONCLUÍDO!
-- ================================================================================================
-- Agora:
-- 1. Faça logout no sistema
-- 2. Faça login novamente
-- 3. Selecione EMP-001 → verá todos os dados
-- 4. Selecione EMP-002 → NÃO verá nenhum dado (empresa vazia)
-- ================================================================================================

