/**
 * Script de seed para popular o banco de dados com dados iniciais
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mes.com' },
    update: {},
    create: {
      email: 'admin@mes.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('✅ Usuário administrador criado:', admin.email);

  // Criar usuário operador
  const operatorPassword = await bcrypt.hash('operator123', 10);
  
  const operator = await prisma.user.upsert({
    where: { email: 'operator@mes.com' },
    update: {},
    create: {
      email: 'operator@mes.com',
      password: operatorPassword,
      name: 'Operador',
      role: 'OPERATOR',
      active: true,
    },
  });

  console.log('✅ Usuário operador criado:', operator.email);

  // Criar itens de exemplo
  const item1 = await prisma.item.upsert({
    where: { code: 'ITEM-001' },
    update: {},
    create: {
      code: 'ITEM-001',
      name: 'Tampa Plástica 100mm',
      description: 'Tampa plástica injetada 100mm de diâmetro',
      unit: 'pç',
      active: true,
    },
  });

  const item2 = await prisma.item.upsert({
    where: { code: 'ITEM-002' },
    update: {},
    create: {
      code: 'ITEM-002',
      name: 'Base Redonda 150mm',
      description: 'Base plástica redonda 150mm',
      unit: 'pç',
      active: true,
    },
  });

  console.log('✅ Itens criados:', item1.code, item2.code);

  // Criar moldes de exemplo
  const mold1 = await prisma.mold.upsert({
    where: { code: 'MOLD-001' },
    update: {},
    create: {
      code: 'MOLD-001',
      name: 'Molde Tampa 4 Cavidades',
      description: 'Molde para tampa plástica com 4 cavidades',
      cavities: 4,
      cycleTime: 15.5,
      active: true,
      maintenanceDate: new Date('2025-12-31'),
    },
  });

  const mold2 = await prisma.mold.upsert({
    where: { code: 'MOLD-002' },
    update: {},
    create: {
      code: 'MOLD-002',
      name: 'Molde Base 2 Cavidades',
      description: 'Molde para base plástica com 2 cavidades',
      cavities: 2,
      cycleTime: 20.0,
      active: true,
      maintenanceDate: new Date('2025-11-30'),
    },
  });

  console.log('✅ Moldes criados:', mold1.code, mold2.code);

  // Criar ordem de produção de exemplo
  const order1 = await prisma.productionOrder.upsert({
    where: { orderNumber: 'OP-2025-001' },
    update: {},
    create: {
      orderNumber: 'OP-2025-001',
      itemId: item1.id,
      moldId: mold1.id,
      plannedQuantity: 1000,
      producedQuantity: 0,
      rejectedQuantity: 0,
      status: 'PENDING',
      priority: 1,
      plannedStartDate: new Date(),
      plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
      notes: 'Ordem de produção de exemplo',
    },
  });

  console.log('✅ Ordem de produção criada:', order1.orderNumber);

  // Criar configuração de CLP de exemplo
  // Verificar se já existe uma configuração
  const existingPlcConfig = await prisma.plcConfig.findFirst({
    where: { name: 'CLP Principal - DVP-12SE' },
    include: { registers: true },
  });

  let plcConfig;
  
  if (existingPlcConfig) {
    console.log('✅ Configuração de CLP já existe:', existingPlcConfig.name);
    plcConfig = existingPlcConfig;
  } else {
    plcConfig = await prisma.plcConfig.create({
      data: {
        name: 'CLP Principal - DVP-12SE',
        host: process.env.MODBUS_HOST || '192.168.1.100',
        port: parseInt(process.env.MODBUS_PORT || '502'),
        unitId: parseInt(process.env.MODBUS_UNIT_ID || '1'),
        timeout: 5000,
        pollingInterval: 1000,
        reconnectInterval: 10000,
        active: true,
        registers: {
          create: [
            {
              registerName: 'D33',
              registerAddress: 33,
              description: 'Contador de produção',
              dataType: 'INT16',
              enabled: true,
            },
            {
              registerName: 'D34',
              registerAddress: 34,
              description: 'Contador de rejeitos',
              dataType: 'INT16',
              enabled: false,
            },
            {
              registerName: 'D35',
              registerAddress: 35,
              description: 'Status da máquina',
              dataType: 'INT16',
              enabled: false,
            },
            {
              registerName: 'D40',
              registerAddress: 40,
              description: 'Velocidade da linha',
              dataType: 'INT16',
              enabled: false,
            },
          ],
        },
      },
      include: {
        registers: true,
      },
    });
    
    console.log('✅ Configuração de CLP criada:', plcConfig.name);
  }
  
  console.log(`   Registros: ${plcConfig.registers.length}`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Admin: admin@mes.com / admin123');
  console.log('   Operador: operator@mes.com / operator123\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


