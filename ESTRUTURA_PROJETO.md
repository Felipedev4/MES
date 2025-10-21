# 📁 Estrutura do Projeto MES

## 📋 Visão Geral

Este documento descreve a estrutura completa do projeto MES (Manufacturing Execution System) após a implementação da separação da captação de dados do CLP e a adição de novos módulos de cadastros.

---

## 🗂️ Estrutura de Diretórios

```
MES/
├── 📄 Documentação Raiz
│   ├── README.md                          # Documentação principal
│   ├── QUICKSTART.md                      # Guia rápido de início
│   ├── INSTALL.md                         # Instruções de instalação
│   ├── CONTRIBUTING.md                    # Guia de contribuição
│   ├── API_DOCUMENTATION.md               # Documentação da API
│   ├── ARCHITECTURE.md                    # Arquitetura do sistema
│   ├── ARCHITECTURE_PROPOSAL.md           # ⭐ Proposta de arquitetura (NOVO)
│   ├── DEPLOYMENT_GUIDE.md                # ⭐ Guia de deployment (NOVO)
│   ├── README_SEPARACAO_CAPTACAO.md       # ⭐ Documentação da separação (NOVO)
│   ├── SUMARIO_EXECUTIVO.md               # ⭐ Sumário executivo (NOVO)
│   ├── INDICE_ARQUIVOS.md                 # ⭐ Índice de arquivos (NOVO)
│   └── ESTRUTURA_PROJETO.md               # ⭐ Este arquivo (NOVO)
│
├── 🔧 backend/                             # Aplicação Backend (API REST)
│   ├── package.json                       # Dependências do backend
│   ├── tsconfig.json                      # Configuração TypeScript
│   ├── MIGRATION_GUIDE.md                 # Guia de migração
│   ├── MIGRATION_SCRIPT.sql               # ⭐ Script de migração SQL (NOVO)
│   │
│   ├── 🗄️ prisma/                         # Prisma ORM
│   │   ├── schema.prisma                  # ⭐ Schema do banco (MODIFICADO)
│   │   ├── seed.ts                        # Script de seed
│   │   └── migrations/                    # Migrações do banco
│   │       ├── migration_lock.toml
│   │       └── [várias migrações]
│   │
│   └── 📂 src/                            # Código-fonte do backend
│       ├── server.ts                      # ⭐ Servidor principal (MODIFICADO)
│       │
│       ├── 📁 config/                     # Configurações
│       │   ├── database.ts                # Configuração do Prisma
│       │   └── swagger.ts                 # Configuração do Swagger
│       │
│       ├── 📁 controllers/                # Controladores (Lógica de negócio)
│       │   ├── authController.ts
│       │   ├── dashboardController.ts
│       │   ├── downtimeController.ts
│       │   ├── itemController.ts
│       │   ├── moldController.ts
│       │   ├── plcConfigController.ts
│       │   ├── productionController.ts
│       │   ├── productionOrderController.ts
│       │   ├── companyController.ts       # ⭐ NOVO - Empresas
│       │   ├── sectorController.ts        # ⭐ NOVO - Setores
│       │   ├── activityTypeController.ts  # ⭐ NOVO - Tipos de Atividade
│       │   ├── defectController.ts        # ⭐ NOVO - Defeitos
│       │   └── referenceTypeController.ts # ⭐ NOVO - Tipos de Referência
│       │
│       ├── 📁 middleware/                 # Middlewares
│       │   ├── auth.ts                    # Autenticação JWT
│       │   ├── errorHandler.ts            # Tratamento de erros
│       │   └── validator.ts               # Validação de requisições
│       │
│       ├── 📁 routes/                     # Rotas da API
│       │   ├── authRoutes.ts
│       │   ├── dashboardRoutes.ts
│       │   ├── downtimeRoutes.ts
│       │   ├── itemRoutes.ts
│       │   ├── moldRoutes.ts
│       │   ├── plcConfigRoutes.ts
│       │   ├── productionOrderRoutes.ts
│       │   ├── productionRoutes.ts
│       │   ├── companyRoutes.ts           # ⭐ NOVO - Rotas de Empresas
│       │   ├── sectorRoutes.ts            # ⭐ NOVO - Rotas de Setores
│       │   ├── activityTypeRoutes.ts      # ⭐ NOVO - Rotas de Tipos de Atividade
│       │   ├── defectRoutes.ts            # ⭐ NOVO - Rotas de Defeitos
│       │   └── referenceTypeRoutes.ts     # ⭐ NOVO - Rotas de Tipos de Referência
│       │
│       ├── 📁 services/                   # Serviços de negócio
│       │   ├── modbusService.ts           # Serviço Modbus
│       │   └── productionService.ts       # Serviço de produção
│       │
│       ├── 📁 utils/                      # Utilitários
│       │   ├── hash.ts                    # Funções de hash
│       │   └── jwt.ts                     # Funções JWT
│       │
│       └── 📁 validators/                 # Validadores Yup
│           ├── authValidator.ts
│           ├── downtimeValidator.ts
│           ├── itemValidator.ts
│           ├── moldValidator.ts
│           ├── plcConfigValidator.ts
│           ├── productionOrderValidator.ts
│           ├── companyValidator.ts        # ⭐ NOVO - Validador de Empresas
│           ├── sectorValidator.ts         # ⭐ NOVO - Validador de Setores
│           ├── activityTypeValidator.ts   # ⭐ NOVO - Validador de Tipos de Atividade
│           ├── defectValidator.ts         # ⭐ NOVO - Validador de Defeitos
│           └── referenceTypeValidator.ts  # ⭐ NOVO - Validador de Tipos de Referência
│
├── 🎨 frontend/                            # Aplicação Frontend (React + TypeScript)
│   ├── package.json                       # Dependências do frontend
│   ├── tsconfig.json                      # Configuração TypeScript
│   │
│   ├── 📁 public/                         # Arquivos públicos
│   │   └── index.html                     # HTML principal
│   │
│   └── 📂 src/                            # Código-fonte do frontend
│       ├── App.tsx                        # ⭐ Componente principal (MODIFICADO)
│       ├── index.tsx                      # Entry point
│       │
│       ├── 📁 components/                 # Componentes reutilizáveis
│       │   ├── Layout/
│       │   │   ├── Layout.tsx
│       │   │   └── MenuItems.tsx          # ⭐ Menu de navegação (MODIFICADO)
│       │   └── PrivateRoute.tsx           # Rota protegida
│       │
│       ├── 📁 contexts/                   # Contextos React
│       │   ├── AuthContext.tsx            # Contexto de autenticação
│       │   └── SocketContext.tsx          # Contexto de WebSocket
│       │
│       ├── 📁 pages/                      # Páginas da aplicação
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Production.tsx
│       │   ├── ProductionOrders.tsx
│       │   ├── Downtimes.tsx
│       │   ├── Items.tsx
│       │   ├── Molds.tsx
│       │   ├── PlcConfig.tsx
│       │   ├── Companies.tsx              # ⭐ NOVO - Página de Empresas
│       │   ├── Sectors.tsx                # ⭐ NOVO - Página de Setores
│       │   ├── ActivityTypes.tsx          # ⭐ NOVO - Página de Tipos de Atividade
│       │   ├── Defects.tsx                # ⭐ NOVO - Página de Defeitos
│       │   └── ReferenceTypes.tsx         # ⭐ NOVO - Página de Tipos de Referência
│       │
│       ├── 📁 services/                   # Serviços de comunicação
│       │   ├── api.ts                     # Cliente Axios
│       │   ├── authService.ts             # Serviço de autenticação
│       │   ├── plcConfigService.ts        # Serviço de configuração PLC
│       │   └── socketService.ts           # Serviço de WebSocket
│       │
│       └── 📁 types/                      # Definições de tipos TypeScript
│           └── index.ts                   # ⭐ Tipos do sistema (MODIFICADO)
│
└── 🤖 data-collector/                      # ⭐ NOVO - Serviço de Coleta de Dados
    ├── package.json                       # ⭐ NOVO - Dependências do coletor
    ├── tsconfig.json                      # ⭐ NOVO - Configuração TypeScript
    ├── .env.example                       # ⭐ NOVO - Variáveis de ambiente exemplo
    ├── README.md                          # ⭐ NOVO - Documentação do coletor
    ├── data-collector.service             # ⭐ NOVO - Serviço systemd
    │
    └── 📂 src/                            # ⭐ NOVO - Código-fonte do coletor
        ├── index.ts                       # ⭐ NOVO - Entry point
        │
        ├── 📁 config/                     # ⭐ NOVO - Configurações
        │   └── database.ts                # ⭐ NOVO - Configuração do Prisma
        │
        ├── 📁 services/                   # ⭐ NOVO - Serviços do coletor
        │   ├── PlcConnection.ts           # ⭐ NOVO - Conexão individual com PLC
        │   ├── PlcPoolManager.ts          # ⭐ NOVO - Gerenciador de pool de PLCs
        │   ├── ProductionMonitor.ts       # ⭐ NOVO - Monitor de produção
        │   └── HealthCheck.ts             # ⭐ NOVO - Health check HTTP
        │
        └── 📁 utils/                      # ⭐ NOVO - Utilitários
            └── logger.ts                  # ⭐ NOVO - Logger Winston
```

---

## 🎯 Componentes Principais

### 1️⃣ **Backend API** (`backend/`)
- **Função**: API REST para gerenciamento do sistema MES
- **Stack**: Node.js + Express + TypeScript + Prisma
- **Responsabilidades**:
  - Autenticação e autorização (JWT)
  - CRUD de entidades (Empresas, Setores, Itens, Moldes, etc.)
  - Gerenciamento de ordens de produção
  - Dashboard e relatórios
  - WebSocket para atualizações em tempo real
  - Configuração de CLPs

### 2️⃣ **Data Collector** (`data-collector/`) ⭐ **NOVO**
- **Função**: Serviço independente para captação de dados dos CLPs
- **Stack**: Node.js + TypeScript + Prisma + jsmodbus
- **Responsabilidades**:
  - Conexão Modbus TCP com múltiplos CLPs
  - Polling de registradores em intervalos configuráveis
  - Detecção de mudanças nos valores
  - Persistência de dados na tabela `plc_data`
  - Criação automática de apontamentos de produção
  - Health check HTTP
  - Logs estruturados com Winston

### 3️⃣ **Frontend Web** (`frontend/`)
- **Função**: Interface web do sistema MES
- **Stack**: React + TypeScript + Material-UI
- **Responsabilidades**:
  - Interface de usuário responsiva
  - Cadastros e consultas
  - Dashboard em tempo real
  - Gerenciamento de produção
  - Configuração do sistema

---

## 🗃️ Banco de Dados (PostgreSQL)

### Modelos Principais

#### ⭐ **Novos Modelos Criados**:
1. **Company** - Empresas/Filiais
2. **Sector** - Setores produtivos
3. **ActivityType** - Tipos de atividades/paradas
4. **Defect** - Cadastro de defeitos
5. **ReferenceType** - Tipos de referência de itens
6. **ProductionDefect** - Relação de defeitos em ordens de produção

#### 📝 **Modelos Modificados**:
- **Item**: Adicionado `referenceTypeId`
- **ProductionOrder**: Adicionado `companyId`, `sectorId`, `productionDefects`
- **Downtime**: Adicionado `activityTypeId`
- **PlcConfig**: Adicionado `sectorId`

#### 🔧 **Modelos Existentes**:
- User
- Item
- Mold
- ProductionOrder
- Production
- Downtime
- PlcData
- PlcConfig

---

## 🔗 Fluxo de Dados

```
┌─────────────────┐
│  Raspberry Pi   │
│ Data Collector  │
│                 │
│  - PlcPoolMgr   │
│  - ProdMonitor  │
└────────┬────────┘
         │
         │ Modbus TCP
         │
    ┌────▼─────┐
    │   CLPs   │
    │ (IPs DB) │
    └──────────┘
         │
         │ Salva dados
         │
    ┌────▼────────────┐
    │   PostgreSQL    │
    │  - plc_data     │
    │  - plc_config   │
    │  - production   │
    └────┬────────────┘
         │
         │ REST API + WebSocket
         │
    ┌────▼─────────┐
    │   Backend    │
    │   Express    │
    └────┬─────────┘
         │
         │ HTTP + WS
         │
    ┌────▼─────────┐
    │   Frontend   │
    │     React    │
    └──────────────┘
```

---

## 📚 Documentação Adicional

### 📄 Arquivos de Documentação

1. **ARCHITECTURE_PROPOSAL.md**
   - Arquitetura completa do sistema
   - Componentes e responsabilidades
   - Diagramas de fluxo

2. **DEPLOYMENT_GUIDE.md**
   - Instruções de instalação
   - Configuração do ambiente
   - Deploy no Raspberry Pi
   - Systemd service

3. **README_SEPARACAO_CAPTACAO.md**
   - Visão geral da solução
   - Como usar o Data Collector
   - Exemplos de configuração

4. **SUMARIO_EXECUTIVO.md**
   - Resumo executivo
   - Principais funcionalidades
   - Benefícios

5. **INDICE_ARQUIVOS.md**
   - Lista de todos os arquivos criados/modificados
   - Navegação rápida

---

## 🚀 Tecnologias Utilizadas

### Backend & Data Collector
- **Runtime**: Node.js 18+
- **Linguagem**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco**: PostgreSQL
- **Validação**: Yup
- **Autenticação**: JWT
- **WebSocket**: Socket.io
- **Modbus**: jsmodbus
- **Logs**: Winston

### Frontend
- **Framework**: React 18
- **Linguagem**: TypeScript
- **UI**: Material-UI (MUI)
- **HTTP**: Axios
- **WebSocket**: Socket.io-client

---

## 📊 Estatísticas do Projeto

### Arquivos Criados/Modificados

#### ⭐ Data Collector (Novo - 11 arquivos)
- 1 package.json
- 1 tsconfig.json
- 1 .env.example
- 1 README.md
- 1 systemd service
- 6 arquivos TypeScript

#### 🔧 Backend (Modificado - 25+ arquivos)
- 1 schema.prisma (modificado)
- 5 controllers (novos)
- 5 routes (novos)
- 5 validators (novos)
- 1 server.ts (modificado)
- 1 MIGRATION_SCRIPT.sql (novo)

#### 🎨 Frontend (Modificado - 8+ arquivos)
- 5 páginas (novas)
- 1 App.tsx (modificado)
- 1 MenuItems.tsx (modificado)
- 1 types/index.ts (modificado)

#### 📄 Documentação (Nova - 6 arquivos)
- ARCHITECTURE_PROPOSAL.md
- DEPLOYMENT_GUIDE.md
- README_SEPARACAO_CAPTACAO.md
- SUMARIO_EXECUTIVO.md
- INDICE_ARQUIVOS.md
- ESTRUTURA_PROJETO.md

### Total
- **≈ 50 arquivos** criados/modificados
- **5 novas entidades** no banco de dados
- **25 novos endpoints** REST
- **1 novo serviço** independente (Data Collector)

---

## 🎯 Próximos Passos Recomendados

1. ✅ Testar o backend após as correções
2. ✅ Executar migrações do Prisma
3. ✅ Testar endpoints das novas entidades
4. 🔄 Implementar as páginas do frontend
5. 🔄 Configurar e testar o Data Collector no Raspberry Pi
6. 🔄 Integração completa end-to-end
7. 🔄 Testes de carga e performance
8. 🔄 Documentação de API (Swagger)

---

## 📞 Suporte

Para mais informações, consulte:
- `README.md` - Documentação principal
- `DEPLOYMENT_GUIDE.md` - Guia de instalação
- `API_DOCUMENTATION.md` - Documentação da API

---

**Última Atualização**: {{ DATA_ATUAL }}
**Versão do Projeto**: 2.0.0
**Status**: Em Desenvolvimento ✨

