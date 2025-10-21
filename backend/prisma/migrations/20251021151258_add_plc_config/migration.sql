-- CreateTable
CREATE TABLE "plc_configs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 502,
    "unitId" INTEGER NOT NULL DEFAULT 1,
    "timeout" INTEGER NOT NULL DEFAULT 5000,
    "pollingInterval" INTEGER NOT NULL DEFAULT 1000,
    "reconnectInterval" INTEGER NOT NULL DEFAULT 10000,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plc_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plc_registers" (
    "id" SERIAL NOT NULL,
    "plcConfigId" INTEGER NOT NULL,
    "registerName" TEXT NOT NULL,
    "registerAddress" INTEGER NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL DEFAULT 'INT16',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plc_registers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plc_registers" ADD CONSTRAINT "plc_registers_plcConfigId_fkey" FOREIGN KEY ("plcConfigId") REFERENCES "plc_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
