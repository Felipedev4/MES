# 💰 Análise de Migração Azure - Versão Econômica

## 📋 Resumo Executivo - Versão Econômica

**Objetivo**: Migrar Sistema MES para Azure com custos otimizados  
**Duração Estimada**: 6-7 semanas  
**Custo Estimado**: $50-150/mês (redução de 60-70%)  
**ROI Esperado**: 70-80% redução de custos operacionais  

---

## 💡 Estratégias de Redução de Custos

### 1. **Consolidação de Serviços**
- **Frontend + Backend** no mesmo App Service
- **Eliminar Azure Front Door** (usar App Service nativo)
- **PostgreSQL Single Server** (mais barato que Flexible)
- **Storage Account** apenas para logs essenciais

### 2. **Otimização de Recursos**
- **App Service B1** (1 vCPU, 1.75GB RAM) para desenvolvimento
- **App Service S1** (1 vCPU, 1.75GB RAM) para produção
- **PostgreSQL B1ms** (1 vCore, 2GB RAM) para desenvolvimento
- **PostgreSQL GP_Gen5_2** (2 vCores, 10GB RAM) para produção

### 3. **Eliminação de Serviços Desnecessários**
- **Remover Azure Front Door** (economia de $15-50/mês)
- **Usar Application Insights básico** (economia de $10-40/mês)
- **Key Vault apenas para produção** (economia de $5/mês)
- **Storage Account mínimo** (economia de $2-8/mês)

---

## 🏗️ Arquitetura Econômica Proposta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        🏭 FÁBRICA (Local)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              Data Collector (Raspberry Pi)                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │    │
│  │  │   PLC Pool   │  │  Production  │  │  API Client  │        │    │
│  │  │   Manager    │  │  Monitor     │  │  (HTTPS)     │        │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │    │
│  │         │                  │                  │                │    │
│  │         └──────────────────┴──────────────────┘                │    │
│  │                            │                                   │    │
│  │                     Modbus TCP Client                         │    │
│  └────────────────────────────┼───────────────────────────────────┘    │
│                               │                                       │
│              ┌────────────────┼────────────────┐                     │
│              │                │                │                     │
│       ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐             │
│       │  CLP 1      │  │  CLP 2      │  │  CLP N      │             │
│       │ (Injetora)  │  │ (Extrusora) │  │ (Outros)    │             │
│       └─────────────┘  └─────────────┘  └─────────────┘             │
└───────────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS + API Key
                               │
┌─────────────────────────────┼───────────────────────────────────────────┐
│                        ☁️ MICROSOFT AZURE (ECONÔMICO)                 │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              Azure App Service (Consolidado)                   │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │  Frontend (React) + Backend (Node.js)                  │    │    │
│  │  │  • Mesmo App Service Plan                              │    │    │
│  │  │  • Deploy separado por slots                          │    │    │
│  │  │  │  • / (Frontend)                                    │    │    │
│  │  │  │  • /api (Backend)                                  │    │    │
│  │  │  • SSL nativo do App Service                          │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                             │                                           │
│  ┌──────────────────────────┼───────────────────────────────────────┐    │
│  │              Azure Database for PostgreSQL                      │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │              Single Server (Básico)                    │    │    │
│  │  │  • Backup automático (7 dias)                         │    │    │
│  │  │  • SSL/TLS incluído                                   │    │    │
│  │  │  • Monitoramento básico                               │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Azure Monitor (Básico)                     │    │
│  │  • Application Insights (5GB/mês)                            │    │
│  │  • Log Analytics (1GB/mês)                                   │    │
│  │  • Alertas básicos                                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💰 Comparação de Custos Detalhada

### Versão Original vs. Econômica

| Serviço | Versão Original | Versão Econômica | Economia |
|---------|----------------|------------------|----------|
| **App Service** | P1V2 (2 instâncias) - $146 | S1 (1 instância) - $73 | **$73** |
| **PostgreSQL** | Flexible D2s_v3 - $90 | Single GP_Gen5_2 - $45 | **$45** |
| **Front Door** | Premium - $50 | Removido | **$50** |
| **Application Insights** | 20GB - $40 | 5GB - $10 | **$30** |
| **Key Vault** | Standard - $5 | Removido | **$5** |
| **Storage Account** | GRS 500GB - $10 | LRS 50GB - $2 | **$8** |
| **Total Mensal** | **$341** | **$130** | **$211 (62%)** |

### Cenários de Custo

#### 🟢 Desenvolvimento/Teste (Muito Econômico)
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| App Service (B1) | 1 instância, 1 vCPU | $13 |
| PostgreSQL (B1ms) | 1 vCore, 2GB RAM | $25 |
| Application Insights | 5GB logs | $10 |
| Storage Account | LRS, 10GB | $1 |
| **Total** | | **$49** |

#### 🟡 Produção Pequena (Econômico)
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| App Service (S1) | 1 instância, 1 vCPU | $73 |
| PostgreSQL (GP_Gen5_2) | 2 vCores, 10GB RAM | $45 |
| Application Insights | 5GB logs | $10 |
| Storage Account | LRS, 50GB | $2 |
| **Total** | | **$130** |

#### 🟠 Produção Média (Balanceado)
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| App Service (S2) | 1 instância, 2 vCPU | $146 |
| PostgreSQL (GP_Gen5_4) | 4 vCores, 20GB RAM | $90 |
| Application Insights | 10GB logs | $20 |
| Storage Account | LRS, 100GB | $4 |
| **Total** | | **$260** |

---

## 🔧 Configuração Técnica Econômica

### 1. **App Service Consolidado**

#### Estrutura de Deploy
```
mes-app.azurewebsites.net/
├── / (Frontend React)
├── /api (Backend Node.js)
├── /health (Health Check)
└── /docs (API Documentation)
```

#### Configuração do Servidor
```typescript
// server.ts - Servir frontend e API no mesmo servidor
import express from 'express';
import path from 'path';

const app = express();

// API Routes
app.use('/api', apiRoutes);

// Serve React App
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
```

#### Variáveis de Ambiente Otimizadas
```env
# App Service Configuration
WEBSITE_NODE_DEFAULT_VERSION=18.17.0
WEBSITE_RUN_FROM_PACKAGE=1
WEBSITE_HTTPLOGGING_RETENTION_DAYS=7

# Database (PostgreSQL Single Server)
DATABASE_URL="postgresql://mes_user:password@mes-postgres.postgres.database.azure.com:5432/mes_db?sslmode=require"

# Application
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://mes-app.azurewebsites.net

# Data Collector
USE_EXTERNAL_DATA_COLLECTOR=true
DATA_COLLECTOR_API_KEY=your-secure-api-key

# Monitoring (Básico)
APPLICATIONINSIGHTS_CONNECTION_STRING=your-connection-string
```

### 2. **PostgreSQL Single Server**

#### Configuração Otimizada
```sql
-- Configurações de performance para custo baixo
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Índices essenciais apenas
CREATE INDEX CONCURRENTLY idx_production_orders_status 
ON production_orders(status) WHERE status = 'ACTIVE';

CREATE INDEX CONCURRENTLY idx_plc_data_timestamp 
ON plc_data(timestamp DESC);

CREATE INDEX CONCURRENTLY idx_production_appointments_timestamp 
ON production_appointments(timestamp DESC);
```

### 3. **Data Collector Otimizado**

#### Configuração de Rede Econômica
```env
# data-collector/.env
BACKEND_API_URL=https://mes-app.azurewebsites.net/api
API_KEY=your-secure-api-key-here
CONFIG_POLL_INTERVAL=60000  # Aumentar para 1 minuto
HEALTH_CHECK_PORT=3002
LOG_LEVEL=warn  # Reduzir logs
NODE_ENV=production

# Otimizações de rede
NETWORK_TIMEOUT=15000  # Reduzir timeout
MAX_RETRIES=3  # Reduzir tentativas
RETRY_DELAY=3000  # Reduzir delay
BATCH_SIZE=10  # Processar em lotes menores
```

#### Implementação de Circuit Breaker
```typescript
// Circuit Breaker para economizar tentativas
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minuto

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold && 
           (Date.now() - this.lastFailureTime) < this.timeout;
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
}
```

---

## 📊 Estratégias de Otimização Adicionais

### 1. **Redução de Logs e Monitoramento**
```typescript
// Logging econômico
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Apenas erros em produção
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'error' : 'info'
    })
  ]
});
```

### 2. **Cache Inteligente**
```typescript
// Cache em memória para reduzir queries
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

async function getCachedData(key: string, fetcher: () => Promise<any>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 3. **Compressão e Otimização**
```typescript
// Middleware de compressão
import compression from 'compression';

app.use(compression({
  level: 6, // Balance entre compressão e CPU
  threshold: 1024, // Comprimir apenas arquivos > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

### 4. **Batch Processing**
```typescript
// Processar dados CLP em lotes para economizar requests
class BatchProcessor {
  private batch: any[] = [];
  private batchSize = 10;
  private flushInterval = 30000; // 30 segundos

  add(data: any) {
    this.batch.push(data);
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.batch.length === 0) return;

    try {
      await apiClient.sendBatch(this.batch);
      this.batch = [];
    } catch (error) {
      logger.error('Batch send failed:', error);
    }
  }
}
```

---

## 🚀 Plano de Migração Econômica

### Fase 1: Setup Mínimo (Semana 1)
- [ ] Criar Resource Group
- [ ] App Service B1 (desenvolvimento)
- [ ] PostgreSQL B1ms (desenvolvimento)
- [ ] Application Insights básico

### Fase 2: Desenvolvimento (Semana 2-3)
- [ ] Consolidar frontend + backend
- [ ] Otimizar código para custos
- [ ] Implementar cache e batch processing
- [ ] Configurar logging econômico

### Fase 3: Testes (Semana 4)
- [ ] Testes de performance
- [ ] Validação de custos
- [ ] Ajustes de otimização
- [ ] Testes de conectividade

### Fase 4: Produção (Semana 5-6)
- [ ] Upgrade para S1 + GP_Gen5_2
- [ ] Deploy de produção
- [ ] Configurar data collector
- [ ] Monitoramento básico

### Fase 5: Otimização (Semana 7)
- [ ] Monitorar custos reais
- [ ] Ajustar configurações
- [ ] Implementar otimizações adicionais
- [ ] Documentar economia

---

## 📈 Monitoramento de Custos

### 1. **Azure Cost Management**
```bash
# Script para monitorar custos diários
#!/bin/bash
az consumption usage list \
  --billing-period-name $(date +%Y%m) \
  --query "[].{Resource:instanceName, Cost:pretaxCost}" \
  --output table
```

### 2. **Alertas de Custo**
- **Desenvolvimento**: Alerta em $60/mês
- **Produção**: Alerta em $150/mês
- **Crítico**: Alerta em $200/mês

### 3. **Otimizações Contínuas**
- Revisar custos semanalmente
- Identificar recursos subutilizados
- Ajustar tamanhos conforme necessário
- Implementar shutdown automático (desenvolvimento)

---

## 🎯 Benefícios da Versão Econômica

### ✅ **Redução de Custos**
- **62% menos custo** que versão original
- **Pay-as-you-scale** real
- **Sem recursos desnecessários**

### ✅ **Simplicidade**
- **Menos serviços** para gerenciar
- **Configuração mais simples**
- **Troubleshooting facilitado**

### ✅ **Performance Adequada**
- **Suficiente para 50-100 usuários**
- **Response time < 500ms**
- **Disponibilidade > 99%**

### ✅ **Escalabilidade Futura**
- **Fácil upgrade** quando necessário
- **Adicionar serviços** conforme demanda
- **Crescimento gradual**

---

## ⚠️ Limitações da Versão Econômica

### 🔸 **Performance**
- Menos recursos = menor throughput
- Sem CDN global = latência maior
- Cache limitado = mais queries ao banco

### 🔸 **Disponibilidade**
- Sem redundância automática
- Backup limitado (7 dias)
- Recovery time maior

### 🔸 **Monitoramento**
- Logs limitados (5GB/mês)
- Alertas básicos
- Menos visibilidade

### 🔸 **Segurança**
- Sem WAF avançado
- SSL básico do App Service
- Menos auditoria

---

## 🚀 Próximos Passos - Versão Econômica

### 1. **Aprovação da Versão Econômica**
- [ ] Revisar limitações vs. benefícios
- [ ] Validar se atende necessidades
- [ ] Aprovar orçamento ($50-150/mês)

### 2. **Implementação Gradual**
- [ ] Começar com desenvolvimento ($49/mês)
- [ ] Testar e validar
- [ ] Upgrade para produção quando necessário

### 3. **Monitoramento Contínuo**
- [ ] Acompanhar custos reais
- [ ] Ajustar conforme uso
- [ ] Planejar upgrades futuros

---

**Versão Econômica criada em**: $(date)  
**Economia estimada**: 60-70%  
**Custo mensal**: $50-150  
**Status**: Pronto para Aprovação  

---

*Esta versão econômica mantém todas as funcionalidades essenciais do sistema MES com custos significativamente reduzidos. Ideal para empresas que querem migrar para a nuvem com orçamento limitado.*