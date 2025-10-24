-- Adicionar campo shiftId à tabela users para vincular colaboradores a turnos
ALTER TABLE "users" ADD COLUMN "shiftId" INTEGER;

-- Adicionar índice para melhor performance em queries
CREATE INDEX "users_shiftId_idx" ON "users"("shiftId");

-- Adicionar foreign key para garantir integridade referencial
ALTER TABLE "users" ADD CONSTRAINT "users_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

