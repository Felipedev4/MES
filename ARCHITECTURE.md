# Arquitetura do Sistema MES

## Visão Geral

O Sistema MES (Manufacturing Execution System) é uma aplicação full-stack moderna projetada para gerenciar e monitorar processos de manufatura em tempo real, com integração a CLPs via protocolo Modbus.

## Arquitetura Técnica

### Diagrama de Arquitetura

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

## Tecnologias Utilizadas

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Tokens)
- **WebSocket:** Socket.io
- **Comunicação CLP:** jsmodbus
- **Validação:** Yup
- **Documentação:** Swagger/OpenAPI
- **Segurança:** Helmet, bcrypt, express-rate-limit

### Frontend

- **Framework:** React 18
- **Linguagem:** TypeScript
- **UI Library:** Material-UI (MUI)
- **Roteamento:** React Router v6
- **Formulários:** React Hook Form + Yup
- **Gráficos:** Chart.js + react-chartjs-2
- **HTTP Client:** Axios
- **WebSocket Client:** Socket.io-client
- **Notificações:** Notistack
- **Datas:** Moment.js

## Estrutura de Diretórios

```
MES/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Schema do banco de dados
│   │   └── seed.ts             # Dados iniciais
│   ├── src/
│   │   ├── config/             # Configurações (DB, Swagger)
│   │   ├── controllers/        # Controladores da API
│   │   ├── middleware/         # Middlewares (auth, validação)
│   │   ├── routes/             # Rotas da API
│   │   ├── services/           # Lógica de negócio
│   │   ├── utils/              # Utilitários
│   │   ├── validators/         # Schemas de validação
│   │   └── server.ts           # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── Layout/         # Layout principal
│   │   │   └── PrivateRoute.tsx
│   │   ├── contexts/           # React Contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── pages/              # Páginas da aplicação
│   │   ├── services/           # Serviços (API, WebSocket)
│   │   ├── types/              # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── README.md
├── INSTALL.md
└── ARCHITECTURE.md
```

## Fluxos de Dados

### 1. Fluxo de Autenticação

```
1. Usuário envia credenciais → POST /api/auth/login
2. Backend valida credenciais no banco
3. Backend gera token JWT
4. Frontend armazena token no localStorage
5. Frontend inclui token em todas as requisições (Authorization: Bearer)
```

### 2. Fluxo de Apontamento Automático

```
1. Operador seleciona ordem de produção
2. Operador inicia apontamento automático
3. Backend define ordem como ativa
4. Modbus Service inicia polling do registro D33 do CLP
5. CLP incrementa contador D33 a cada peça produzida
6. Modbus Service detecta mudança no contador
7. Production Service cria apontamento automático
8. Backend atualiza quantidade produzida na ordem
9. Backend emite evento via WebSocket
10. Frontend recebe evento e atualiza UI em tempo real
```

### 3. Fluxo de Dashboard em Tempo Real

```
1. Frontend carrega página de Dashboard
2. Frontend faz requisições REST para buscar KPIs
3. Frontend se conecta ao WebSocket
4. Backend emite eventos quando há atualizações (production:update)
5. Frontend recebe eventos e atualiza gráficos automaticamente
```

## Modelo de Dados

### Entidades Principais

```
User (Usuários)
├── id, email, password (hash), name, role, active

Item (Produtos/Materiais)
├── id, code, name, description, unit, active

Mold (Moldes/Ferramentas)
├── id, code, name, description, cavities, cycleTime, maintenanceDate

ProductionOrder (Ordens de Produção)
├── id, orderNumber, itemId, moldId
├── plannedQuantity, producedQuantity, rejectedQuantity
├── status, priority, dates, notes
└── Relacionamentos: item, mold, appointments, downtimes

ProductionAppointment (Apontamentos)
├── id, productionOrderId, userId
├── quantity, rejectedQuantity, timestamp
├── automatic, clpCounterValue, notes
└── Relacionamentos: productionOrder, user

Downtime (Paradas)
├── id, productionOrderId, type, reason
├── description, responsibleId
├── startTime, endTime, duration
└── Relacionamentos: productionOrder, responsible

PlcData (Dados do CLP)
└── id, registerD33, timestamp, connected, errorMessage
```

### Relacionamentos

```
User 1:N ProductionAppointment
User 1:N Downtime (as responsible)
Item 1:N ProductionOrder
Mold 1:N ProductionOrder
ProductionOrder 1:N ProductionAppointment
ProductionOrder 1:N Downtime
```

## Segurança

### Autenticação e Autorização

- **JWT:** Tokens com validade de 8 horas
- **Roles:** ADMIN, MANAGER, SUPERVISOR, OPERATOR
- **Middleware:** Verifica token em todas as rotas protegidas
- **Senhas:** Hash com bcrypt (salt rounds: 10)

### Proteções Implementadas

- **Helmet:** Headers de segurança HTTP
- **CORS:** Configurado para frontend específico
- **Rate Limiting:** 100 requisições por 15 minutos por IP
- **Validação:** Yup em todas as entradas de dados
- **SQL Injection:** Prevenido pelo Prisma ORM
- **XSS:** Sanitização automática do React

## Comunicação Modbus

### Protocolo

- **Tipo:** Modbus TCP
- **CLP:** Delta DVP-12SE
- **Registro:** D33 (Holding Register)
- **Função:** Leitura periódica (polling a cada 1 segundo)
- **Reconexão:** Automática a cada 10 segundos se desconectado

### Tratamento de Erros

- Timeout de 5 segundos
- Log de erros de comunicação
- Salvamento de status no banco
- Notificação via WebSocket de desconexões

## Performance e Escalabilidade

### Otimizações Implementadas

- **Conexão única ao banco:** Singleton do Prisma Client
- **Índices no banco:** Em campos de busca frequente (code, email)
- **WebSocket:** Para atualizações em tempo real (evita polling HTTP)
- **Lazy Loading:** Componentes React carregados sob demanda
- **Paginação:** Preparado para implementação em listagens grandes

### Limitações Atuais

- **Concorrência:** Uma ordem ativa por vez para apontamento automático
- **Escalabilidade horizontal:** Requer session store para Socket.io (Redis)
- **Backup:** Não implementado automaticamente

## Monitoramento e Logs

### Health Check

```
GET /health
```

Retorna status do servidor, banco de dados e conexão CLP.

### Logs do Sistema

- **Desenvolvimento:** Query logs do Prisma, logs detalhados
- **Produção:** Apenas errors e warnings

### Métricas Disponíveis

- OEE (Overall Equipment Effectiveness)
- Disponibilidade
- Performance
- Qualidade
- Taxa de rejeição
- Tempo total de paradas por tipo

## Deployment

### Desenvolvimento

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

### Produção

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Servir build/ com nginx ou servidor web
```

### Variáveis de Ambiente

Ver arquivos `.env.example` em cada pasta.

## Manutenção e Evolução

### Próximas Funcionalidades Sugeridas

1. **Relatórios:** Geração de relatórios PDF/Excel
2. **Múltiplos CLPs:** Suporte a vários CLPs simultâneos
3. **Manutenção:** Sistema de gestão de manutenção preventiva
4. **Qualidade:** Módulo de controle de qualidade avançado
5. **Mobile:** App mobile nativo para apontamento
6. **BI:** Integração com ferramentas de Business Intelligence
7. **Backup:** Sistema automático de backup
8. **Multi-tenant:** Suporte a múltiplas empresas/plantas

### Atualizações de Dependências

Executar periodicamente:

```bash
npm outdated
npm update
```

## Troubleshooting

### Problemas Comuns

1. **CLP não conecta:** Verificar IP, porta e firewall
2. **WebSocket desconecta:** Verificar configuração de proxy/nginx
3. **Erro de CORS:** Configurar FRONTEND_URL corretamente
4. **Performance lenta:** Adicionar índices no banco, otimizar queries

## Contato e Suporte

Para questões técnicas, consulte:
- README.md
- INSTALL.md
- Documentação Swagger (/api-docs)


