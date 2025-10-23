-- AlterTable
ALTER TABLE "production_orders" ADD COLUMN "plcConfigId" INTEGER;

-- AddForeignKey
ALTER TABLE "production_orders" ADD CONSTRAINT "production_orders_plcConfigId_fkey" FOREIGN KEY ("plcConfigId") REFERENCES "plc_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

