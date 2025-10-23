-- ====================================================================
-- SCRIPT: Adicionar campo time_divisor na tabela plc_configs
-- Data: 22/10/2025
-- Descrição: Permite configurar o divisor de tempo (D33) por CLP
-- ====================================================================

-- 1. Adicionar coluna time_divisor com valor padrão 10 (décimos de segundo)
ALTER TABLE "public"."plc_configs" 
ADD COLUMN IF NOT EXISTS "time_divisor" INTEGER NOT NULL DEFAULT 10;

-- 2. Comentário explicativo
COMMENT ON COLUMN "public"."plc_configs"."time_divisor" IS 
'Divisor para conversão do tempo coletado (D33): 1=segundos, 10=décimos, 100=centésimos, 1000=milissegundos';

-- 3. Garantir que todos os CLPs existentes tenham o valor padrão
UPDATE "public"."plc_configs" 
SET "time_divisor" = 10 
WHERE "time_divisor" IS NULL;

-- 4. Verificar resultado
SELECT 
    id,
    name,
    host,
    time_divisor,
    CASE time_divisor
        WHEN 1 THEN 'Segundos'
        WHEN 10 THEN 'Décimos de segundo'
        WHEN 100 THEN 'Centésimos de segundo'
        WHEN 1000 THEN 'Milissegundos'
        ELSE 'Desconhecido'
    END as unidade_tempo
FROM "public"."plc_configs"
ORDER BY id;

-- ====================================================================
-- RESULTADO ESPERADO:
-- ✅ Coluna "time_divisor" adicionada
-- ✅ Todos os CLPs com valor padrão 10
-- ✅ Query de verificação mostra os CLPs com suas unidades
-- ====================================================================

