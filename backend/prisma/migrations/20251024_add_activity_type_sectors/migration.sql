-- AddActivityTypeSectors
-- Cria relação muitos-para-muitos entre ActivityType e Sector

CREATE TABLE "activity_type_sectors" (
  "id" SERIAL PRIMARY KEY,
  "activityTypeId" INTEGER NOT NULL,
  "sectorId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "activity_type_sectors_activityTypeId_fkey" FOREIGN KEY ("activityTypeId") REFERENCES "activity_types"("id") ON DELETE CASCADE,
  CONSTRAINT "activity_type_sectors_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "sectors"("id") ON DELETE CASCADE,
  CONSTRAINT "activity_type_sectors_activityTypeId_sectorId_key" UNIQUE ("activityTypeId", "sectorId")
);

-- Criar índices para performance
CREATE INDEX "activity_type_sectors_activityTypeId_idx" ON "activity_type_sectors"("activityTypeId");
CREATE INDEX "activity_type_sectors_sectorId_idx" ON "activity_type_sectors"("sectorId");

