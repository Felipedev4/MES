# 🚀 Análise de Migração para Azure - Sistema MES

## 📋 Resumo Executivo

Esta análise apresenta uma estratégia completa para migrar o Sistema MES (Manufacturing Execution System) para o Microsoft Azure, mantendo o **data_collector local** para comunicação com CLPs e movendo **frontend, backend e PostgreSQL** para a nuvem.

### 🎯 Objetivos da Migração
- **Disponibilidade**: 99.9% de uptime com redundância
- **Escalabilidade**: Crescimento automático conforme demanda
- **Segurança**: Proteção de dados industriais e conformidade
- **Manutenibilidade**: Operações simplificadas e monitoramento centralizado
- **Custo-otimização**: Pay-as-you-scale com recursos sob demanda

---

## 🏗️ Arquitetura Atual vs. Proposta

### Arquitetura Atual (On-Premises)
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Dashboard │  │Cadastros │  │ Produção │  │ Paradas │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │              │              │      │
│       └─────────────┴──────────────┴──────────────┘      │
│                          │                               │
│                    REST API + WebSocket                  │
└──────────────────────────┼───────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────┐
│                    Backend (Node.js)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Auth    │  │   CRUD   │  │Production│  │ Modbus  │ │
│  │Middleware│  │Controllers│  │ Service  │  │ Service │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
│       │             │              │              │      │
│       └─────────────┴──────────────┴──────────────┘      │
│                          │                       │       │
│                    Prisma ORM              Modbus TCP    │
└──────────────────────────┼───────────────────┼───────────┘
                           │                   │
                    ┌──────┴──────┐    ┌──────┴──────┐
                    │ PostgreSQL  │    │  CLP DVP-12SE│
                    └─────────────┘    └──────────────┘
```

### Arquitetura Proposta (Azure + Local)
```
┌─────────────────────────────────────────────────────────────────────────┐
│                        🌐 INTERNET                                      │
└─────────────────────────────┬───────────────────────────────────────────┘
                               │
┌─────────────────────────────┼───────────────────────────────────────────┐
│                    🏭 FÁBRICA (Local)                                   │
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
│                        ☁️ MICROSOFT AZURE                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Azure Front Door                             │    │
│  │              (CDN + WAF + Load Balancer)                       │    │
│  └─────────────────────┬───────────────────────────────────────────┘    │
│                        │                                               │
│  ┌─────────────────────┼───────────────────────────────────────────┐    │
│  │              Azure App Service (Frontend)                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐        │    │
│  │  │Dashboard │  │Cadastros │  │ Produção │  │ Paradas │        │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘        │    │
│  │       │             │              │              │             │    │
│  │       └─────────────┴──────────────┴──────────────┘             │    │
│  │                          │                                       │    │
│  │                    REST API + WebSocket                         │    │
│  └──────────────────────────┼───────────────────────────────────────┘    │
│                             │                                           │
│  ┌──────────────────────────┼───────────────────────────────────────┐    │
│  │              Azure App Service (Backend)                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐        │    │
│  │  │  Auth    │  │   CRUD   │  │Production│  │  Email  │        │    │
│  │  │Middleware│  │Controllers│  │ Service  │  │ Service │        │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬────┘        │    │
│  │       │             │              │              │             │    │
│  │       └─────────────┴──────────────┴──────────────┘             │    │
│  │                          │                                       │    │
│  │                    Prisma ORM                                    │    │
│  └──────────────────────────┼───────────────────────────────────────┘    │
│                             │                                           │
│  ┌──────────────────────────┼───────────────────────────────────────┐    │
│  │              Azure Database for PostgreSQL                      │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │              Flexible Server (HA)                      │    │    │
│  │  │  • Zone Redundant High Availability                    │    │    │
│  │  │  • Automated Backups                                   │    │    │
│  │  │  • Point-in-time Recovery                              │    │    │
│  │  │  • SSL/TLS Encryption                                  │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Azure Monitor                               │    │
│  │  • Application Insights                                       │    │
│  │  • Log Analytics                                              │    │
│  │  • Alerts & Notifications                                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Serviços Azure Necessários

### 1. **Azure App Service** (Frontend + Backend)
- **Tipo**: Linux App Service Plan (P1V2 ou superior)
- **Configuração**:
  - Frontend: Node.js 18+ com build automático
  - Backend: Node.js 18+ com PM2
  - Auto-scaling: 2-10 instâncias
  - Always On: Habilitado
- **Benefícios**:
  - Deploy automático via Git
  - SSL/TLS automático
  - Integração com Azure Monitor
  - Backup automático

### 2. **Azure Database for PostgreSQL**
- **Tipo**: Flexible Server
- **Configuração**:
  - Tier: Burstable (B2ms) para desenvolvimento, General Purpose (D2s_v3) para produção
  - Storage: 32GB inicial, auto-grow
  - Backup: 7 dias (desenvolvimento), 35 dias (produção)
  - High Availability: Zone Redundant
- **Benefícios**:
  - Gerenciamento automático
  - Backup e recovery automático
  - Monitoramento integrado
  - SSL/TLS nativo

### 3. **Azure Front Door**
- **Funcionalidades**:
  - CDN global para frontend
  - Web Application Firewall (WAF)
  - Load balancing
  - SSL/TLS termination
  - DDoS protection
- **Benefícios**:
  - Performance global
  - Segurança avançada
  - Redundância automática

### 4. **Azure Monitor + Application Insights**
- **Funcionalidades**:
  - Monitoramento de aplicação
  - Logs centralizados
  - Alertas personalizados
  - Dashboards em tempo real
  - Performance tracking
- **Benefícios**:
  - Visibilidade completa
  - Troubleshooting facilitado
  - Otimização contínua

### 5. **Azure Key Vault**
- **Funcionalidades**:
  - Armazenamento seguro de secrets
  - Rotação automática de chaves
  - Controle de acesso baseado em roles
- **Benefícios**:
  - Segurança de credenciais
  - Compliance
  - Auditoria completa

### 6. **Azure Storage Account**
- **Funcionalidades**:
  - Armazenamento de arquivos estáticos
  - Backup de dados
  - Logs de aplicação
- **Benefícios**:
  - Custo-efetivo
  - Durabilidade alta
  - Acesso global

---

## 🌐 Requisitos de Conectividade

### Data Collector (Local) → Azure
- **Protocolo**: HTTPS (porta 443)
- **Autenticação**: API Key + JWT
- **Requisitos de Rede**:
  - Conexão estável com internet (mín. 10 Mbps)
  - Firewall: Permitir HTTPS outbound
  - NAT: Não necessário (conexão outbound)
  - IP Fixo: Recomendado para whitelist

### Configuração de Rede Local
```bash
# Firewall (iptables)
iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 80 -j ACCEPT

# DNS
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
echo "nameserver 8.8.4.4" >> /etc/resolv.conf
```

### Configuração do Data Collector
```env
# data-collector/.env
BACKEND_API_URL=https://mes-backend.azurewebsites.net
API_KEY=your-secure-api-key-here
CONFIG_POLL_INTERVAL=30000
HEALTH_CHECK_PORT=3002
LOG_LEVEL=info
NODE_ENV=production

# Configurações de rede
NETWORK_TIMEOUT=30000
MAX_RETRIES=5
RETRY_DELAY=5000
```

---

## 🔐 Estratégia de Segurança

### 1. **Autenticação e Autorização**
- **JWT Tokens**: Rotação automática a cada 8 horas
- **API Keys**: Para comunicação Data Collector ↔ Backend
- **RBAC**: Controle de acesso baseado em roles
- **MFA**: Opcional para usuários administrativos

### 2. **Criptografia**
- **Em Trânsito**: TLS 1.3 para todas as comunicações
- **Em Repouso**: AES-256 para banco de dados
- **Secrets**: Azure Key Vault com rotação automática

### 3. **Rede e Firewall**
- **Azure Front Door**: WAF com regras personalizadas
- **NSG**: Network Security Groups restritivos
- **Private Endpoints**: Para banco de dados (opcional)
- **VPN/ExpressRoute**: Para conectividade híbrida (opcional)

### 4. **Monitoramento de Segurança**
- **Azure Security Center**: Análise de vulnerabilidades
- **Azure Sentinel**: SIEM para detecção de ameaças
- **Log Analytics**: Auditoria completa de acessos

---

## 💰 Estimativa de Custos (Mensal)

### Desenvolvimento/Teste
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| App Service (P1V2) | 1 instância | $73 |
| PostgreSQL (B2ms) | 2 vCores, 8GB RAM | $45 |
| Front Door | Standard | $15 |
| Application Insights | 5GB logs | $10 |
| Key Vault | Standard | $5 |
| Storage Account | LRS, 100GB | $2 |
| **Total** | | **$150** |

### Produção (Média)
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| App Service (P2V2) | 2 instâncias | $146 |
| PostgreSQL (D2s_v3) | 2 vCores, 8GB RAM | $90 |
| Front Door | Premium | $50 |
| Application Insights | 20GB logs | $40 |
| Key Vault | Standard | $5 |
| Storage Account | GRS, 500GB | $10 |
| **Total** | | **$341** |

### Produção (Alta Demanda)
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| App Service (P3V2) | 3 instâncias | $219 |
| PostgreSQL (D4s_v3) | 4 vCores, 16GB RAM | $180 |
| Front Door | Premium | $50 |
| Application Insights | 50GB logs | $100 |
| Key Vault | Standard | $5 |
| Storage Account | GRS, 1TB | $20 |
| **Total** | | **$574** |

---

## 📋 Plano de Migração

### Fase 1: Preparação (Semana 1-2)
- [ ] **Setup do Ambiente Azure**
  - Criar Resource Group
  - Configurar Azure Database for PostgreSQL
  - Configurar App Service Plans
  - Configurar Key Vault

- [ ] **Preparação do Código**
  - Atualizar variáveis de ambiente
  - Configurar CI/CD pipeline
  - Implementar health checks
  - Configurar logging estruturado

### Fase 2: Migração do Backend (Semana 3-4)
- [ ] **Deploy do Backend**
  - Migrar banco de dados
  - Deploy da API
  - Configurar SSL/TLS
  - Testes de conectividade

- [ ] **Configuração de Segurança**
  - Configurar API Keys
  - Implementar WAF rules
  - Configurar monitoramento
  - Testes de segurança

### Fase 3: Migração do Frontend (Semana 5)
- [ ] **Deploy do Frontend**
  - Build e deploy da aplicação React
  - Configurar CDN
  - Testes de performance
  - Configurar cache

### Fase 4: Configuração do Data Collector (Semana 6)
- [ ] **Atualização do Data Collector**
  - Atualizar URLs para Azure
  - Configurar HTTPS
  - Testes de conectividade
  - Monitoramento local

### Fase 5: Testes e Validação (Semana 7-8)
- [ ] **Testes Integrados**
  - Testes end-to-end
  - Testes de performance
  - Testes de failover
  - Validação de segurança

### Fase 6: Go-Live (Semana 9)
- [ ] **Migração de Produção**
  - Backup final dos dados
  - Migração em janela de manutenção
  - Validação pós-migração
  - Monitoramento 24/7

---

## 🔧 Configurações Técnicas Detalhadas

### 1. **Azure App Service Configuration**

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://mes_user:password@mes-postgres.postgres.database.azure.com:5432/mes_db?sslmode=require"

# Server
PORT=8080
NODE_ENV=production

# Frontend
FRONTEND_URL=https://mes-frontend.azurewebsites.net

# JWT
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=8h

# Data Collector
USE_EXTERNAL_DATA_COLLECTOR=true
DATA_COLLECTOR_API_KEY=your-secure-api-key

# Azure
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
```

#### Frontend (.env)
```env
REACT_APP_API_URL=https://mes-backend.azurewebsites.net
REACT_APP_WS_URL=wss://mes-backend.azurewebsites.net
REACT_APP_ENVIRONMENT=production
```

### 2. **Azure Database for PostgreSQL**

#### Configuração de Conexão
```typescript
// backend/src/config/database.ts
const databaseUrl = process.env.DATABASE_URL!;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
```

#### Configuração de SSL
```sql
-- Forçar SSL para todas as conexões
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = 'server.crt';
ALTER SYSTEM SET ssl_key_file = 'server.key';
SELECT pg_reload_conf();
```

### 3. **Data Collector (Local)**

#### Configuração de Rede
```typescript
// data-collector/src/services/ApiClient.ts
export class ApiClient {
  private baseURL: string;
  private apiKey: string;
  private timeout: number = 30000;
  private maxRetries: number = 5;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL.replace('http://', 'https://');
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: this.timeout,
    };

    // Implementar retry logic
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(url, config);
        return response.data;
      } catch (error) {
        if (attempt === this.maxRetries) throw error;
        
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
```

### 4. **Monitoramento e Alertas**

#### Application Insights
```typescript
// backend/src/config/monitoring.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();
```

#### Health Checks
```typescript
// backend/src/routes/healthRoutes.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      dataCollector: await checkDataCollector(),
    },
    version: process.env.npm_package_version,
  };

  res.status(200).json(health);
});
```

---

## 🚨 Plano de Contingência

### 1. **Rollback Strategy**
- **Backup Completo**: Antes da migração
- **DNS Switch**: Redirecionamento rápido
- **Data Sync**: Sincronização bidirecional durante transição
- **Monitoring**: Alertas em tempo real

### 2. **Disaster Recovery**
- **RTO**: 4 horas (Recovery Time Objective)
- **RPO**: 1 hora (Recovery Point Objective)
- **Backup**: Diário automático + Point-in-time recovery
- **Failover**: Automático para região secundária

### 3. **Comunicação de Emergência**
- **Canal Principal**: Teams/Slack com alertas automáticos
- **Canal Secundário**: Email + SMS
- **Escalação**: Nível 1 → Nível 2 → Nível 3
- **Documentação**: Runbooks atualizados

---

## 📊 Métricas de Sucesso

### 1. **Performance**
- **Tempo de Resposta**: < 200ms (95th percentile)
- **Disponibilidade**: > 99.9%
- **Throughput**: Suporte a 1000+ usuários simultâneos
- **Uptime**: 99.95% mensal

### 2. **Segurança**
- **Zero Breaches**: Nenhuma violação de segurança
- **Compliance**: 100% conformidade com políticas
- **Audit Logs**: 100% dos eventos auditados
- **Vulnerability**: Zero vulnerabilidades críticas

### 3. **Operacional**
- **Deploy Time**: < 10 minutos
- **MTTR**: < 30 minutos (Mean Time To Recovery)
- **MTBF**: > 720 horas (Mean Time Between Failures)
- **Automation**: 90% das operações automatizadas

---

## 🎯 Próximos Passos

### Imediato (Esta Semana)
1. **Aprovação do Plano**: Revisar e aprovar esta análise
2. **Setup Azure**: Criar conta e configurar recursos básicos
3. **POC**: Implementar prova de conceito com ambiente de teste

### Curto Prazo (Próximas 2 Semanas)
1. **Configuração Completa**: Implementar todos os serviços Azure
2. **Desenvolvimento**: Adaptar código para Azure
3. **Testes**: Validar funcionalidades em ambiente de teste

### Médio Prazo (Próximos 2 Meses)
1. **Migração Gradual**: Migrar ambiente por ambiente
2. **Treinamento**: Capacitar equipe para operação em Azure
3. **Otimização**: Ajustar configurações baseado em uso real

### Longo Prazo (Próximos 6 Meses)
1. **Expansão**: Adicionar funcionalidades avançadas
2. **Integração**: Conectar com outros sistemas
3. **Analytics**: Implementar Business Intelligence

---

## 📞 Suporte e Contatos

### Equipe Técnica
- **Arquiteto de Solução**: [Nome] - [email]
- **DevOps Engineer**: [Nome] - [email]
- **DBA**: [Nome] - [email]
- **Security Specialist**: [Nome] - [email]

### Suporte Azure
- **Portal**: https://portal.azure.com
- **Documentação**: https://docs.microsoft.com/azure
- **Suporte**: https://azure.microsoft.com/support
- **Status**: https://status.azure.com

---

**Documento criado em**: $(date)  
**Versão**: 1.0  
**Status**: Proposta para Aprovação  
**Próxima Revisão**: [Data + 1 semana]

---

*Esta análise foi desenvolvida com base na arquitetura atual do Sistema MES e nas melhores práticas do Microsoft Azure. Para dúvidas ou esclarecimentos, entre em contato com a equipe técnica.*