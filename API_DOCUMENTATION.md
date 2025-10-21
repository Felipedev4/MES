# Documentação da API - Sistema MES

## Base URL

```
http://localhost:3001/api
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login, inclua o token em todas as requisições:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticação

#### POST /auth/login
Autentica um usuário e retorna token JWT.

**Request Body:**
```json
{
  "email": "admin@mes.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@mes.com",
    "name": "Administrador",
    "role": "ADMIN"
  }
}
```

#### POST /auth/register
Registra um novo usuário (requer permissão ADMIN).

**Request Body:**
```json
{
  "email": "user@mes.com",
  "password": "password123",
  "name": "Nome do Usuário",
  "role": "OPERATOR"
}
```

---

### Itens

#### GET /items
Lista todos os itens.

**Query Parameters:**
- `active` (optional): `true` | `false`

**Response:**
```json
[
  {
    "id": 1,
    "code": "ITEM-001",
    "name": "Tampa Plástica 100mm",
    "description": "Tampa plástica injetada",
    "unit": "pç",
    "active": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /items/:id
Busca item por ID.

#### POST /items
Cria novo item (requer permissão SUPERVISOR+).

**Request Body:**
```json
{
  "code": "ITEM-001",
  "name": "Tampa Plástica 100mm",
  "description": "Tampa plástica injetada",
  "unit": "pç",
  "active": true
}
```

#### PUT /items/:id
Atualiza item (requer permissão SUPERVISOR+).

#### DELETE /items/:id
Deleta item (requer permissão MANAGER+).

---

### Moldes

#### GET /molds
Lista todos os moldes.

**Query Parameters:**
- `active` (optional): `true` | `false`

#### GET /molds/:id
Busca molde por ID.

#### POST /molds
Cria novo molde (requer permissão SUPERVISOR+).

**Request Body:**
```json
{
  "code": "MOLD-001",
  "name": "Molde Tampa 4 Cavidades",
  "description": "Molde para tampa plástica",
  "cavities": 4,
  "cycleTime": 15.5,
  "maintenanceDate": "2025-12-31",
  "active": true
}
```

#### PUT /molds/:id
Atualiza molde (requer permissão SUPERVISOR+).

#### DELETE /molds/:id
Deleta molde (requer permissão MANAGER+).

---

### Ordens de Produção

#### GET /production-orders
Lista todas as ordens de produção.

**Query Parameters:**
- `status` (optional): `PENDING` | `IN_PROGRESS` | `PAUSED` | `COMPLETED` | `CANCELLED`
- `startDate` (optional): Data de início (YYYY-MM-DD)
- `endDate` (optional): Data de fim (YYYY-MM-DD)

**Response:**
```json
[
  {
    "id": 1,
    "orderNumber": "OP-2025-001",
    "itemId": 1,
    "moldId": 1,
    "plannedQuantity": 1000,
    "producedQuantity": 250,
    "rejectedQuantity": 5,
    "status": "IN_PROGRESS",
    "priority": 1,
    "startDate": "2025-01-01T08:00:00.000Z",
    "endDate": null,
    "plannedStartDate": "2025-01-01T08:00:00.000Z",
    "plannedEndDate": "2025-01-08T18:00:00.000Z",
    "notes": "Ordem urgente",
    "item": { ... },
    "mold": { ... }
  }
]
```

#### GET /production-orders/:id
Busca ordem por ID com apontamentos e paradas.

#### GET /production-orders/:id/stats
Obtém estatísticas detalhadas da ordem.

**Response:**
```json
{
  "orderId": 1,
  "orderNumber": "OP-2025-001",
  "plannedQuantity": 1000,
  "producedQuantity": 250,
  "rejectedQuantity": 5,
  "completionRate": 25.0,
  "qualityRate": 98.0,
  "totalAppointments": 10,
  "totalDowntimeSeconds": 1800,
  "totalDowntimeFormatted": "30 minutos",
  "status": "IN_PROGRESS"
}
```

#### POST /production-orders
Cria nova ordem (requer permissão SUPERVISOR+).

**Request Body:**
```json
{
  "orderNumber": "OP-2025-001",
  "itemId": 1,
  "moldId": 1,
  "plannedQuantity": 1000,
  "priority": 1,
  "plannedStartDate": "2025-01-01",
  "plannedEndDate": "2025-01-08",
  "notes": "Ordem urgente"
}
```

#### PUT /production-orders/:id
Atualiza ordem (requer permissão SUPERVISOR+).

#### PATCH /production-orders/:id/status
Atualiza apenas o status da ordem.

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

#### DELETE /production-orders/:id
Deleta ordem (requer permissão MANAGER+).

---

### Paradas (Downtimes)

#### GET /downtimes
Lista todas as paradas.

**Query Parameters:**
- `type` (optional): `PRODUCTIVE` | `UNPRODUCTIVE` | `PLANNED`
- `productionOrderId` (optional): ID da ordem
- `startDate` (optional): Data de início
- `endDate` (optional): Data de fim

#### GET /downtimes/stats
Obtém estatísticas de paradas.

**Response:**
```json
{
  "total": 15,
  "totalDurationSeconds": 5400,
  "totalDurationFormatted": "uma hora",
  "byType": {
    "productive": {
      "count": 5,
      "durationSeconds": 1800,
      "durationFormatted": "30 minutos"
    },
    "unproductive": {
      "count": 8,
      "durationSeconds": 3000,
      "durationFormatted": "50 minutos"
    },
    "planned": {
      "count": 2,
      "durationSeconds": 600,
      "durationFormatted": "10 minutos"
    }
  }
}
```

#### GET /downtimes/:id
Busca parada por ID.

#### POST /downtimes
Registra nova parada.

**Request Body:**
```json
{
  "productionOrderId": 1,
  "type": "UNPRODUCTIVE",
  "reason": "Falta de material",
  "description": "Aguardando fornecedor",
  "responsibleId": 1,
  "startTime": "2025-01-01T10:30:00",
  "endTime": "2025-01-01T11:00:00"
}
```

#### PUT /downtimes/:id
Atualiza parada (requer permissão SUPERVISOR+).

#### PATCH /downtimes/:id/end
Finaliza uma parada em andamento.

**Request Body:**
```json
{
  "endTime": "2025-01-01T11:00:00"
}
```

#### DELETE /downtimes/:id
Deleta parada (requer permissão MANAGER+).

---

### Produção

#### POST /production/appointments
Cria apontamento manual de produção.

**Request Body:**
```json
{
  "productionOrderId": 1,
  "quantity": 50,
  "rejectedQuantity": 2,
  "notes": "Apontamento manual"
}
```

#### POST /production/active-order
Define ordem ativa para apontamento automático.

**Request Body:**
```json
{
  "productionOrderId": 1
}
```

#### DELETE /production/active-order
Remove ordem ativa.

#### GET /production/active-order
Obtém ID da ordem ativa.

**Response:**
```json
{
  "activeOrderId": 1,
  "hasActiveOrder": true
}
```

#### GET /production/stats
Obtém estatísticas de produção.

**Query Parameters:**
- `orderId` (optional): ID da ordem

#### GET /production/plc/status
Obtém status de conexão do CLP.

**Response:**
```json
{
  "connected": true,
  "lastValue": 1250,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

#### GET /production/plc/read
Lê registro D33 do CLP manualmente.

#### POST /production/plc/reset
Reseta contador do CLP (escreve 0 no D33).

---

### Dashboard

#### GET /dashboard/kpis
Obtém KPIs principais.

**Query Parameters:**
- `startDate` (optional): Data de início
- `endDate` (optional): Data de fim

**Response:**
```json
{
  "totalOrders": 50,
  "ordersInProgress": 5,
  "totalProduced": 10000,
  "totalRejected": 150,
  "qualityRate": 98.5,
  "totalDowntime": 7200,
  "totalDowntimeFormatted": "2 horas",
  "downtimeCount": 25,
  "oee": 85.5,
  "availability": 95.0,
  "performance": 90.0,
  "quality": 98.5
}
```

#### GET /dashboard/production-by-period
Obtém dados de produção agrupados por período.

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `groupBy` (optional): `hour` | `day` | `month` (default: `day`)

**Response:**
```json
[
  {
    "period": "2025-01-01",
    "produced": 500,
    "rejected": 10,
    "approved": 490,
    "appointmentCount": 15
  }
]
```

#### GET /dashboard/downtime-distribution
Obtém distribuição de paradas por tipo.

#### GET /dashboard/top-items
Obtém itens mais produzidos.

**Query Parameters:**
- `limit` (optional): Número de itens (default: 10)
- `startDate` (optional)
- `endDate` (optional)

#### GET /dashboard/plc-data
Obtém histórico de dados do CLP.

**Query Parameters:**
- `limit` (optional): Número de registros (default: 100)

---

## WebSocket Events

### Eventos do Servidor

#### `plc:connected`
Emitido quando CLP conecta.

#### `plc:disconnected`
Emitido quando CLP desconecta.

#### `plc:valueChanged`
Emitido quando valor do registro D33 muda.

**Payload:**
```json
{
  "oldValue": 1000,
  "newValue": 1001,
  "increment": 1,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

#### `production:update`
Emitido quando há apontamento de produção.

**Payload:**
```json
{
  "appointment": { ... },
  "order": { ... },
  "increment": 1,
  "total": 251
}
```

### Eventos do Cliente

#### `plc:getStatus`
Solicita status atual do CLP.

## Configurações do CLP (Modbus)

O sistema suporta comunicação Modbus TCP com CLP para apontamento automático de produção. As configurações podem ser gerenciadas via frontend ou arquivo `.env`.

### Configuração via Frontend (Recomendado)

Use os endpoints da API para gerenciar configurações do CLP dinamicamente:

#### GET /api/plc-config
Lista todas as configurações de CLP cadastradas.

#### GET /api/plc-config/active
Obtém a configuração atualmente ativa.

#### POST /api/plc-config
Cria uma nova configuração de CLP.

**Request Body:**
```json
{
  "name": "CLP Principal - DVP-12SE",
  "host": "192.168.1.100",
  "port": 502,
  "unitId": 1,
  "timeout": 5000,
  "pollingInterval": 1000,
  "reconnectInterval": 10000,
  "active": true
}
```

#### PUT /api/plc-config/{id}
Atualiza uma configuração existente.

#### POST /api/plc-config/{id}/activate
Ativa uma configuração específica (desativa as demais).

#### POST /api/plc-config/test-connection
Testa conexão com um CLP antes de salvar.

**Request Body:**
```json
{
  "host": "192.168.1.100",
  "port": 502,
  "unitId": 1,
  "timeout": 5000
}
```

#### POST /api/plc-config/registers
Adiciona um novo registro ao CLP.

**Request Body:**
```json
{
  "plcConfigId": 1,
  "registerName": "D34",
  "registerAddress": 34,
  "description": "Contador de rejeitos",
  "dataType": "INT16",
  "enabled": true
}
```

#### PUT /api/plc-config/registers/{id}
Atualiza um registro existente.

#### DELETE /api/plc-config/registers/{id}
Remove um registro do CLP.

### Variáveis de Ambiente (Fallback)

Se nenhuma configuração estiver cadastrada no banco, o sistema usará as variáveis de ambiente do arquivo `.env`:

```env
# IP do CLP
MODBUS_HOST=192.168.1.100

# Porta Modbus TCP (padrão: 502)
MODBUS_PORT=502

# ID da unidade Modbus (padrão: 1)
MODBUS_UNIT_ID=1

# Número do registro D a ser lido (padrão: 33 para D33)
MODBUS_REGISTER_D33=33

# Timeout de conexão em ms (padrão: 5000)
MODBUS_TIMEOUT=5000

# Intervalo entre tentativas de reconexão em ms (padrão: 10000)
MODBUS_RECONNECT_INTERVAL=10000

# Intervalo de leitura do registro em ms (padrão: 1000)
MODBUS_POLLING_INTERVAL=1000
```

### Recomendações de Polling

O `MODBUS_POLLING_INTERVAL` define com que frequência o sistema lê o registro D33:

- **500ms**: Para produção muito rápida (alta taxa de peças/minuto)
- **1000ms** (padrão): Para produção normal
- **2000ms**: Para produção lenta ou para reduzir carga no CLP
- **5000ms**: Para monitoramento de baixa frequência

⚠️ **Atenção**: Valores muito baixos (< 500ms) podem sobrecarregar o CLP e a rede.

### Funcionamento

1. Sistema conecta automaticamente ao CLP na inicialização
2. Se falhar, tenta reconectar a cada `MODBUS_RECONNECT_INTERVAL`
3. Quando conectado, lê registro D33 a cada `MODBUS_POLLING_INTERVAL`
4. Quando valor incrementa, cria apontamento automático na ordem ativa
5. Emite eventos WebSocket para atualização em tempo real

### Operação Sem CLP

O sistema funciona normalmente mesmo sem CLP conectado:
- Apontamentos manuais continuam disponíveis
- Todas as funcionalidades de gestão funcionam normalmente
- Mensagens de reconexão podem ser ignoradas

## Códigos de Status HTTP

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (erro de validação)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **Limite:** 100 requisições por 15 minutos por IP
- **Header:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Documentação Interativa

Acesse a documentação Swagger em:
```
http://localhost:3001/api-docs
```


