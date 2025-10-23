-- ================================================================================================
-- 🔧 CORREÇÃO: Vincular Usuário à Empresa Corretamente
-- ================================================================================================
-- PROBLEMA: JWT não tem companyId, queries buscam IS NULL
-- SOLUÇÃO: Garantir que usuário está vinculado e tem empresa selecionada
-- ================================================================================================

-- 1️⃣ Ver situação atual do usuário
SELECT 
    '👤 USUÁRIO ATUAL' as info,
    id,
    email,
    name,
    role,
    "selectedCompanyId"
FROM users 
WHERE id = 1;

-- 2️⃣ Ver empresas cadastradas
SELECT 
    '🏢 EMPRESAS' as info,
    id,
    code,
    name
FROM companies
ORDER BY id;

-- 3️⃣ Ver vínculos do usuário
SELECT 
    '🔗 VÍNCULOS' as info,
    uc.*
FROM user_companies uc
WHERE uc."userId" = 1;

-- ================================================================================================
-- CORREÇÃO: Garantir vínculo correto
-- ================================================================================================

-- 4️⃣ Garantir que usuário 1 está vinculado à empresa 1
INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
VALUES (1, 1, true, NOW(), NOW())
ON CONFLICT ("userId", "companyId") 
DO UPDATE SET "isDefault" = true, "updatedAt" = NOW();

-- 5️⃣ Definir empresa 1 como selecionada para usuário 1
UPDATE users 
SET "selectedCompanyId" = 1,
    "updatedAt" = NOW()
WHERE id = 1;

-- 6️⃣ Se tiver empresa 2, vincular também
INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
VALUES (1, 2, false, NOW(), NOW())
ON CONFLICT ("userId", "companyId") DO NOTHING;

-- ================================================================================================
-- VERIFICAÇÃO
-- ================================================================================================

SELECT 
    '✅ RESULTADO FINAL' as info,
    u.id as user_id,
    u.email,
    u."selectedCompanyId" as empresa_selecionada,
    c.code as empresa_code,
    c.name as empresa_name,
    (SELECT COUNT(*) FROM user_companies WHERE "userId" = u.id) as total_empresas_vinculadas
FROM users u
LEFT JOIN companies c ON u."selectedCompanyId" = c.id
WHERE u.id = 1;

-- Deve mostrar:
-- selectedCompanyId: 1
-- empresa_code: EMP-001
-- total_empresas_vinculadas: 2 (ou 1)

