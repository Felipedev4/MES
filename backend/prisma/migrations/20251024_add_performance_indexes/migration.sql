-- AddPerformanceIndexes: Adiciona índices para otimização de performance

-- Índices para User
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_active_idx" ON "users"("active");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Índices para Item
CREATE INDEX IF NOT EXISTS "items_referenceTypeId_idx" ON "items"("referenceTypeId");
CREATE INDEX IF NOT EXISTS "items_active_idx" ON "items"("active");

-- Índices para Mold
CREATE INDEX IF NOT EXISTS "molds_companyId_idx" ON "molds"("companyId");
CREATE INDEX IF NOT EXISTS "molds_active_idx" ON "molds"("active");

-- Índices para ProductionOrder
CREATE INDEX IF NOT EXISTS "production_orders_companyId_idx" ON "production_orders"("companyId");
CREATE INDEX IF NOT EXISTS "production_orders_itemId_idx" ON "production_orders"("itemId");
CREATE INDEX IF NOT EXISTS "production_orders_moldId_idx" ON "production_orders"("moldId");
CREATE INDEX IF NOT EXISTS "production_orders_plannedStartDate_idx" ON "production_orders"("plannedStartDate");
CREATE INDEX IF NOT EXISTS "production_orders_sectorId_idx" ON "production_orders"("sectorId");

-- Índices para Downtime
CREATE INDEX IF NOT EXISTS "downtimes_activityTypeId_idx" ON "downtimes"("activityTypeId");
CREATE INDEX IF NOT EXISTS "downtimes_defectId_idx" ON "downtimes"("defectId");
CREATE INDEX IF NOT EXISTS "downtimes_responsibleId_idx" ON "downtimes"("responsibleId");
CREATE INDEX IF NOT EXISTS "downtimes_startTime_idx" ON "downtimes"("startTime");
CREATE INDEX IF NOT EXISTS "downtimes_type_idx" ON "downtimes"("type");

-- Índices para DefectSector
CREATE INDEX IF NOT EXISTS "defect_sectors_defectId_idx" ON "defect_sectors"("defectId");
CREATE INDEX IF NOT EXISTS "defect_sectors_sectorId_idx" ON "defect_sectors"("sectorId");

-- Índices para ProductionDefect
CREATE INDEX IF NOT EXISTS "production_defects_defectId_idx" ON "production_defects"("defectId");
CREATE INDEX IF NOT EXISTS "production_defects_productionOrderId_idx" ON "production_defects"("productionOrderId");

-- Índices para CycleChange
CREATE INDEX IF NOT EXISTS "cycle_changes_productionOrderId_idx" ON "cycle_changes"("productionOrderId");
CREATE INDEX IF NOT EXISTS "cycle_changes_timestamp_idx" ON "cycle_changes"("timestamp");
CREATE INDEX IF NOT EXISTS "cycle_changes_userId_idx" ON "cycle_changes"("userId");

-- Índices para PlcRegister
CREATE INDEX IF NOT EXISTS "plc_registers_plcConfigId_idx" ON "plc_registers"("plcConfigId");
CREATE INDEX IF NOT EXISTS "plc_registers_enabled_idx" ON "plc_registers"("enabled");

-- Índices para UserCompany
CREATE INDEX IF NOT EXISTS "user_companies_userId_idx" ON "user_companies"("userId");
CREATE INDEX IF NOT EXISTS "user_companies_companyId_idx" ON "user_companies"("companyId");

