-- ============================================================
-- SCRIPT PARA CORRIGIR REGISTROS PLC - EXECUÇÃO IMEDIATA
-- ============================================================
-- Execute este script no PostgreSQL para corrigir a configuração

-- 1. Adicionar coluna register_purpose (se ainda não existir)
ALTER TABLE plc_registers 
ADD COLUMN IF NOT EXISTS register_purpose VARCHAR(50);

-- 2. Configurar D33 como TEMPO DE CICLO
UPDATE plc_registers
SET 
  register_purpose = 'CYCLE_TIME',
  description = 'Tempo de Ciclo (ms)'
WHERE register_name = 'D33' OR register_address = 33;

-- 3. Configurar D40 como CONTADOR DE PRODUÇÃO
UPDATE plc_registers
SET 
  register_purpose = 'PRODUCTION_COUNTER',
  description = 'Contador de Peças Produzidas'
WHERE register_name = 'D40' OR register_address = 40;

-- 4. Outros registros comuns (ajuste conforme necessário)
UPDATE plc_registers
SET register_purpose = 'TEMPERATURE',
    description = COALESCE(description, 'Temperatura')
WHERE (register_name LIKE 'D4_' OR register_address BETWEEN 41 AND 42)
  AND register_purpose IS NULL;

UPDATE plc_registers
SET register_purpose = 'PRESSURE',
    description = COALESCE(description, 'Pressão')
WHERE (register_name LIKE 'D4_' OR register_address BETWEEN 43 AND 44)
  AND register_purpose IS NULL;

-- 5. Todos os demais como OTHER
UPDATE plc_registers
SET register_purpose = 'OTHER'
WHERE register_purpose IS NULL;

-- ============================================================
-- VERIFICAR RESULTADO
-- ============================================================
SELECT 
  id,
  register_name,
  register_address,
  description,
  register_purpose,
  enabled
FROM plc_registers
ORDER BY register_address;

-- ============================================================
-- RESULTADO ESPERADO:
-- D33 → CYCLE_TIME
-- D40 → PRODUCTION_COUNTER
-- Outros → TEMPERATURE, PRESSURE ou OTHER
-- ============================================================

