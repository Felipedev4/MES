# 🏗️ Arquitetura do Data Collector - v2.0

## 📋 Visão Geral

O Data Collector agora funciona de forma **completamente independente do banco de dados**, consumindo APIs REST do backend para obter configurações e enviar dados coletados.

### ✨ Benefícios desta Arquitetura

✅ **Segurança:** Banco de dados não exposto diretamente  
✅ **Separação de Responsabilidades:** Backend gerencia toda lógica de dados  
✅ **Escalabilidade:** Múltiplos data collectors podem trabalhar em paralelo  
✅ **Manutenção:** Mudanças no banco só afetam o backend  
✅ **Simplicidade:** Data collector só precisa de HTTP, sem Prisma ou drivers de banco  

---

## 🔄 Fluxo de Comunicação

```
┌─────────────────────┐
│   Data Collector    │
│   (Raspberry Pi)    │
└─────────┬───────────┘
          │
          │ HTTP/REST + API Key
          │
          ↓
┌─────────────────────┐
│      Backend        │
│   (Express + API)   │
└─────────┬───────────┘
          │
          │ Prisma ORM
          │
          ↓
┌─────────────────────┐
│    PostgreSQL       │
│    (Database)       │
└─────────────────────┘
```

---

## 🔐 Autenticação

### API Key

O Data Collector se autentica no backend usando uma **API Key** via header HTTP:

```
X-API-Key: your-secret-api-key-here
```

#### Configuração:

**Backend (`backend/.env`):**
```env
DATA_COLLECTOR_API_KEY=my-super-secret-key-123
```

**Data Collector (`data-collector/.env`):**
```env
BACKEND_API_URL=http://192.168.1.100:3001
API_KEY=my-super-secret-key-123
```

⚠️ **IMPORTANTE:** A API Key deve ser a mesma em ambos os serviços!

---

## 📡 APIs Disponíveis

### 1. Obter Configurações de CLP

**Endpoint:** `GET /api/data-collector/plc-configs`  
**Auth:** API Key via header  
**Resposta:**

```json
[
  {
    "id": 1,
    "name": "CLP Injetora 01",
    "host": "192.168.1.15",
    "port": 502,
    "unitId": 1,
    "timeout": 5000,
    "pollingInterval": 2000,
    "reconnectInterval": 10000,
    "sectorId": 1,
    "active": true,
    "registers": [
      {
        "id": 1,
        "plcConfigId": 1,
        "registerName": "D33",
        "registerAddress": 33,
        "description": "Contador de peças",
        "dataType": "INT",
        "enabled": true
      }
    ],
    "sector": {
      "id": 1,
      "code": "INJ01",
      "name": "Injetoras - Setor 1"
    }
  }
]
```

### 2. Enviar Dados Coletados

**Endpoint:** `POST /api/data-collector/plc-data`  
**Auth:** API Key via header  
**Body:**

```json
{
  "plcRegisterId": 1,
  "registerAddress": 33,
  "registerName": "D33",
  "value": 150,
  "timestamp": "2025-10-21T10:30:00Z",
  "connected": true,
  "errorMessage": null
}
```

**Resposta:** `201 Created`

### 3. Enviar Batch de Dados

**Endpoint:** `POST /api/data-collector/plc-data/batch`  
**Auth:** API Key via header  
**Body:**

```json
{
  "data": [
    {
      "plcRegisterId": 1,
      "registerAddress": 33,
      "registerName": "D33",
      "value": 150,
      "timestamp": "2025-10-21T10:30:00Z",
      "connected": true
    },
    {
      "plcRegisterId": 2,
      "registerAddress": 34,
      "registerName": "D34",
      "value": 85,
      "timestamp": "2025-10-21T10:30:00Z",
      "connected": true
    }
  ]
}
```

### 4. Obter Ordens de Produção Ativas

**Endpoint:** `GET /api/data-collector/production-orders/active`  
**Auth:** API Key via header  
**Resposta:**

```json
[
  {
    "id": 10,
    "orderNumber": "OP-2025-001",
    "itemId": 5,
    "status": "IN_PROGRESS",
    "producedQuantity": 1500
  }
]
```

### 5. Enviar Apontamento de Produção

**Endpoint:** `POST /api/data-collector/production-appointments`  
**Auth:** API Key via header  
**Body:**

```json
{
  "productionOrderId": 10,
  "quantity": 50,
  "timestamp": "2025-10-21T10:30:00Z",
  "plcDataId": 12345
}
```

---

## 🔧 Componentes do Data Collector

### 1. **ApiClient** (`src/services/ApiClient.ts`)
Cliente HTTP para comunicação com o backend.

**Responsabilidades:**
- Fazer requisições HTTP
- Gerenciar autenticação (API Key)
- Tratar erros de rede
- Log de requisições

### 2. **PlcConnection** (`src/services/PlcConnection.ts`)
Gerencia conexão individual com um CLP.

**Responsabilidades:**
- Conectar via Modbus TCP
- Fazer polling de registros
- Detectar mudanças de valores
- Enviar dados via `ApiClient`
- Reconexão automática

### 3. **PlcPoolManager** (`src/services/PlcPoolManager.ts`)
Gerencia múltiplas conexões de CLP.

**Responsabilidades:**
- Buscar configurações do backend periodicamente
- Criar/remover conexões dinamicamente
- Atualizar configurações quando mudam
- Fornecer status geral

### 4. **ProductionMonitor** (`src/services/ProductionMonitor.ts`)
Monitora ordens de produção.

**Responsabilidades:**
- Buscar ordens ativas do backend
- Enviar apontamentos de produção
- Integrar com dados de CLP

### 5. **HealthCheck** (`src/services/HealthCheck.ts`)
Servidor HTTP para monitoramento.

**Endpoints:**
- `GET /health` - Status completo
- `GET /status` - Status simplificado
- `POST /reload` - Forçar reload de configurações

---

## 🚀 Configuração Completa

### Passo 1: Backend

1. **Editar `backend/.env`:**

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/mes_db?schema=public"
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=my-jwt-secret
DATA_COLLECTOR_API_KEY=my-super-secret-key-123
```

2. **Iniciar backend:**

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Passo 2: Data Collector (Local ou Raspberry Pi)

1. **Editar `data-collector/.env`:**

```env
BACKEND_API_URL=http://192.168.1.100:3001
API_KEY=my-super-secret-key-123
CONFIG_POLL_INTERVAL=30000
HEALTH_CHECK_PORT=3002
LOG_LEVEL=info
NODE_ENV=production
```

2. **Instalar e iniciar:**

```bash
cd data-collector
npm install
npm run build
npm start

# Ou com PM2 (produção):
pm2 start ecosystem.config.js
```

### Passo 3: Configurar CLPs no Frontend

1. Acesse `http://localhost:3000`
2. Login
3. Vá em **"Configuração de CLP"**
4. Adicione seus CLPs com:
   - Nome, Host, Porta
   - Registros a monitorar
   - Marque como **Ativo**

### Passo 4: Verificar

**Backend Health:**
```bash
curl http://localhost:3001/health
```

**Data Collector Health:**
```bash
curl http://localhost:3002/health
```

---

## 📊 Monitoramento

### Logs do Data Collector

```bash
# Via PM2
pm2 logs mes-data-collector

# Via npm (desenvolvimento)
npm run dev
```

### Verificar Status

```bash
# Status completo
curl http://localhost:3002/health

# Resposta:
{
  "status": "healthy",
  "timestamp": "2025-10-21T10:30:00Z",
  "uptime": 3600,
  "backend": {
    "connected": true,
    "url": "http://192.168.1.100:3001"
  },
  "plcs": {
    "total": 2,
    "connected": 2,
    "disconnected": 0,
    "connections": [
      {
        "id": 1,
        "name": "CLP Injetora 01",
        "connected": true,
        "host": "192.168.1.15",
        "port": 502,
        "registers": 3
      }
    ]
  },
  "production": {
    "activeOrders": 2,
    "orders": [...]
  }
}
```

---

## 🔄 Fluxo Completo de Dados

### 1. Inicialização

```mermaid
sequenceDiagram
    Data Collector->>Backend: GET /api/data-collector/plc-configs
    Backend->>PostgreSQL: SELECT * FROM plc_configs WHERE active = true
    PostgreSQL-->>Backend: Configurações
    Backend-->>Data Collector: JSON com configs
    Data Collector->>CLP: Conectar Modbus TCP
```

### 2. Coleta de Dados

```mermaid
sequenceDiagram
    loop A cada polling interval
        Data Collector->>CLP: Read Holding Registers
        CLP-->>Data Collector: Valores
        Data Collector->>Data Collector: Detectar mudanças
        alt Valor mudou
            Data Collector->>Backend: POST /api/data-collector/plc-data
            Backend->>PostgreSQL: INSERT INTO plc_data
            Backend-->>Data Collector: 201 Created
        end
    end
```

### 3. Apontamento de Produção

```mermaid
sequenceDiagram
    Data Collector->>Backend: GET /api/data-collector/production-orders/active
    Backend-->>Data Collector: Ordens ativas
    Data Collector->>CLP: Read contador
    CLP-->>Data Collector: Valor aumentou
    Data Collector->>Backend: POST /api/data-collector/production-appointments
    Backend->>PostgreSQL: INSERT INTO production
    Backend->>PostgreSQL: UPDATE production_orders
    Backend-->>Data Collector: 201 Created
```

---

## 🛡️ Segurança

### Boas Práticas

1. **API Key forte:**
   ```bash
   # Gerar key aleatória
   openssl rand -hex 32
   ```

2. **HTTPS em produção:**
   ```env
   BACKEND_API_URL=https://seu-dominio.com
   ```

3. **Firewall:**
   - Backend: Permitir apenas frontend e data collector
   - Data Collector: Apenas backend e CLPs

4. **Rede isolada:**
   - CLPs em VLAN separada
   - Data Collector com 2 NICs (rede industrial + rede corporativa)

---

## 🆘 Troubleshooting

### Erro: "API Key inválida"

**Causa:** API Keys diferentes no backend e data-collector  
**Solução:** Verificar `.env` de ambos

### Erro: "Backend não está respondendo"

**Causa:** Backend offline ou URL incorreta  
**Solução:**
```bash
# Verificar se backend está rodando
curl http://IP_BACKEND:3001/health

# Verificar logs do backend
cd backend
npm run dev
```

### Erro: "Nenhuma configuração de CLP encontrada"

**Causa:** Nenhum CLP ativo no banco  
**Solução:** Cadastrar CLP no frontend e marcar como ativo

---

## 📚 Referências

- **Instalação Raspberry Pi:** `INSTALACAO_RASPBERRY_PI.md`
- **Quick Start:** `data-collector/INSTALACAO_RAPIDA.md`
- **API Backend:** `API_DOCUMENTATION.md`
- **Deployment:** `DEPLOYMENT_GUIDE.md`

---

**🎉 Arquitetura implementada com sucesso!**

