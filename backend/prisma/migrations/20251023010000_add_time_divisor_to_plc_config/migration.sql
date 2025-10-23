-- AlterTable: Adiciona coluna time_divisor na tabela plc_configs
-- Permite configurar o divisor de tempo para cada CLP individualmente
ALTER TABLE "public"."plc_configs" ADD COLUMN "time_divisor" INTEGER NOT NULL DEFAULT 10;

-- Comentário da coluna
COMMENT ON COLUMN "public"."plc_configs"."time_divisor" IS 'Divisor para conversão do tempo coletado (D33): 1=segundos, 10=décimos, 100=centésimos, 1000=milissegundos';

