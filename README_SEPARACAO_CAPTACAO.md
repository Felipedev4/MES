# Sistema MES - Separação da Captação de Dados do CLP

## 📖 Visão Geral

Este documento descreve a implementação completa da separação da captação de dados do CLP do backend normal, conforme solicitado. A solução implementa:

✅ **Data Collector Service separado** rodando no Raspberry Pi 5  
✅ **Acesso a IPs cadastrados no banco de dados**  
✅ **Inserção automática de registros na tabela plc_data**  
✅ **Verificação de status de ordem de produção**  
✅ **Envio de apontamentos quando ordem estiver ativa**  
✅ **Cadastros de empresa, tipo de atividades, defeitos, tipos de referência e setor**  
✅ **Consumo de informações de IP e porta do banco de dados**  

---

## 🏗️ Arquitetura Implementada

### Componentes Principais

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Frontend (React - Browser)                         │
│  Dashboard | Produção | Cadastros | Empresas | Setores | ...         │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ REST API + WebSocket
┌──────────────────────┼───────────────────────────────────────────────┐
│               Backend API (Servidor Principal)                        │
│  Auth | CRUD | Dashboard | Configurações                             │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ PostgreSQL
                 ┌─────┴─────┐
                 │PostgreSQL │
                 │ Database  │
                 └─────┬─────┘
                       │
┌──────────────────────┼───────────────────────────────────────────────┐
│        Data Collector Service (Raspberry Pi 5)                        │
│  PlcPoolManager | PlcConnection | ProductionMonitor                  │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ Modbus TCP
              ┌────────┴────────┐
          ┌───┴───┐         ┌───┴───┐
          │ CLP 1 │         │ CLP 2 │
          └───────┘         └───────┘
```

### Separação de Responsabilidades

| Componente | Responsabilidade | Localização |
|------------|------------------|-------------|
| **Frontend** | Interface do usuário, cadastros | Servidor Web |
| **Backend API** | CRUD, autenticação, regras de negócio | Servidor Principal |
| **Data Collector** | Comunicação com CLPs, polling, apontamentos | Raspberry Pi 5 |
| **Database** | Armazenamento centralizado | Servidor DB |

---

## 📋 Respostas às Questões Solicitadas

### 1. Como a aplicação acessa IPs cadastrados e insere em plc_data?

**Armazenamento de IPs:**
```sql
-- Tabela plc_configs (criada)
CREATE TABLE plc_configs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    host VARCHAR(50),        -- IP do CLP
    port INTEGER DEFAULT 502, -- Porta Modbus
    unit_id INTEGER,
    polling_interval INTEGER,
    sector_id INTEGER,
    active BOOLEAN
);

-- Tabela plc_registers (criada)
CREATE TABLE plc_registers (
    id SERIAL PRIMARY KEY,
    plc_config_id INTEGER,
    register_name VARCHAR(50),     -- Ex: D33
    register_address INTEGER,      -- Ex: 33
    enabled BOOLEAN
);
```

**Acesso e Inserção:**
```typescript
// PlcPoolManager.ts
// 1. Carrega configurações ativas do banco
const configs = await prisma.plcConfig.findMany({
  where: { active: true },
  include: { registers: { where: { enabled: true } } }
});

// 2. Para cada configuração, cria conexão Modbus
configs.forEach(config => {
  const connection = new PlcConnection({
    host: config.host,    // IP do banco
    port: config.port,    // Porta do banco
    registers: config.registers
  });
  connection.connect();
});

// 3. Faz polling e insere em plc_data
await prisma.plcData.create({
  data: {
    plcRegisterId: register.id,
    registerAddress: register.registerAddress,
    registerName: register.registerName,
    value: value,
    connected: true,
    timestamp: new Date()
  }
});
```

### 2. Como verifica status da ordem e envia apontamentos?

**Verificação de Status:**
```typescript
// ProductionMonitor.ts
const activeOrders = await prisma.productionOrder.findMany({
  where: {
    status: 'IN_PROGRESS',  // Apenas ordens ativas
    sectorId: sectorId      // Do mesmo setor do CLP
  }
});
```

**Envio de Apontamentos:**
```typescript
// Quando há mudança no registro E há ordem ativa
if (increment > 0 && activeOrders.length > 0) {
  // Cria apontamento automático
  await prisma.productionAppointment.create({
    data: {
      productionOrderId: order.id,
      userId: systemUser.id,
      quantity: increment,
      automatic: true,
      clpCounterValue: newValue
    }
  });

  // Atualiza quantidade produzida
  await prisma.productionOrder.update({
    where: { id: order.id },
    data: {
      producedQuantity: { increment: increment },
      // Se atingiu meta, marca como COMPLETED
      ...(newQuantity >= order.plannedQuantity && {
        status: 'COMPLETED',
        endDate: new Date()
      })
    }
  });
}
```

### 3. Cadastros Criados

#### a) Empresa (Company)
```typescript
interface Company {
  code: string;        // Código único
  name: string;        // Razão social
  tradeName?: string;  // Nome fantasia
  cnpj?: string;       // CNPJ
  address?: string;    // Endereço
  phone?: string;      // Telefone
  email?: string;      // Email
  active: boolean;     // Status
}
```

**API Endpoints:**
- `GET /api/companies` - Listar
- `GET /api/companies/:id` - Buscar
- `POST /api/companies` - Criar
- `PUT /api/companies/:id` - Atualizar
- `DELETE /api/companies/:id` - Deletar

**Frontend:** Página completa em `/companies`

#### b) Setor (Sector)
```typescript
interface Sector {
  companyId: number;   // Empresa proprietária
  code: string;        // Código único
  name: string;        // Nome
  description?: string;
  active: boolean;
}
```

**Relacionamentos:**
- 1 Empresa : N Setores
- 1 Setor : N CLPs
- 1 Setor : N Ordens de Produção

**API Endpoints:** `/api/sectors/*`

#### c) Tipo de Atividade (ActivityType)
```typescript
interface ActivityType {
  code: string;
  name: string;
  description?: string;
  color?: string;      // Código hex para UI
  active: boolean;
}
```

**Uso:** Classificar paradas (downtimes)

**Exemplos:**
- Setup de Máquina (#3498db)
- Troca de Molde (#e74c3c)
- Manutenção Preventiva (#2ecc71)

**API Endpoints:** `/api/activity-types/*`

#### d) Defeito (Defect)
```typescript
interface Defect {
  code: string;
  name: string;
  description?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  active: boolean;
}
```

**Uso:** Registrar defeitos de produção

**API Endpoints:** `/api/defects/*`

#### e) Tipo de Referência (ReferenceType)
```typescript
interface ReferenceType {
  code: string;
  name: string;
  description?: string;
  active: boolean;
}
```

**Uso:** Classificar itens (matéria-prima, produto acabado, etc)

**API Endpoints:** `/api/reference-types/*`

### 4. Armazenamento e Consumo de IP e Porta

**Armazenamento:**
```sql
-- Exemplo de inserção
INSERT INTO plc_configs (name, host, port, unit_id, sector_id, active)
VALUES ('CLP Linha 1', '192.168.1.10', 502, 1, 1, true);

INSERT INTO plc_registers (plc_config_id, register_name, register_address, enabled)
VALUES (1, 'D33', 33, true);
```

**Consumo pelo Data Collector:**
```typescript
// 1. Inicialização
const configs = await loadConfigurations();

// 2. Criação de conexões
configs.forEach(config => {
  createConnection(config.host, config.port);
});

// 3. Atualização dinâmica (a cada 30s)
setInterval(async () => {
  const latestUpdate = await checkForUpdates();
  if (hasChanges) {
    reloadConfigurations();
  }
}, 30000);
```

**Consumo pelo Backend (para testes):**
```typescript
// POST /api/plc-config/test
await modbusService.testConnection({
  host: config.host,
  port: config.port,
  unitId: config.unitId,
  timeout: 5000
});
```

### 5. Implementação da Captação de Dados

#### Componentes do Data Collector

**PlcConnection.ts** - Conexão individual com CLP
```typescript
class PlcConnection {
  - socket: net.Socket
  - client: ModbusClient
  - registerValues: Map<address, value>
  
  + connect(): Promise<void>
  + readRegister(address): Promise<number>
  + pollAllRegisters(): Promise<void>
  + handleDisconnect(): void
  + scheduleReconnect(): void
}
```

**PlcPoolManager.ts** - Gerencia múltiplos CLPs
```typescript
class PlcPoolManager {
  - connections: Map<id, PlcConnection>
  
  + initialize(): Promise<void>
  + loadConfigurations(): Promise<void>
  + reloadConfigurations(): Promise<void>
  + getStatus(): PoolStatus
}
```

**ProductionMonitor.ts** - Monitor de produção
```typescript
class ProductionMonitor {
  + handleValueChange(data): Promise<void>
  + getActiveOrders(sectorId): Promise<Order[]>
  + createAppointment(order, data): Promise<void>
}
```

#### Fluxo de Dados

```
1. Data Collector inicia
   ↓
2. Carrega configs do banco (IPs + Portas + Registros)
   ↓
3. Conecta aos CLPs via Modbus TCP
   ↓
4. Polling periódico (padrão: 1000ms)
   ├─ Lê registros habilitados
   ├─ Compara com valor anterior
   └─ Se mudou:
      ├─ Salva em plc_data
      ├─ Verifica ordens IN_PROGRESS
      └─ Se ativa e incremento > 0:
         ├─ Cria ProductionAppointment
         ├─ Atualiza producedQuantity
         └─ Se atingiu meta: status = COMPLETED
```

#### Tratamento de Exceções

**Erro de Conexão:**
```typescript
try {
  await connection.connect();
} catch (error) {
  logger.error('Erro ao conectar', error);
  await saveErrorToDatabase(error);
  scheduleReconnect();
}
```

**Erro de Leitura:**
```typescript
try {
  const value = await readRegister(address);
} catch (error) {
  errorCount++;
  if (errorCount > 5) {
    disconnect();
    reconnect();
  }
}
```

**Erro de Banco:**
```typescript
try {
  await prisma.plcData.create({ ... });
} catch (error) {
  inMemoryBuffer.push(data);
  setTimeout(() => flushBuffer(), 60000);
}
```

### 6. Visão Geral da Arquitetura

#### Estrutura de Arquivos Criados

```
data-collector/                    # ✅ NOVO - Serviço independente
├── src/
│   ├── index.ts                   # Entry point
│   ├── config/database.ts         # Prisma Client
│   ├── services/
│   │   ├── PlcConnection.ts       # Conexão individual
│   │   ├── PlcPoolManager.ts      # Pool de CLPs
│   │   ├── ProductionMonitor.ts   # Monitor de produção
│   │   └── HealthCheck.ts         # Health check
│   └── utils/logger.ts            # Sistema de logs
├── package.json
├── tsconfig.json
├── mes-data-collector.service     # Systemd service
└── README.md

backend/
├── prisma/schema.prisma           # ✅ ATUALIZADO - Novas entidades
├── MIGRATION_SCRIPT.sql           # ✅ NOVO - Script SQL
├── src/
│   ├── server.ts                  # ✅ ATUALIZADO - Novas rotas
│   ├── controllers/               # ✅ 5 NOVOS
│   │   ├── companyController.ts
│   │   ├── sectorController.ts
│   │   ├── activityTypeController.ts
│   │   ├── defectController.ts
│   │   └── referenceTypeController.ts
│   ├── routes/                    # ✅ 5 NOVOS
│   │   ├── companyRoutes.ts
│   │   ├── sectorRoutes.ts
│   │   ├── activityTypeRoutes.ts
│   │   ├── defectRoutes.ts
│   │   └── referenceTypeRoutes.ts
│   └── validators/                # ✅ 5 NOVOS
│       ├── companyValidator.ts
│       ├── sectorValidator.ts
│       ├── activityTypeValidator.ts
│       ├── defectValidator.ts
│       └── referenceTypeValidator.ts

frontend/
├── src/
│   ├── App.tsx                    # ✅ ATUALIZADO - Novas rotas
│   ├── components/Layout/
│   │   └── MenuItems.tsx          # ✅ ATUALIZADO - Novos itens
│   └── pages/
│       └── Companies.tsx          # ✅ NOVO - Página de exemplo

ARCHITECTURE_PROPOSAL.md            # ✅ NOVO - Arquitetura detalhada
IMPLEMENTATION_SUMMARY.md           # ✅ NOVO - Resumo implementação
DEPLOYMENT_GUIDE.md                 # ✅ NOVO - Guia de deploy
README_SEPARACAO_CAPTACAO.md        # ✅ NOVO - Este arquivo
```

#### Banco de Dados - Novas Entidades

```
companies (empresas)
├── id, code, name, tradeName, cnpj
├── address, phone, email, active
└── 1:N sectors, production_orders

sectors (setores)
├── id, company_id, code, name
├── description, active
└── 1:N plc_configs, production_orders

activity_types (tipos de atividade)
├── id, code, name, description
├── color, active
└── 1:N downtimes

defects (defeitos)
├── id, code, name, description
├── severity (LOW|MEDIUM|HIGH|CRITICAL)
├── active
└── 1:N production_defects

reference_types (tipos de referência)
├── id, code, name, description
├── active
└── 1:N items

production_defects (defeitos de produção)
├── id, production_order_id, defect_id
├── quantity, timestamp, notes
└── N:1 production_order, defect
```

---

## 🚀 Como Executar

### 1. Migração do Banco de Dados

```bash
# Opção A: Script SQL
psql -U postgres -d mes_db -f backend/MIGRATION_SCRIPT.sql

# Opção B: Prisma Migrate
cd backend
npx prisma migrate dev --name add_new_entities
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

### 4. Data Collector (Raspberry Pi)

```bash
cd data-collector
npm install
npx prisma generate
npm run build

# Configurar .env
cp .env.example .env
nano .env

# Iniciar
npm start

# OU como serviço
sudo cp mes-data-collector.service /etc/systemd/system/
sudo systemctl enable mes-data-collector
sudo systemctl start mes-data-collector
```

---

## 📊 Exemplos de Uso

### Configurar CLP via API

```javascript
POST /api/plc-config
{
  "name": "CLP Linha 1",
  "host": "192.168.1.10",
  "port": 502,
  "unitId": 1,
  "pollingInterval": 1000,
  "sectorId": 1,
  "active": true,
  "registers": [
    {
      "registerName": "D33",
      "registerAddress": 33,
      "description": "Contador de produção",
      "enabled": true
    }
  ]
}
```

### Criar Empresa

```javascript
POST /api/companies
{
  "code": "EMP001",
  "name": "Minha Empresa LTDA",
  "tradeName": "Minha Empresa",
  "cnpj": "12345678000190",
  "active": true
}
```

### Criar Ordem de Produção Ativa

```javascript
POST /api/production-orders
{
  "orderNumber": "OP-001",
  "itemId": 1,
  "sectorId": 1,
  "plannedQuantity": 1000,
  "status": "IN_PROGRESS",  // Ordem ativa
  "plannedStartDate": "2025-10-21T08:00:00Z",
  "plannedEndDate": "2025-10-21T17:00:00Z"
}
```

**Resultado:**
- CLP incrementa D33 de 0 para 10
- Data Collector detecta mudança
- Cria apontamento automático de 10 peças
- Atualiza producedQuantity da ordem para 10

---

## 🔧 Monitoramento

### Health Checks

```bash
# Backend
curl http://localhost:3001/health

# Data Collector
curl http://raspberry-ip:3001/health
```

### Logs

```bash
# Backend
pm2 logs mes-backend

# Data Collector
sudo journalctl -u mes-data-collector -f
```

---

## 📚 Documentação Completa

1. **[ARCHITECTURE_PROPOSAL.md](ARCHITECTURE_PROPOSAL.md)**
   - Arquitetura detalhada
   - Diagramas de fluxo
   - Especificações técnicas
   - Próximos passos

2. **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**
   - Resumo da implementação
   - Arquivos criados
   - Endpoints da API
   - Checklist de deploy

3. **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**
   - Guia passo a passo de deploy
   - Configuração do Raspberry Pi
   - Troubleshooting
   - Checklist final

4. **[data-collector/README.md](data-collector/README.md)**
   - Documentação específica do Data Collector
   - Instalação e configuração
   - Exemplos de uso

---

## ✅ Funcionalidades Implementadas

- [x] Data Collector Service separado
- [x] Acesso a IPs do banco de dados
- [x] Inserção automática em plc_data
- [x] Verificação de status de ordem
- [x] Apontamentos automáticos
- [x] Cadastro de Empresa
- [x] Cadastro de Setor
- [x] Cadastro de Tipo de Atividade
- [x] Cadastro de Defeito
- [x] Cadastro de Tipo de Referência
- [x] Consumo de IP e porta do banco
- [x] Comunicação Raspberry Pi ↔ Database
- [x] Tratamento de exceções
- [x] Reconexão automática
- [x] Health checks
- [x] Sistema de logs
- [x] Documentação completa

---

## 🎯 Benefícios da Arquitetura

### 1. Separação de Responsabilidades
- Backend focado em API e regras de negócio
- Data Collector focado em comunicação com CLPs
- Manutenção e deploy independentes

### 2. Escalabilidade
- Suporte a múltiplos CLPs sem sobrecarga
- Possibilidade de múltiplos Data Collectors (1 por setor)
- Balanceamento de carga facilitado

### 3. Confiabilidade
- Falha em um CLP não afeta outros
- Reconexão automática
- Buffer de dados em caso de falha

### 4. Flexibilidade
- Configuração dinâmica via banco
- Adição de CLPs sem código
- Suporte a diferentes tipos de registros

### 5. Manutenibilidade
- Código organizado e modular
- Logs centralizados
- Fácil depuração

---

## 👥 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação detalhada
2. Verifique os logs do sistema
3. Use os health checks para diagnóstico
4. Revise o guia de troubleshooting

---

**Desenvolvido em:** 21/10/2025  
**Versão:** 1.0.0  
**Status:** ✅ Implementação Completa


