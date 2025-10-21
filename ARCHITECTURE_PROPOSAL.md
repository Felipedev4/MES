# Proposta de Arquitetura - Sistema MES com Data Collector Separado

## 1. Visão Geral da Nova Arquitetura

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React - Browser)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
│  │Dashboard │  │Cadastros │  │ Produção │  │ Paradas │  │Configurações│
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘  │
│       │             │              │              │            │         │
│       └─────────────┴──────────────┴──────────────┴────────────┘         │
│                              │                                           │
│                        REST API + WebSocket                              │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────────┐
│                    Backend API (Node.js - Servidor Principal)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
│  │  Auth    │  │   CRUD   │  │Production│  │Dashboard│  │ Config   │  │
│  │Middleware│  │Controllers│  │ Service  │  │ Service │  │ Service  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘  │
│       │             │              │              │            │         │
│       └─────────────┴──────────────┴──────────────┴────────────┘         │
│                              │                                           │
│                        Prisma ORM                                        │
└───────────────────────────────┼──────────────────────────────────────────┘
                                │
                         ┌──────┴──────┐
                         │ PostgreSQL  │
                         │   Database  │
                         └──────┬──────┘
                                │
┌───────────────────────────────┼──────────────────────────────────────────┐
│             Data Collector Service (Node.js - Raspberry Pi 5)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │   PLC Pool   │  │  Production  │  │  Database    │                  │
│  │   Manager    │  │  Monitor     │  │  Client      │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
│         │                  │                  │                          │
│         └──────────────────┴──────────────────┘                          │
│                            │                                             │
│                     Modbus TCP Client                                    │
└────────────────────────────┼────────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                              │
       ┌──────┴──────┐              ┌──────┴──────┐
       │  CLP 1      │              │  CLP 2      │
       │ (IP:Port 1) │              │ (IP:Port 2) │
       └─────────────┘              └─────────────┘
```

## 2. Componentes da Nova Arquitetura

### 2.1 Data Collector Service (Raspberry Pi 5)

**Responsabilidades:**
- Gerenciar conexões com múltiplos CLPs simultaneamente
- Realizar polling periódico dos registros configurados
- Armazenar dados brutos na tabela `plc_data`
- Verificar status das ordens de produção ativas
- Criar apontamentos automáticos quando ordem estiver ativa
- Reconexão automática em caso de falha
- Logs detalhados de operação

**Características:**
- Serviço independente rodando 24/7
- Configuração dinâmica via banco de dados
- Suporte a múltiplos CLPs e registros
- Tratamento robusto de exceções
- Sistema de health check
- Baixo consumo de recursos

### 2.2 Backend API (Servidor Principal)

**Responsabilidades:**
- Autenticação e autorização
- CRUD de todas as entidades
- Dashboard e relatórios
- WebSocket para atualizações em tempo real
- Gerenciamento de configurações de CLPs
- Não realiza comunicação direta com CLPs

**Características:**
- API RESTful
- Documentação Swagger
- Validação de dados
- Sistema de notificações

### 2.3 Banco de Dados PostgreSQL

**Responsabilidades:**
- Armazenamento centralizado
- Servir tanto o Backend quanto o Data Collector
- Histórico de dados do CLP
- Configurações de CLPs e registros
- Dados de produção e cadastros

## 3. Novas Entidades do Sistema

### 3.1 Empresa (Company)
```prisma
model Company {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  tradeName   String?  // Nome fantasia
  cnpj        String?  @unique
  address     String?
  phone       String?
  email       String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  sectors     Sector[]
  productionOrders ProductionOrder[]
}
```

### 3.2 Setor (Sector)
```prisma
model Sector {
  id          Int      @id @default(autoincrement())
  companyId   Int
  code        String   @unique
  name        String
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  company     Company  @relation(fields: [companyId], references: [id])
  plcConfigs  PlcConfig[] // CLPs do setor
  productionOrders ProductionOrder[]
}
```

### 3.3 Tipo de Atividade (ActivityType)
```prisma
model ActivityType {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  description String?
  color       String?  // Cor para visualização (hex)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  downtimes   Downtime[]
}
```

### 3.4 Defeito (Defect)
```prisma
model Defect {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  description String?
  severity    DefectSeverity @default(MEDIUM)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  productionDefects ProductionDefect[]
}

enum DefectSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

### 3.5 Tipo de Referência (ReferenceType)
```prisma
model ReferenceType {
  id          Int      @id @default(autoincrement())
  code        String   @unique
  name        String
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  items       Item[]
}
```

### 3.6 Defeito de Produção (ProductionDefect)
```prisma
model ProductionDefect {
  id                Int      @id @default(autoincrement())
  productionOrderId Int
  defectId          Int
  quantity          Int
  timestamp         DateTime @default(now())
  notes             String?
  
  productionOrder   ProductionOrder @relation(fields: [productionOrderId], references: [id])
  defect            Defect @relation(fields: [defectId], references: [id])
}
```

## 4. Fluxo de Dados Detalhado

### 4.1 Fluxo de Captação de Dados do CLP

```
1. Data Collector Service inicia
   ↓
2. Carrega configurações ativas do banco (PlcConfig + PlcRegister)
   ↓
3. Para cada CLP ativo:
   a. Cria conexão Modbus TCP (IP:Port do banco)
   b. Configura registros a serem monitorados
   c. Inicia polling no intervalo configurado
   ↓
4. A cada intervalo de polling:
   a. Lê todos os registros habilitados
   b. Compara com valor anterior
   c. Se mudou:
      - Salva em plc_data (registro + valor + timestamp)
      - Verifica se há ordem de produção ativa
      - Se ativa: cria apontamento automático
   ↓
5. Em caso de erro:
   a. Loga erro
   b. Salva em plc_data com connected=false
   c. Agenda reconexão
```

### 4.2 Fluxo de Apontamento Automático

```
1. Operador seleciona ordem de produção no frontend
   ↓
2. Frontend envia: POST /api/production/start-automatic
   ↓
3. Backend atualiza ordem:
   - status = IN_PROGRESS
   - startDate = now()
   ↓
4. Data Collector detecta mudança no registro do CLP
   ↓
5. Data Collector verifica:
   a. Existe ordem ativa? (status = IN_PROGRESS)
   b. Valor incrementou? (positivo)
   c. Setor/CLP corresponde à ordem?
   ↓
6. Se todas condições verdadeiras:
   a. Calcula incremento (newValue - oldValue)
   b. Cria ProductionAppointment:
      - quantity = incremento
      - automatic = true
      - clpCounterValue = newValue
   c. Atualiza ProductionOrder:
      - producedQuantity += incremento
   d. Se produziu quantidade planejada:
      - status = COMPLETED
      - endDate = now()
   ↓
7. Data Collector notifica backend (via HTTP ou shared DB)
   ↓
8. Backend emite WebSocket para frontend
   ↓
9. Frontend atualiza UI em tempo real
```

### 4.3 Fluxo de Configuração de CLPs

```
1. Usuário admin acessa "Configurações > CLPs"
   ↓
2. Frontend carrega: GET /api/plc-config
   ↓
3. Usuário cria novo CLP:
   - Nome: "CLP Linha 1"
   - IP: "192.168.1.10"
   - Porta: 502
   - Setor: "Injeção"
   - Registros:
     * D33 (Contador Produção)
     * D34 (Contador Refugo)
     * D40 (Status Máquina)
   ↓
4. Frontend envia: POST /api/plc-config
   ↓
5. Backend salva no banco (PlcConfig + PlcRegister)
   ↓
6. Data Collector detecta nova configuração:
   - Opção A: Polling no banco a cada X segundos
   - Opção B: Notificação via webhook/message queue
   - Opção C: Reinício manual do serviço
   ↓
7. Data Collector carrega nova config e inicia conexão
```

## 5. Implementação do Data Collector Service

### 5.1 Estrutura de Diretórios

```
data-collector/
├── src/
│   ├── config/
│   │   └── database.ts          # Conexão com banco
│   ├── services/
│   │   ├── PlcPoolManager.ts    # Gerencia múltiplos CLPs
│   │   ├── PlcConnection.ts     # Conexão individual com CLP
│   │   ├── ProductionMonitor.ts # Monitor de produção
│   │   └── HealthCheck.ts       # Health check
│   ├── utils/
│   │   └── logger.ts            # Sistema de logs
│   └── index.ts                 # Entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

### 5.2 Componentes Principais

#### PlcPoolManager
```typescript
class PlcPoolManager {
  - connections: Map<number, PlcConnection>
  + initialize(): Promise<void>
  + loadConfigurations(): Promise<PlcConfig[]>
  + createConnection(config: PlcConfig): PlcConnection
  + removeConnection(configId: number): void
  + reloadConfigurations(): Promise<void>
}
```

#### PlcConnection
```typescript
class PlcConnection {
  - config: PlcConfig
  - client: ModbusClient
  - registerValues: Map<number, number>
  + connect(): Promise<void>
  + disconnect(): void
  + pollRegisters(): Promise<void>
  + readRegister(address: number): Promise<number>
  + handleValueChange(register, oldValue, newValue): Promise<void>
}
```

#### ProductionMonitor
```typescript
class ProductionMonitor {
  + checkActiveOrders(): Promise<ProductionOrder[]>
  + shouldCreateAppointment(order, plcConfig): boolean
  + createAppointment(order, quantity, counterValue): Promise<void>
  + updateProductionOrder(orderId, increment): Promise<void>
}
```

## 6. Armazenamento e Consumo de IP e Porta

### 6.1 Armazenamento (PlcConfig)

```sql
-- Tabela plc_configs
id | name        | host          | port | unitId | sectorId | active
1  | CLP Linha 1 | 192.168.1.10  | 502  | 1      | 1        | true
2  | CLP Linha 2 | 192.168.1.11  | 502  | 1      | 1        | true
3  | CLP Injeção | 10.0.0.50     | 502  | 1      | 2        | true
```

### 6.2 Consumo

**Data Collector:**
```typescript
// Carrega configurações do banco
const configs = await prisma.plcConfig.findMany({
  where: { active: true },
  include: {
    registers: { where: { enabled: true } },
    sector: true,
  },
});

// Para cada configuração, cria conexão
configs.forEach(config => {
  const connection = new PlcConnection(
    config.host,    // IP do banco
    config.port,    // Porta do banco
    config.unitId,
    config.registers
  );
  connection.connect();
});
```

**Backend API:**
```typescript
// Testa conexão com CLP antes de salvar
POST /api/plc-config/test
{
  "host": "192.168.1.10",
  "port": 502,
  "unitId": 1,
  "timeout": 5000
}

// Resposta
{
  "success": true,
  "latency": 45,
  "message": "Conexão estabelecida com sucesso"
}
```

## 7. Integração Backend + Data Collector

### 7.1 Opções de Comunicação

#### Opção 1: Banco de Dados Compartilhado (Recomendada)
- Data Collector escreve diretamente no banco
- Backend lê dados do banco
- Simples e confiável
- Sem necessidade de API entre serviços

#### Opção 2: API REST
- Data Collector chama API do backend
- Backend centraliza lógica de negócio
- Mais controle, mas mais complexo

#### Opção 3: Message Queue (RabbitMQ/Redis)
- Data Collector publica eventos
- Backend consome eventos
- Escalável, mas overhead adicional

**Recomendação:** Opção 1 para simplicidade

### 7.2 Sincronização de Configurações

```typescript
// Data Collector verifica mudanças a cada 30 segundos
setInterval(async () => {
  const latestUpdate = await prisma.plcConfig.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: { updatedAt: true },
  });
  
  if (latestUpdate.updatedAt > lastCheck) {
    console.log('Configurações alteradas, recarregando...');
    await plcPoolManager.reloadConfigurations();
  }
  
  lastCheck = new Date();
}, 30000);
```

## 8. Tratamento de Exceções

### 8.1 Erros de Conexão

```typescript
try {
  await connection.connect();
} catch (error) {
  logger.error(`Erro ao conectar CLP ${config.name}:`, error);
  
  // Salvar no banco
  await prisma.plcData.create({
    data: {
      plcConfigId: config.id,
      registerAddress: 0,
      value: 0,
      connected: false,
      errorMessage: error.message,
    },
  });
  
  // Agendar reconexão
  setTimeout(() => connection.connect(), config.reconnectInterval);
}
```

### 8.2 Erros de Leitura

```typescript
try {
  const value = await readRegister(address);
  // ... processar valor
} catch (error) {
  logger.warn(`Erro ao ler registro ${address}:`, error.message);
  
  // Incrementar contador de erros
  errorCount++;
  
  // Se muitos erros, desconectar e reconectar
  if (errorCount > 5) {
    connection.disconnect();
    connection.connect();
    errorCount = 0;
  }
}
```

### 8.3 Erros de Banco de Dados

```typescript
try {
  await prisma.plcData.create({ ... });
} catch (error) {
  logger.error('Erro ao salvar no banco:', error);
  
  // Buffer em memória temporariamente
  inMemoryBuffer.push({ timestamp, register, value });
  
  // Tentar salvar buffer posteriormente
  setTimeout(() => flushBuffer(), 60000);
}
```

## 9. Segurança e Performance

### 9.1 Segurança

**Rede:**
- CLPs em VLAN isolada
- Firewall entre redes
- Raspberry Pi com 2 interfaces de rede (opcional)

**Banco de Dados:**
- Usuário específico para Data Collector (permissões limitadas)
- SSL/TLS para conexão com banco
- Credenciais em variáveis de ambiente

**Código:**
- Validação de dados recebidos do CLP
- Limite de valores (min/max)
- Rate limiting para evitar sobrecarga

### 9.2 Performance

**Data Collector:**
- Polling interval configurável (padrão: 1000ms)
- Leitura assíncrona de múltiplos CLPs
- Processamento paralelo de registros
- Buffer para escrita em lote no banco

**Banco de Dados:**
- Índices em campos de busca frequente
- Particionamento de plc_data por data (opcional)
- Política de retenção de dados (ex: 90 dias)

```sql
-- Índices recomendados
CREATE INDEX idx_plc_data_timestamp ON plc_data(timestamp DESC);
CREATE INDEX idx_plc_data_register ON plc_data(plcConfigId, registerAddress);
CREATE INDEX idx_production_orders_status ON production_orders(status) WHERE status = 'IN_PROGRESS';
```

## 10. Monitoramento e Logs

### 10.1 Health Check Endpoint

```typescript
// Data Collector expõe endpoint de health check
app.get('/health', async (req, res) => {
  const connections = plcPoolManager.getStatus();
  
  res.json({
    status: 'running',
    uptime: process.uptime(),
    database: await checkDatabase(),
    connections: connections.map(c => ({
      name: c.name,
      connected: c.connected,
      lastRead: c.lastRead,
      errors: c.errorCount,
    })),
  });
});
```

### 10.2 Sistema de Logs

```typescript
// Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console(),
  ],
});
```

### 10.3 Métricas

- Número de conexões ativas
- Taxa de leitura (reads/segundo)
- Taxa de erros
- Latência média de leitura
- Quantidade de dados salvos
- Apontamentos criados

## 11. Deployment no Raspberry Pi 5

### 11.1 Instalação

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clonar repositório
git clone <repo-url> /opt/mes-data-collector
cd /opt/mes-data-collector

# Instalar dependências
npm install --production

# Configurar variáveis de ambiente
cp .env.example .env
nano .env
```

### 11.2 Configuração como Serviço (systemd)

```ini
# /etc/systemd/system/mes-data-collector.service
[Unit]
Description=MES Data Collector Service
After=network.target postgresql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/opt/mes-data-collector
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar serviço
sudo systemctl enable mes-data-collector
sudo systemctl start mes-data-collector
sudo systemctl status mes-data-collector
```

### 11.3 Logs e Monitoramento

```bash
# Ver logs em tempo real
sudo journalctl -u mes-data-collector -f

# Verificar status
systemctl status mes-data-collector

# Reiniciar serviço
sudo systemctl restart mes-data-collector
```

## 12. Cronograma de Implementação

### Fase 1: Preparação (1-2 semanas)
- ✅ Atualizar schema do banco (novas entidades)
- ✅ Criar migrations
- ✅ Implementar CRUD das novas entidades
- ✅ Atualizar frontend com novos cadastros

### Fase 2: Data Collector (2-3 semanas)
- ✅ Estrutura base do Data Collector
- ✅ PlcPoolManager e PlcConnection
- ✅ ProductionMonitor
- ✅ Sistema de logs
- ✅ Testes unitários

### Fase 3: Integração (1-2 semanas)
- ✅ Testes de integração
- ✅ Configuração no Raspberry Pi
- ✅ Testes em ambiente de produção
- ✅ Ajustes e otimizações

### Fase 4: Deploy e Treinamento (1 semana)
- ✅ Deploy em produção
- ✅ Documentação
- ✅ Treinamento de usuários
- ✅ Monitoramento inicial

## 13. Benefícios da Nova Arquitetura

### 13.1 Separação de Responsabilidades
- Backend focado em API e regras de negócio
- Data Collector focado em comunicação com CLPs
- Manutenção e deploy independentes

### 13.2 Escalabilidade
- Suporte a múltiplos CLPs sem overhead no backend
- Possibilidade de múltiplos Data Collectors (um por setor)
- Balanceamento de carga facilitado

### 13.3 Confiabilidade
- Falha em um CLP não afeta outros
- Reconexão automática
- Buffer de dados em caso de falha de rede

### 13.4 Flexibilidade
- Configuração dinâmica via banco
- Adição de novos CLPs sem código
- Suporte a diferentes tipos de registros

### 13.5 Manutenibilidade
- Código organizado e modular
- Logs centralizados
- Health checks para monitoramento
- Fácil depuração

## 14. Próximos Passos

1. **Revisar e aprovar esta arquitetura**
2. **Implementar schema do banco atualizado**
3. **Desenvolver Data Collector Service**
4. **Criar CRUD das novas entidades**
5. **Atualizar frontend com novos cadastros**
6. **Testes em ambiente de desenvolvimento**
7. **Deploy no Raspberry Pi**
8. **Testes em produção**
9. **Documentação final**
10. **Treinamento**

---

**Documento criado em:** 21/10/2025  
**Versão:** 1.0  
**Status:** Proposta para Aprovação

