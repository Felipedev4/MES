-- Adicionar índices temporais para ProductionDefect
-- Melhora performance de queries de relatórios de defeitos

CREATE INDEX IF NOT EXISTS "production_defects_timestamp_idx" ON "production_defects"("timestamp");
CREATE INDEX IF NOT EXISTS "production_defects_productionOrderId_timestamp_idx" ON "production_defects"("productionOrderId", "timestamp");

