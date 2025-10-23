-- Migration: Prevenção de Apontamentos Duplicados
-- Adiciona índices compostos para melhorar detecção de duplicatas

-- Índice composto para apontamentos automáticos (CLP)
-- Previne duplicatas baseadas em: ordem + timestamp próximo + contador CLP
CREATE INDEX IF NOT EXISTS "idx_appointment_dedup_auto" 
ON "production_appointments" ("productionOrderId", "automatic", "timestamp", "clpCounterValue")
WHERE "automatic" = true AND "clpCounterValue" IS NOT NULL;

-- Índice para busca rápida de apontamentos recentes da mesma ordem
CREATE INDEX IF NOT EXISTS "idx_appointment_recent" 
ON "production_appointments" ("productionOrderId", "timestamp" DESC, "automatic");

-- Comentário sobre a estratégia de deduplicação
COMMENT ON INDEX "idx_appointment_dedup_auto" IS 
'Índice para detecção rápida de apontamentos automáticos duplicados. Verifica ordem + timestamp + contador CLP';

COMMENT ON INDEX "idx_appointment_recent" IS 
'Índice para busca eficiente de apontamentos recentes da mesma ordem durante verificação de duplicatas';

