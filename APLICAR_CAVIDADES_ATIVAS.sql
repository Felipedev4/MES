-- ============================================
-- ADICIONAR CAMPO CAVIDADES ATIVAS AO MOLDE
-- ============================================
-- Este script adiciona o campo "activeCavities" na tabela de moldes
-- Execute este script no banco de dados PostgreSQL antes de reiniciar os serviços

-- Adicionar coluna activeCavities
ALTER TABLE "molds" ADD COLUMN IF NOT EXISTS "activeCavities" INTEGER;

-- Atualizar moldes existentes para usar o mesmo número de cavidades totais
-- Isso garante que o comportamento atual seja mantido
UPDATE "molds" 
SET "activeCavities" = "cavities" 
WHERE "activeCavities" IS NULL;

-- Verificar os dados atualizados
SELECT 
  id,
  code,
  name,
  cavities AS "Total de Cavidades",
  "activeCavities" AS "Cavidades Ativas"
FROM "molds"
ORDER BY name;

