# Sumário da Implementação - Sistema MES com Data Collector Separado

## 📋 Visão Geral

Esta implementação separa a captação de dados do CLP do backend normal, criando um **Data Collector Service** independente que roda no Raspberry Pi 5 e se comunica diretamente com o banco de dados PostgreSQL.

## 🏗️ Arquitetura Implementada

### Componentes Criados

1. **Data Collector Service** (Novo - Raspberry Pi 5)
   - Serviço Node.js independente
   - Gerencia múltiplos CLPs simultaneamente
   - Polling periódico de registros configurados
   - Criação automática de apontamentos
   - Health check endpoint

2. **Backend API** (Modificado - Servidor Principal)
   - Novas entidades: Company, Sector, ActivityType, Defect, ReferenceType
   - Controladores e rotas para CRUD completo
   - Validators com Yup
   - Documentação Swagger

3. **Banco de Dados** (Expandido)
   - 6 novas tabelas
   - Relacionamentos atualizados
   - Índices para performance

## 📂 Arquivos Criados/Modificados

### Data Collector Service (Novo)

```
data-collector/
├── package.json                          # ✅ Criado
├── tsconfig.json                         # ✅ Criado
├── README.md                             # ✅ Criado
├── src/
│   ├── index.ts                          # ✅ Criado - Entry point
│   ├── config/
│   │   └── database.ts                   # ✅ Criado - Configuração Prisma
│   ├── services/
│   │   ├── PlcConnection.ts              # ✅ Criado - Conexão individual
│   │   ├── PlcPoolManager.ts             # ✅ Criado - Pool de CLPs
│   │   ├── ProductionMonitor.ts          # ✅ Criado - Monitor de produção
│   │   └── HealthCheck.ts                # ✅ Criado - Health check
│   └── utils/
│       └── logger.ts                     # ✅ Criado - Sistema de logs
```

### Backend (Modificado/Novo)

```
backend/
├── prisma/
│   └── schema.prisma                     # ✅ Modificado - Novas entidades
├── MIGRATION_SCRIPT.sql                  # ✅ Criado - Script SQL manual
├── src/
│   ├── server.ts                         # ✅ Modificado - Novas rotas
│   ├── controllers/
│   │   ├── companyController.ts          # ✅ Criado
│   │   ├── sectorController.ts           # ✅ Criado
│   │   ├── activityTypeController.ts     # ✅ Criado
│   │   ├── defectController.ts           # ✅ Criado
│   │   └── referenceTypeController.ts    # ✅ Criado
│   ├── routes/
│   │   ├── companyRoutes.ts              # ✅ Criado
│   │   ├── sectorRoutes.ts               # ✅ Criado
│   │   ├── activityTypeRoutes.ts         # ✅ Criado
│   │   ├── defectRoutes.ts               # ✅ Criado
│   │   └── referenceTypeRoutes.ts        # ✅ Criado
│   └── validators/
│       ├── companyValidator.ts           # ✅ Criado
│       ├── sectorValidator.ts            # ✅ Criado
│       ├── activityTypeValidator.ts      # ✅ Criado
│       ├── defectValidator.ts            # ✅ Criado
│       └── referenceTypeValidator.ts     # ✅ Criado
```

### Documentação

```
ARCHITECTURE_PROPOSAL.md                  # ✅ Criado - Arquitetura detalhada
IMPLEMENTATION_SUMMARY.md                 # ✅ Criado - Este arquivo
backend/MIGRATION_SCRIPT.sql              # ✅ Criado - Migração SQL
```

## 🗄️ Novas Entidades do Banco de Dados

### 1. Company (Empresa)
- Cadastro de empresas/plantas
- Relacionamento: 1:N com Sectors e ProductionOrders

### 2. Sector (Setor)
- Divisões dentro de uma empresa
- Relacionamento: 1:N com PlcConfigs e ProductionOrders

### 3. ActivityType (Tipo de Atividade)
- Classificação de paradas
- Relacionamento: 1:N com Downtimes
- Campos: código, nome, descrição, cor

### 4. Defect (Defeito)
- Cadastro de defeitos
- Severidade: LOW, MEDIUM, HIGH, CRITICAL
- Relacionamento: 1:N com ProductionDefects

### 5. ReferenceType (Tipo de Referência)
- Classificação de itens
- Relacionamento: 1:N com Items

### 6. ProductionDefect (Defeito de Produção)
- Registro de defeitos por ordem de produção
- Relacionamento: N:1 com ProductionOrder e Defect

## 🔄 Fluxo de Dados

### Captação de Dados do CLP

```
1. Data Collector carrega configs do banco
   ↓
2. Conecta aos CLPs (Modbus TCP)
   ↓
3. Faz polling dos registros habilitados
   ↓
4. Detecta mudanças nos valores
   ↓
5. Salva em plc_data
   ↓
6. Verifica ordens IN_PROGRESS
   ↓
7. Cria apontamentos automáticos
   ↓
8. Atualiza production_orders
```

### Acesso aos IPs Cadastrados

```sql
-- Data Collector consulta:
SELECT * FROM plc_configs 
WHERE active = true
INCLUDE registers WHERE enabled = true;

-- Para cada configuração:
- host: IP do CLP (ex: 192.168.1.10)
- port: Porta Modbus (ex: 502)
- registers: Lista de registros a monitorar
```

## 📡 API Endpoints Criados

### Companies
- `GET    /api/companies` - Listar
- `GET    /api/companies/:id` - Buscar
- `POST   /api/companies` - Criar
- `PUT    /api/companies/:id` - Atualizar
- `DELETE /api/companies/:id` - Deletar

### Sectors
- `GET    /api/sectors` - Listar
- `GET    /api/sectors/:id` - Buscar
- `POST   /api/sectors` - Criar
- `PUT    /api/sectors/:id` - Atualizar
- `DELETE /api/sectors/:id` - Deletar

### Activity Types
- `GET    /api/activity-types` - Listar
- `GET    /api/activity-types/:id` - Buscar
- `POST   /api/activity-types` - Criar
- `PUT    /api/activity-types/:id` - Atualizar
- `DELETE /api/activity-types/:id` - Deletar

### Defects
- `GET    /api/defects` - Listar
- `GET    /api/defects/:id` - Buscar
- `POST   /api/defects` - Criar
- `PUT    /api/defects/:id` - Atualizar
- `DELETE /api/defects/:id` - Deletar

### Reference Types
- `GET    /api/reference-types` - Listar
- `GET    /api/reference-types/:id` - Buscar
- `POST   /api/reference-types` - Criar
- `PUT    /api/reference-types/:id` - Atualizar
- `DELETE /api/reference-types/:id` - Deletar

## 🚀 Passos para Deploy

### 1. Migração do Banco de Dados

```bash
# Executar script SQL
psql -U postgres -d mes_db -f backend/MIGRATION_SCRIPT.sql
```

Ou através de migration Prisma:
```bash
cd backend
npx prisma migrate dev --name add_new_entities
```

### 2. Atualizar Backend

```bash
cd backend

# Instalar dependências (se houver novas)
npm install

# Gerar Prisma Client
npx prisma generate

# Reiniciar servidor
npm run dev  # Desenvolvimento
# ou
npm run build && npm start  # Produção
```

### 3. Instalar Data Collector no Raspberry Pi 5

```bash
# No Raspberry Pi
cd /opt/mes
git clone <repo> data-collector
cd data-collector

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
nano .env
# Configurar DATABASE_URL

# Gerar Prisma Client
npx prisma generate

# Build
npm run build

# Configurar systemd service
sudo cp mes-data-collector.service /etc/systemd/system/
sudo systemctl enable mes-data-collector
sudo systemctl start mes-data-collector

# Ver logs
sudo journalctl -u mes-data-collector -f
```

### 4. Verificar Health Checks

```bash
# Backend
curl http://localhost:3001/health

# Data Collector
curl http://raspberry-ip:3001/health
```

## 🔧 Configuração de CLPs

### Via SQL (Direto no Banco)

```sql
-- 1. Criar configuração de CLP
INSERT INTO plc_configs (name, host, port, unit_id, polling_interval, sector_id, active)
VALUES ('CLP Linha 1', '192.168.1.10', 502, 1, 1000, 1, true);

-- 2. Adicionar registros
INSERT INTO plc_registers (plc_config_id, register_name, register_address, description, enabled)
VALUES 
    (1, 'D33', 33, 'Contador de produção', true),
    (1, 'D34', 34, 'Contador de refugo', true);
```

### Via API (Através do Frontend)

```javascript
// POST /api/plc-config
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

## 📊 Verificação de Status de Ordem

### Como o Data Collector Verifica

```typescript
// ProductionMonitor.ts
const activeOrders = await prisma.productionOrder.findMany({
  where: {
    status: 'IN_PROGRESS',  // Apenas ordens ativas
    sectorId: sectorId,     // Do mesmo setor do CLP
  },
});

// Se encontrar ordens ativas:
if (increment > 0) {
  // Cria apontamento automático
  // Atualiza producedQuantity
  // Se atingir plannedQuantity, marca como COMPLETED
}
```

## 🔐 Armazenamento de IP e Porta

### Localização no Banco

```
Tabela: plc_configs
├── id (PK)
├── name (Nome do CLP)
├── host (IP - ex: 192.168.1.10)
├── port (Porta - ex: 502)
├── unit_id (Modbus Unit ID)
├── timeout
├── polling_interval
├── reconnect_interval
├── sector_id (FK)
└── active

Tabela: plc_registers
├── id (PK)
├── plc_config_id (FK)
├── register_name (ex: D33)
├── register_address (ex: 33)
├── description
├── data_type
└── enabled
```

### Consumo pelo Data Collector

```typescript
// 1. Ao iniciar, carrega todas configs ativas
const configs = await prisma.plcConfig.findMany({
  where: { active: true },
  include: { registers: { where: { enabled: true } } },
});

// 2. Para cada config, cria conexão Modbus
configs.forEach(config => {
  const connection = new PlcConnection({
    host: config.host,        // IP do banco
    port: config.port,        // Porta do banco
    unitId: config.unitId,
    registers: config.registers,
  });
  
  connection.connect();
});

// 3. Recarrega configs a cada 30s para detectar mudanças
setInterval(() => {
  checkForConfigUpdates();
}, 30000);
```

## 🎯 Tratamento de Exceções

### Data Collector

1. **Erro de Conexão**
   - Loga erro
   - Salva em plc_data com connected=false
   - Agenda reconexão automática

2. **Erro de Leitura**
   - Incrementa contador de erros
   - Se > 5 erros, reconecta CLP
   - Continua monitorando outros registros

3. **Erro de Banco**
   - Mantém dados em buffer de memória
   - Tenta salvar novamente após 1 minuto
   - Loga erro detalhado

### Backend

1. **Validação de Dados**
   - Yup valida todos os inputs
   - Retorna 400 com mensagens claras

2. **Verificação de Integridade**
   - Não permite deletar entidades com dependências
   - Verifica códigos duplicados

3. **Erros Internos**
   - Middleware de erro global
   - Logs com stack trace
   - Retorna 500 sem expor detalhes

## 📈 Próximos Passos

### Implementado ✅
- [x] Schema do banco atualizado
- [x] Data Collector Service completo
- [x] Controladores e rotas para novas entidades
- [x] Validators
- [x] Documentação de arquitetura
- [x] Script de migração SQL

### Pendente ⏳
- [ ] Migration via Prisma (alternativa ao script SQL)
- [ ] Frontend - Páginas de cadastro
- [ ] Frontend - Componentes reutilizáveis
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Deploy e configuração final

## 📝 Notas Importantes

### Raspberry Pi 5
- Requer Node.js 18+ LTS
- Configurar como serviço systemd
- Monitorar logs: `journalctl -u mes-data-collector -f`
- Health check: `http://raspberry-ip:3001/health`

### Banco de Dados
- PostgreSQL 13+
- Executar migration antes de iniciar serviços
- Backup antes de executar migrations

### Rede
- CLPs devem estar acessíveis via rede
- Testar conectividade: `ping <ip-do-clp>`
- Verificar firewall e rotas

## 🆘 Suporte

Em caso de dúvidas, consulte:
- `ARCHITECTURE_PROPOSAL.md` - Arquitetura detalhada
- `data-collector/README.md` - Documentação do Data Collector
- `backend/MIGRATION_SCRIPT.sql` - Script de migração

---

**Versão:** 1.0  
**Data:** 21/10/2025  
**Status:** Implementação Completa - Backend e Data Collector

