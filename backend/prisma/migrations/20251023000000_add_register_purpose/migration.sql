-- AlterTable: Adicionar campo registerPurpose para identificar tipo/propósito do registro
ALTER TABLE "plc_registers" ADD COLUMN "register_purpose" VARCHAR(50);

-- Definir valores padrão para registros existentes
UPDATE "plc_registers"
SET "register_purpose" = CASE
    WHEN LOWER("description") LIKE '%tempo%' OR LOWER("description") LIKE '%ciclo%' THEN 'CYCLE_TIME'
    WHEN LOWER("description") LIKE '%contador%' OR LOWER("description") LIKE '%peça%' OR LOWER("description") LIKE '%produ%' THEN 'PRODUCTION_COUNTER'
    WHEN LOWER("description") LIKE '%temperatura%' THEN 'TEMPERATURE'
    WHEN LOWER("description") LIKE '%pressão%' OR LOWER("description") LIKE '%pressao%' THEN 'PRESSURE'
    ELSE 'OTHER'
END
WHERE "register_purpose" IS NULL;

-- Comentário explicativo
COMMENT ON COLUMN "plc_registers"."register_purpose" IS 'Propósito do registro: PRODUCTION_COUNTER (contador de peças), CYCLE_TIME (tempo de ciclo), TEMPERATURE, PRESSURE, OTHER';

