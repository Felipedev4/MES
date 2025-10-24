-- CreateTable
CREATE TABLE "shifts" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- AddColumn
ALTER TABLE "production_appointments" ADD COLUMN "shiftId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "shifts_companyId_code_key" ON "shifts"("companyId", "code");

-- CreateIndex
CREATE INDEX "production_appointments_shiftId_idx" ON "production_appointments"("shiftId");

-- AddForeignKey
ALTER TABLE "production_appointments" ADD CONSTRAINT "production_appointments_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Inserir turnos padrão para todas as empresas existentes
INSERT INTO "shifts" ("companyId", "name", "code", "startTime", "endTime", "description", "active", "createdAt", "updatedAt")
SELECT 
    id,
    '1º Turno',
    'T1',
    '06:00',
    '14:00',
    'Turno Matutino',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "companies"
WHERE "active" = true;

INSERT INTO "shifts" ("companyId", "name", "code", "startTime", "endTime", "description", "active", "createdAt", "updatedAt")
SELECT 
    id,
    '2º Turno',
    'T2',
    '14:00',
    '22:00',
    'Turno Vespertino',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "companies"
WHERE "active" = true;

INSERT INTO "shifts" ("companyId", "name", "code", "startTime", "endTime", "description", "active", "createdAt", "updatedAt")
SELECT 
    id,
    '3º Turno',
    'T3',
    '22:00',
    '06:00',
    'Turno Noturno',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "companies"
WHERE "active" = true;

