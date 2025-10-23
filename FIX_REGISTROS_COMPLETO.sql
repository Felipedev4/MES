-- ============================================================
-- CORREÇÃO COMPLETA DOS REGISTROS PLC
-- ============================================================

-- Ver configuração atual
SELECT 
  "registerName", 
  "registerAddress", 
  description, 
  register_purpose,
  enabled
FROM plc_registers
ORDER BY "registerAddress";

-- CORRIGIR D33 (estava como "Contador de produção" mas é TEMPO)
UPDATE plc_registers
SET description = 'Tempo de Ciclo (ms)',
    register_purpose = 'CYCLE_TIME'
WHERE "registerName" = 'D33' OR "registerAddress" = 33;

-- CORRIGIR D40 (estava como "Velocidade" mas deveria ser CONTADOR)
-- ⚠️ AJUSTE CONFORME SUA MÁQUINA!
-- Se D40 for realmente velocidade, deixe como OTHER
-- Se D40 for contador de peças, use PRODUCTION_COUNTER

UPDATE plc_registers
SET description = 'Contador de Peças Produzidas',
    register_purpose = 'PRODUCTION_COUNTER'
WHERE "registerName" = 'D40' AND description LIKE '%produ%';

-- Se D33 for o contador de peças (caso contrário ao esperado)
-- UPDATE plc_registers
-- SET description = 'Contador de Peças Produzidas',
--     register_purpose = 'PRODUCTION_COUNTER'
-- WHERE "registerName" = 'D33';

-- Verificar resultado
SELECT 
  "registerName", 
  "registerAddress", 
  description, 
  register_purpose,
  enabled
FROM plc_registers
ORDER BY "registerAddress";

