-- Passo 1: Adicionar novas colunas (permitindo NULL temporariamente)
ALTER TABLE "plc_data" ADD COLUMN "plcRegisterId" INTEGER;
ALTER TABLE "plc_data" ADD COLUMN "registerAddress" INTEGER;
ALTER TABLE "plc_data" ADD COLUMN "registerName" TEXT;
ALTER TABLE "plc_data" ADD COLUMN "value" INTEGER;

-- Passo 2: Migrar dados existentes (registerD33 -> registerAddress=33, value=registerD33)
UPDATE "plc_data" 
SET 
  "registerAddress" = 33,
  "registerName" = 'D33',
  "value" = "registerD33"
WHERE "registerAddress" IS NULL;

-- Passo 3: Tornar colunas NOT NULL (agora que têm dados)
ALTER TABLE "plc_data" ALTER COLUMN "registerAddress" SET NOT NULL;
ALTER TABLE "plc_data" ALTER COLUMN "value" SET NOT NULL;

-- Passo 4: Remover coluna antiga
ALTER TABLE "plc_data" DROP COLUMN "registerD33";

-- Passo 5: Adicionar foreign key (opcional, permite NULL)
ALTER TABLE "plc_data" ADD CONSTRAINT "plc_data_plcRegisterId_fkey" 
  FOREIGN KEY ("plcRegisterId") REFERENCES "plc_registers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Passo 6: Criar índices para performance
CREATE INDEX "plc_data_registerAddress_timestamp_idx" ON "plc_data"("registerAddress", "timestamp");
CREATE INDEX "plc_data_plcRegisterId_timestamp_idx" ON "plc_data"("plcRegisterId", "timestamp");


