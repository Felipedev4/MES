-- ================================================================================================
-- 🧹 LIMPEZA COMPLETA E DADOS DE TESTE - EMPRESA DE PLÁSTICOS
-- ================================================================================================
-- Data: 23 de Outubro de 2025
-- Descrição: Limpa todas as tabelas e insere dados cadastrais de teste realistas
-- ================================================================================================

BEGIN;

-- ================================================================================================
-- PARTE 1: LIMPEZA COMPLETA DO BANCO DE DADOS
-- ================================================================================================

TRUNCATE TABLE production_appointments CASCADE;
TRUNCATE TABLE production_defects CASCADE;
TRUNCATE TABLE downtimes CASCADE;
TRUNCATE TABLE cycle_changes CASCADE;
TRUNCATE TABLE plc_data CASCADE;
TRUNCATE TABLE production_orders CASCADE;
TRUNCATE TABLE plc_registers CASCADE;
TRUNCATE TABLE plc_configs CASCADE;
TRUNCATE TABLE item_colors CASCADE;
TRUNCATE TABLE items CASCADE;
TRUNCATE TABLE colors CASCADE;
TRUNCATE TABLE molds CASCADE;
TRUNCATE TABLE defects CASCADE;
TRUNCATE TABLE activity_types CASCADE;
TRUNCATE TABLE reference_types CASCADE;
TRUNCATE TABLE sectors CASCADE;
-- Limpar user_companies mas preservar users
DELETE FROM user_companies;
-- Limpar companies
DELETE FROM companies;
TRUNCATE TABLE role_permissions CASCADE;

-- Resetar sequências
ALTER SEQUENCE companies_id_seq RESTART WITH 1;
ALTER SEQUENCE sectors_id_seq RESTART WITH 1;
ALTER SEQUENCE items_id_seq RESTART WITH 1;
ALTER SEQUENCE molds_id_seq RESTART WITH 1;
ALTER SEQUENCE production_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE plc_configs_id_seq RESTART WITH 1;
ALTER SEQUENCE plc_registers_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_types_id_seq RESTART WITH 1;
ALTER SEQUENCE defects_id_seq RESTART WITH 1;
ALTER SEQUENCE colors_id_seq RESTART WITH 1;

SELECT '🧹 Banco de dados limpo com sucesso!' as status;

-- ================================================================================================
-- PARTE 2: DADOS CADASTRAIS DE TESTE
-- ================================================================================================

-- ================================================================================================
-- 1️⃣ EMPRESAS
-- ================================================================================================
INSERT INTO companies (code, name, "tradeName", cnpj, address, phone, email, active, "createdAt", "updatedAt")
VALUES 
  (
    'PLASTICO01',
    'Plásticos Industriais LTDA',
    'Plasti-Indústria',
    '12.345.678/0001-90',
    'Rua da Indústria, 1000 - Distrito Industrial',
    '(11) 3456-7890',
    'contato@plasticoindustrial.com.br',
    true,
    NOW(),
    NOW()
  );

-- Verificar se usuário admin existe, se não, criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@mes.com') THEN
    INSERT INTO users (email, password, name, role, active, "mustChangePassword", "createdAt", "updatedAt")
    VALUES (
      'admin@mes.com',
      '$2b$10$1acq47OA.LEfTsfzCNCCe.4hUHT/ttInxauehvKgMtPoaTKqwQFya',
      'Administrador',
      'ADMIN',
      true,
      false,
      NOW(),
      NOW()
    );
  END IF;
END $$;

-- Vincular usuário admin à empresa
INSERT INTO user_companies ("userId", "companyId", "isDefault", "createdAt", "updatedAt")
SELECT 
  (SELECT id FROM users WHERE email = 'admin@mes.com' LIMIT 1),
  1,
  true,
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'admin@mes.com');

SELECT '✅ Empresa criada: Plásticos Industriais LTDA' as info;

-- ================================================================================================
-- 2️⃣ SETORES
-- ================================================================================================
INSERT INTO sectors ("companyId", code, name, description, active, "createdAt", "updatedAt")
VALUES 
  (1, 'INJ-001', 'Injeção - Linha 1', 'Linha de injeção de peças pequenas e médias', true, NOW(), NOW()),
  (1, 'INJ-002', 'Injeção - Linha 2', 'Linha de injeção de peças grandes', true, NOW(), NOW()),
  (1, 'SOPRO-01', 'Sopro - Linha 1', 'Linha de sopro de embalagens', true, NOW(), NOW());

SELECT '✅ Setores criados: 3 linhas de produção' as info;

-- ================================================================================================
-- 3️⃣ CORES
-- ================================================================================================
INSERT INTO colors (code, name, "hexCode", description, active, "createdAt", "updatedAt")
VALUES
  ('TRANSP', 'Transparente', '#FFFFFF', 'PP/PS transparente cristal', true, NOW(), NOW()),
  ('BRANCO', 'Branco', '#FFFFFF', 'PP branco leitoso', true, NOW(), NOW()),
  ('PRETO', 'Preto', '#000000', 'PP preto', true, NOW(), NOW()),
  ('AZUL', 'Azul', '#0066CC', 'PP azul royal', true, NOW(), NOW()),
  ('VERMELHO', 'Vermelho', '#CC0000', 'PP vermelho', true, NOW(), NOW()),
  ('AMARELO', 'Amarelo', '#FFCC00', 'PP amarelo', true, NOW(), NOW()),
  ('VERDE', 'Verde', '#00CC00', 'PP verde', true, NOW(), NOW());

SELECT '✅ Cores cadastradas: 7 cores padrão' as info;

-- ================================================================================================
-- 4️⃣ TIPOS DE REFERÊNCIA
-- ================================================================================================
INSERT INTO reference_types (code, name, description, active, "createdAt", "updatedAt")
VALUES
  ('EMBALAGEM', 'Embalagens', 'Produtos para embalagem de alimentos', true, NOW(), NOW()),
  ('UTILIDADE', 'Utilidades Domésticas', 'Produtos de uso doméstico', true, NOW(), NOW()),
  ('INDUSTRIAL', 'Uso Industrial', 'Componentes industriais', true, NOW(), NOW()),
  ('DESCARTAVEL', 'Descartáveis', 'Produtos descartáveis', true, NOW(), NOW());

SELECT '✅ Tipos de referência criados: 4 categorias' as info;

-- ================================================================================================
-- 5️⃣ MOLDES
-- ================================================================================================
INSERT INTO molds (code, name, description, cavities, "activeCavities", "cycleTime", "companyId", active, "createdAt", "updatedAt")
VALUES
  -- Linha 1 - Peças pequenas
  ('MOL-101', 'Tampa Rosqueável 38mm', 'Molde 16 cavidades - tampa para garrafa PET', 16, 16, 6.5, 1, true, NOW(), NOW()),
  ('MOL-102', 'Copo 200ml Descartável', 'Molde 32 cavidades - copo transparente', 32, 32, 4.8, 1, true, NOW(), NOW()),
  ('MOL-103', 'Colher Descartável', 'Molde 64 cavidades - colher PP', 64, 64, 3.2, 1, true, NOW(), NOW()),
  ('MOL-104', 'Tampa Pote 500ml', 'Molde 12 cavidades - tampa hermética', 12, 12, 8.5, 1, true, NOW(), NOW()),
  
  -- Linha 2 - Peças grandes
  ('MOL-201', 'Balde 10L', 'Molde 2 cavidades - balde com alça', 2, 2, 38.0, 1, true, NOW(), NOW()),
  ('MOL-202', 'Pote Sorvete 2L', 'Molde 4 cavidades - pote cilíndrico', 4, 4, 22.0, 1, true, NOW(), NOW()),
  ('MOL-203', 'Caixa Organizadora 15L', 'Molde 1 cavidade - caixa com tampa', 1, 1, 55.0, 1, true, NOW(), NOW()),
  ('MOL-204', 'Bacia 8L', 'Molde 2 cavidades - bacia redonda', 2, 2, 32.0, 1, true, NOW(), NOW());

SELECT '✅ Moldes cadastrados: 8 ferramentais' as info;

-- ================================================================================================
-- 6️⃣ ITENS/PRODUTOS
-- ================================================================================================
INSERT INTO items (code, name, description, unit, "referenceTypeId", "companyId", active, "createdAt", "updatedAt")
VALUES
  -- Embalagens
  ('PROD-001', 'Tampa Rosqueável 38mm Branca', 'Tampa plástica PP branca para garrafa PET 38mm', 'pç', 1, 1, true, NOW(), NOW()),
  ('PROD-002', 'Copo 200ml Transparente', 'Copo descartável PS cristal 200ml', 'pç', 4, 1, true, NOW(), NOW()),
  ('PROD-003', 'Tampa Pote 500ml Transparente', 'Tampa hermética PP transparente 500ml', 'pç', 1, 1, true, NOW(), NOW()),
  ('PROD-004', 'Pote Sorvete 2L Branco', 'Pote cilíndrico PP branco 2 litros', 'pç', 1, 1, true, NOW(), NOW()),
  
  -- Descartáveis
  ('PROD-005', 'Colher Descartável Branca', 'Colher descartável PP branca', 'pç', 4, 1, true, NOW(), NOW()),
  
  -- Utilidades Domésticas
  ('PROD-006', 'Balde 10L Azul', 'Balde plástico PP azul 10 litros com alça metálica', 'pç', 2, 1, true, NOW(), NOW()),
  ('PROD-007', 'Caixa Organizadora 15L Transparente', 'Caixa organizadora PP transparente 15L com tampa', 'pç', 2, 1, true, NOW(), NOW()),
  ('PROD-008', 'Bacia 8L Vermelha', 'Bacia redonda PP vermelha 8 litros', 'pç', 2, 1, true, NOW(), NOW());

SELECT '✅ Produtos cadastrados: 8 itens' as info;

-- ================================================================================================
-- 7️⃣ CORES DOS ITENS
-- ================================================================================================
INSERT INTO item_colors ("itemId", "colorId", "createdAt")
VALUES
  -- Tampa 38mm: Branca, Azul, Vermelha
  (1, 2, NOW()), (1, 4, NOW()), (1, 5, NOW()),
  -- Copo 200ml: Transparente
  (2, 1, NOW()),
  -- Tampa 500ml: Transparente, Branca
  (3, 1, NOW()), (3, 2, NOW()),
  -- Pote 2L: Branco, Amarelo
  (4, 2, NOW()), (4, 6, NOW()),
  -- Colher: Branca, Preta
  (5, 2, NOW()), (5, 3, NOW()),
  -- Balde 10L: Azul, Verde, Vermelho
  (6, 4, NOW()), (6, 7, NOW()), (6, 5, NOW()),
  -- Caixa 15L: Transparente
  (7, 1, NOW()),
  -- Bacia 8L: Vermelha, Azul, Verde
  (8, 5, NOW()), (8, 4, NOW()), (8, 7, NOW());

SELECT '✅ Cores dos produtos vinculadas' as info;

-- ================================================================================================
-- 8️⃣ TIPOS DE ATIVIDADE (Paradas)
-- ================================================================================================
INSERT INTO activity_types (code, name, description, type, color, active, "createdAt", "updatedAt")
VALUES
  -- Paradas Produtivas
  ('SETUP', 'Setup de Máquina', 'Preparação e ajuste de máquina/molde para início de produção', 'PRODUCTIVE', '#2196F3', true, NOW(), NOW()),
  ('TROCA_MOLDE', 'Troca de Molde', 'Substituição de ferramental na injetora', 'PRODUCTIVE', '#03A9F4', true, NOW(), NOW()),
  ('AJUSTE_PROCESSO', 'Ajuste de Processo', 'Ajuste de parâmetros (temperatura, pressão, velocidade)', 'PRODUCTIVE', '#FF9800', true, NOW(), NOW()),
  ('TROCA_MATERIA', 'Troca de Matéria-Prima', 'Substituição de resina/pigmento', 'PRODUCTIVE', '#00BCD4', true, NOW(), NOW()),
  
  -- Paradas Planejadas
  ('MANUT_PREV', 'Manutenção Preventiva', 'Manutenção programada de equipamento', 'PLANNED', '#4CAF50', true, NOW(), NOW()),
  ('LIMPEZA_MOLDE', 'Limpeza de Molde', 'Limpeza e lubrificação de ferramental', 'PLANNED', '#8BC34A', true, NOW(), NOW()),
  ('ALMOCO', 'Intervalo Almoço', 'Parada para refeição', 'PLANNED', '#CDDC39', true, NOW(), NOW()),
  ('REUNIAO', 'Reunião/Treinamento', 'Reunião técnica ou treinamento de equipe', 'PLANNED', '#9E9E9E', true, NOW(), NOW()),
  
  -- Paradas Improdutivas
  ('FALTA_MP', 'Falta de Matéria-Prima', 'Falta de resina, pigmento ou aditivo', 'UNPRODUCTIVE', '#F44336', true, NOW(), NOW()),
  ('QUEBRA_EQUIP', 'Quebra de Equipamento', 'Falha em equipamento (injetora, periférico)', 'UNPRODUCTIVE', '#FF5722', true, NOW(), NOW()),
  ('QUEBRA_MOLDE', 'Quebra de Molde', 'Dano em ferramental', 'UNPRODUCTIVE', '#E91E63', true, NOW(), NOW()),
  ('FALTA_ENERGIA', 'Falta de Energia', 'Queda de energia elétrica', 'UNPRODUCTIVE', '#9C27B0', true, NOW(), NOW()),
  ('FALTA_OPERADOR', 'Falta de Operador', 'Ausência de mão de obra', 'UNPRODUCTIVE', '#673AB7', true, NOW(), NOW()),
  ('RETRABALHO', 'Retrabalho', 'Correção de peças defeituosas', 'UNPRODUCTIVE', '#FF6F00', true, NOW(), NOW());

SELECT '✅ Tipos de atividade criados: 14 categorias de paradas' as info;

-- ================================================================================================
-- 9️⃣ DEFEITOS
-- ================================================================================================
INSERT INTO defects (code, name, description, severity, active, "createdAt", "updatedAt")
VALUES
  -- Defeitos Críticos
  ('DEF-001', 'Peça Incompleta', 'Falta de material, peça não formada completamente', 'CRITICAL', true, NOW(), NOW()),
  ('DEF-002', 'Trinca/Rachadura', 'Rachaduras visíveis no produto', 'CRITICAL', true, NOW(), NOW()),
  ('DEF-003', 'Fora de Dimensão', 'Medidas fora da especificação técnica', 'CRITICAL', true, NOW(), NOW()),
  
  -- Defeitos Altos
  ('DEF-004', 'Bolha de Ar', 'Presença de bolhas no produto acabado', 'HIGH', true, NOW(), NOW()),
  ('DEF-005', 'Empenamento', 'Deformação da peça após ejeção', 'HIGH', true, NOW(), NOW()),
  ('DEF-006', 'Queimado', 'Material queimado/carbonizado', 'HIGH', true, NOW(), NOW()),
  
  -- Defeitos Médios
  ('DEF-007', 'Rebarba', 'Excesso de material nas bordas', 'MEDIUM', true, NOW(), NOW()),
  ('DEF-008', 'Mancha/Risco', 'Manchas ou riscos superficiais', 'MEDIUM', true, NOW(), NOW()),
  ('DEF-009', 'Cor Irregular', 'Variação de tonalidade', 'MEDIUM', true, NOW(), NOW()),
  ('DEF-010', 'Marca de Ejetor', 'Marca visível dos pinos ejetores', 'MEDIUM', true, NOW(), NOW()),
  
  -- Defeitos Baixos
  ('DEF-011', 'Porosidade', 'Pequenos poros na superfície', 'LOW', true, NOW(), NOW()),
  ('DEF-012', 'Brilho Irregular', 'Variação de brilho na superfície', 'LOW', true, NOW(), NOW());

SELECT '✅ Defeitos cadastrados: 12 tipos de defeitos' as info;

-- ================================================================================================
-- 🔟 CONFIGURAÇÃO PLC/INJETORAS
-- ================================================================================================
INSERT INTO plc_configs (
  name, host, port, "unitId", timeout, "pollingInterval", "reconnectInterval", 
  time_divisor, "sectorId", active, "createdAt", "updatedAt"
)
VALUES
  -- Injetora 1 - Linha 1
  (
    'Injetora 1 - Haitian MA900',
    '192.168.1.10',
    502,
    1,
    5000,
    1000,
    10000,
    10,
    1,
    true,
    NOW(),
    NOW()
  ),
  -- Injetora 2 - Linha 1
  (
    'Injetora 2 - Haitian MA1200',
    '192.168.1.11',
    502,
    1,
    5000,
    1000,
    10000,
    10,
    1,
    true,
    NOW(),
    NOW()
  ),
  -- Injetora 3 - Linha 2
  (
    'Injetora 3 - Haitian MA3500',
    '192.168.1.20',
    502,
    1,
    5000,
    1000,
    10000,
    10,
    2,
    true,
    NOW(),
    NOW()
  );

SELECT '✅ PLCs configurados: 3 injetoras' as info;

-- ================================================================================================
-- 1️⃣1️⃣ REGISTROS PLC
-- ================================================================================================

-- Injetora 1
INSERT INTO plc_registers ("plcConfigId", "registerName", "registerAddress", description, "dataType", register_purpose, enabled, "createdAt", "updatedAt")
VALUES
  (1, 'D33', 33, 'Tempo de Ciclo (décimos de segundo)', 'INT16', 'CYCLE_TIME', true, NOW(), NOW()),
  (1, 'D40', 40, 'Contador de Peças Produzidas', 'INT16', 'PRODUCTION_COUNTER', true, NOW(), NOW()),
  (1, 'D34', 34, 'Temperatura Zona 1 (°C)', 'INT16', 'TEMPERATURE', true, NOW(), NOW()),
  (1, 'D35', 35, 'Pressão de Injeção (bar)', 'INT16', 'PRESSURE', true, NOW(), NOW()),
  (1, 'D50', 50, 'Status Máquina (0=parada, 1=rodando)', 'INT16', 'OTHER', true, NOW(), NOW());

-- Injetora 2
INSERT INTO plc_registers ("plcConfigId", "registerName", "registerAddress", description, "dataType", register_purpose, enabled, "createdAt", "updatedAt")
VALUES
  (2, 'D33', 33, 'Tempo de Ciclo (décimos de segundo)', 'INT16', 'CYCLE_TIME', true, NOW(), NOW()),
  (2, 'D40', 40, 'Contador de Peças Produzidas', 'INT16', 'PRODUCTION_COUNTER', true, NOW(), NOW()),
  (2, 'D34', 34, 'Temperatura Zona 1 (°C)', 'INT16', 'TEMPERATURE', true, NOW(), NOW()),
  (2, 'D35', 35, 'Pressão de Injeção (bar)', 'INT16', 'PRESSURE', true, NOW(), NOW()),
  (2, 'D50', 50, 'Status Máquina (0=parada, 1=rodando)', 'INT16', 'OTHER', true, NOW(), NOW());

-- Injetora 3
INSERT INTO plc_registers ("plcConfigId", "registerName", "registerAddress", description, "dataType", register_purpose, enabled, "createdAt", "updatedAt")
VALUES
  (3, 'D33', 33, 'Tempo de Ciclo (décimos de segundo)', 'INT16', 'CYCLE_TIME', true, NOW(), NOW()),
  (3, 'D40', 40, 'Contador de Peças Produzidas', 'INT16', 'PRODUCTION_COUNTER', true, NOW(), NOW()),
  (3, 'D34', 34, 'Temperatura Zona 1 (°C)', 'INT16', 'TEMPERATURE', true, NOW(), NOW()),
  (3, 'D35', 35, 'Pressão de Injeção (bar)', 'INT16', 'PRESSURE', true, NOW(), NOW()),
  (3, 'D50', 50, 'Status Máquina (0=parada, 1=rodando)', 'INT16', 'OTHER', true, NOW(), NOW());

SELECT '✅ Registros PLC criados: 15 registros (5 por injetora)' as info;

COMMIT;

-- ================================================================================================
-- ✅ VERIFICAÇÃO FINAL
-- ================================================================================================

SELECT '╔════════════════════════════════════════════════════════════════╗' as resultado
UNION ALL SELECT '║    BANCO LIMPO E DADOS DE TESTE INSERIDOS COM SUCESSO!     ║'
UNION ALL SELECT '╚════════════════════════════════════════════════════════════════╝';

SELECT '📊 RESUMO DOS DADOS CADASTRAIS DE TESTE:' as info;

SELECT 'Empresas' as tipo, COUNT(*) as total FROM companies
UNION ALL SELECT 'Setores', COUNT(*) FROM sectors
UNION ALL SELECT 'Cores', COUNT(*) FROM colors
UNION ALL SELECT 'Tipos de Referência', COUNT(*) FROM reference_types
UNION ALL SELECT 'Moldes', COUNT(*) FROM molds
UNION ALL SELECT 'Produtos', COUNT(*) FROM items
UNION ALL SELECT 'Cores por Produto', COUNT(*) FROM item_colors
UNION ALL SELECT 'Tipos de Atividade', COUNT(*) FROM activity_types
UNION ALL SELECT 'Defeitos', COUNT(*) FROM defects
UNION ALL SELECT 'PLCs/Injetoras', COUNT(*) FROM plc_configs
UNION ALL SELECT 'Registros PLC', COUNT(*) FROM plc_registers;

-- Detalhes
SELECT '=== EMPRESA ===' as info;
SELECT code, name, "tradeName", cnpj FROM companies;

SELECT '=== INJETORAS ===' as info;
SELECT 
  pc.name as injetora,
  s.name as setor,
  pc.host as ip,
  COUNT(pr.id) as registros
FROM plc_configs pc
LEFT JOIN sectors s ON pc."sectorId" = s.id
LEFT JOIN plc_registers pr ON pc.id = pr."plcConfigId"
GROUP BY pc.id, pc.name, s.name, pc.host
ORDER BY pc.id;

SELECT '✅ Banco de dados pronto para uso com dados de teste!' as status;
SELECT '🎯 Próximo passo: Criar ordens de produção conforme necessário' as proxima_acao;

