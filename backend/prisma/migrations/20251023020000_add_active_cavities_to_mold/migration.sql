-- AlterTable
ALTER TABLE "molds" ADD COLUMN "activeCavities" INTEGER;

-- Atualizar cavidades ativas para igualar o total de cavidades existentes
UPDATE "molds" SET "activeCavities" = "cavities" WHERE "activeCavities" IS NULL;

