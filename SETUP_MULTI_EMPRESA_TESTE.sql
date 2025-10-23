-- ============================================
-- SETUP PARA TESTE DO SISTEMA MULTI-EMPRESA
-- ============================================

-- 1. CRIAR EMPRESAS DE TESTE
-- ============================================

INSERT INTO companies (code, name, "tradeName", cnpj, address, phone, email, active, "createdAt", "updatedAt")
VALUES 
  ('EMP001', 'Fábrica Norte', 'Norte Plásticos Ltda', '12.345.678/0001-90', 'Rua Norte, 100', '(11) 1234-5678', 'contato@norte.com', true, NOW(), NOW()),
  ('EMP002', 'Fábrica Sul', 'Sul Injeções SA', '98.765.432/0001-10', 'Av. Sul, 200', '(21) 9876-5432', 'contato@sul.com', true, NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- Resetar sequência se necessário
SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies));

-- ============================================
-- 2. VINCULAR USUÁRIO ADMIN A MÚLTIPLAS EMPRESAS
-- ============================================

-- Buscar ID do usuário admin
DO $$
DECLARE
  admin_user_id INT;
  empresa_norte_id INT;
  empresa_sul_id INT;
BEGIN
  -- Buscar IDs
  SELECT id INTO admin_user_id FROM users WHERE email = 'admin@mes.com' LIMIT 1;
  SELECT id INTO empresa_norte_id FROM companies WHERE code = 'EMP001' LIMIT 1;
  SELECT id INTO empresa_sul_id FROM companies WHERE code = 'EMP002' LIMIT 1;
  
  -- Se usuário admin existe, vincular às empresas
  IF admin_user_id IS NOT NULL AND empresa_norte_id IS NOT NULL AND empresa_sul_id IS NOT NULL THEN
    
    -- Empresa Norte (padrão)
    INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
    VALUES (admin_user_id, empresa_norte_id, true, NOW(), NOW())
    ON CONFLICT ("userId", "companyId") DO NOTHING;
    
    -- Empresa Sul
    INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
    VALUES (admin_user_id, empresa_sul_id, false, NOW(), NOW())
    ON CONFLICT ("userId", "companyId") DO NOTHING;
    
    RAISE NOTICE 'Usuário admin vinculado às empresas com sucesso!';
  ELSE
    RAISE NOTICE 'Usuário admin ou empresas não encontrados!';
  END IF;
END $$;

-- ============================================
-- 3. CRIAR SETORES PARA AS EMPRESAS
-- ============================================

DO $$
DECLARE
  empresa_norte_id INT;
  empresa_sul_id INT;
BEGIN
  SELECT id INTO empresa_norte_id FROM companies WHERE code = 'EMP001' LIMIT 1;
  SELECT id INTO empresa_sul_id FROM companies WHERE code = 'EMP002' LIMIT 1;
  
  IF empresa_norte_id IS NOT NULL THEN
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES 
      (empresa_norte_id, 'INJECAO-N', 'Injeção Norte', 'Setor de injeção da fábrica norte', true, NOW(), NOW()),
      (empresa_norte_id, 'MONTAGEM-N', 'Montagem Norte', 'Setor de montagem da fábrica norte', true, NOW(), NOW())
    ON CONFLICT (code) DO NOTHING;
  END IF;
  
  IF empresa_sul_id IS NOT NULL THEN
    INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
    VALUES 
      (empresa_sul_id, 'INJECAO-S', 'Injeção Sul', 'Setor de injeção da fábrica sul', true, NOW(), NOW()),
      (empresa_sul_id, 'MONTAGEM-S', 'Montagem Sul', 'Setor de montagem da fábrica sul', true, NOW(), NOW())
    ON CONFLICT (code) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 4. VERIFICAR SETUP
-- ============================================

-- Ver empresas criadas
SELECT 
  id,
  code,
  name AS "Nome",
  "tradeName" AS "Nome Fantasia",
  cnpj AS "CNPJ",
  active AS "Ativa"
FROM companies
ORDER BY id;

-- Ver vínculos de usuários com empresas
SELECT 
  u.id AS "User ID",
  u.name AS "Usuário",
  u.email AS "Email",
  c.id AS "Company ID",
  c.code AS "Código Empresa",
  c.name AS "Nome Empresa",
  uc."isDefault" AS "Padrão"
FROM user_companies uc
JOIN users u ON uc."userId" = u.id
JOIN companies c ON uc."companyId" = c.id
ORDER BY u.id, uc."isDefault" DESC;

-- Ver setores por empresa
SELECT 
  s.id,
  c.code AS "Código Empresa",
  c.name AS "Nome Empresa",
  s.code AS "Código Setor",
  s.name AS "Nome Setor"
FROM sectors s
JOIN companies c ON s."companyId" = c.id
ORDER BY c.id, s.id;

-- ============================================
-- 5. MIGRAR DADOS EXISTENTES (OPCIONAL)
-- ============================================

-- Se você tem ordens de produção sem companyId,
-- pode associá-las a uma empresa padrão:

/*
UPDATE production_orders 
SET "companyId" = (SELECT id FROM companies WHERE code = 'EMP001' LIMIT 1)
WHERE "companyId" IS NULL;
*/

-- ============================================
-- 6. CRIAR USUÁRIO DE TESTE PARA CADA EMPRESA
-- ============================================

-- Usuário apenas da Empresa Norte
DO $$
DECLARE
  user_norte_id INT;
  empresa_norte_id INT;
BEGIN
  -- Criar usuário
  INSERT INTO users (email, password, name, role, active, "mustChangePassword", "createdAt", "updatedAt")
  VALUES ('operador.norte@mes.com', '$2b$10$YourHashedPasswordHere', 'Operador Norte', 'OPERATOR', true, false, NOW(), NOW())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user_norte_id;
  
  -- Se não criou (já existe), buscar ID
  IF user_norte_id IS NULL THEN
    SELECT id INTO user_norte_id FROM users WHERE email = 'operador.norte@mes.com';
  END IF;
  
  -- Buscar empresa
  SELECT id INTO empresa_norte_id FROM companies WHERE code = 'EMP001' LIMIT 1;
  
  -- Vincular
  IF user_norte_id IS NOT NULL AND empresa_norte_id IS NOT NULL THEN
    INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
    VALUES (user_norte_id, empresa_norte_id, true, NOW(), NOW())
    ON CONFLICT ("userId", "companyId") DO NOTHING;
  END IF;
END $$;

-- Usuário apenas da Empresa Sul
DO $$
DECLARE
  user_sul_id INT;
  empresa_sul_id INT;
BEGIN
  -- Criar usuário
  INSERT INTO users (email, password, name, role, active, "mustChangePassword", "createdAt", "updatedAt")
  VALUES ('operador.sul@mes.com', '$2b$10$YourHashedPasswordHere', 'Operador Sul', 'OPERATOR', true, false, NOW(), NOW())
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO user_sul_id;
  
  -- Se não criou (já existe), buscar ID
  IF user_sul_id IS NULL THEN
    SELECT id INTO user_sul_id FROM users WHERE email = 'operador.sul@mes.com';
  END IF;
  
  -- Buscar empresa
  SELECT id INTO empresa_sul_id FROM companies WHERE code = 'EMP002' LIMIT 1;
  
  -- Vincular
  IF user_sul_id IS NOT NULL AND empresa_sul_id IS NOT NULL THEN
    INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
    VALUES (user_sul_id, empresa_sul_id, true, NOW(), NOW())
    ON CONFLICT ("userId", "companyId") DO NOTHING;
  END IF;
END $$;

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================

-- Resumo:
SELECT '✅ Setup multi-empresa completo!' AS "Status";

SELECT 
  'Empresas criadas: ' || COUNT(*) AS "Resumo"
FROM companies WHERE active = true;

SELECT 
  'Vínculos de usuários: ' || COUNT(*) AS "Resumo"
FROM user_companies;

SELECT 
  'Setores criados: ' || COUNT(*) AS "Resumo"
FROM sectors WHERE active = true;

-- ============================================
-- 📝 CREDENCIAIS PARA TESTE
-- ============================================

/*
Admin (2 empresas):
  Email: admin@mes.com
  Senha: admin123
  Empresas: Norte e Sul

Operador Norte (1 empresa):
  Email: operador.norte@mes.com
  Senha: (definir no backend com hash)
  Empresa: Norte

Operador Sul (1 empresa):
  Email: operador.sul@mes.com
  Senha: (definir no backend com hash)
  Empresa: Sul
*/

