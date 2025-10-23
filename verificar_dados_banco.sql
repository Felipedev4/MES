-- Verificar estado atual do banco de dados MES
-- Data: 23 de Outubro de 2025

-- EMPRESAS
SELECT 'EMPRESAS' as tabela, COUNT(*) as total FROM companies;
SELECT * FROM companies ORDER BY id;

-- USUÁRIOS
SELECT 'USUÁRIOS' as tabela, COUNT(*) as total FROM users;
SELECT id, email, name, role, active FROM users ORDER BY id;

-- CONFIGURAÇÕES DE PLC
SELECT 'CONFIGURAÇÕES PLC' as tabela, COUNT(*) as total FROM plc_configs;
SELECT * FROM plc_configs ORDER BY id;

-- REGISTROS PLC
SELECT 'REGISTROS PLC' as tabela, COUNT(*) as total FROM plc_registers;
SELECT * FROM plc_registers ORDER BY id LIMIT 10;

-- DADOS PLC (últimos registros)
SELECT 'DADOS PLC' as tabela, COUNT(*) as total FROM plc_data;
SELECT * FROM plc_data ORDER BY timestamp DESC LIMIT 10;

-- ORDENS DE PRODUÇÃO
SELECT 'ORDENS PRODUÇÃO' as tabela, COUNT(*) as total FROM production_orders;
SELECT * FROM production_orders ORDER BY id;

-- APONTAMENTOS DE PRODUÇÃO
SELECT 'APONTAMENTOS' as tabela, COUNT(*) as total FROM production_appointments;
SELECT * FROM production_appointments ORDER BY timestamp DESC LIMIT 10;

-- MOLDES
SELECT 'MOLDES' as tabela, COUNT(*) as total FROM molds;
SELECT * FROM molds ORDER BY id;

-- ITENS/PRODUTOS
SELECT 'ITENS' as tabela, COUNT(*) as total FROM items;
SELECT * FROM items ORDER BY id;

-- SETORES
SELECT 'SETORES' as tabela, COUNT(*) as total FROM sectors;
SELECT * FROM sectors ORDER BY id;

-- DOWNTIMES
SELECT 'PARADAS' as tabela, COUNT(*) as total FROM downtimes;
SELECT * FROM downtimes ORDER BY "startTime" DESC LIMIT 10;

-- VÍNCULOS USUÁRIO-EMPRESA
SELECT 'VÍNCULOS USER-COMPANY' as tabela, COUNT(*) as total FROM user_companies;
SELECT * FROM user_companies;

