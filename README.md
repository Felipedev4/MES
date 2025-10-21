# Sistema MES (Manufacturing Execution System)

Sistema completo de Execução de Manufatura com integração de CLP, apontamento automático de produção e dashboards em tempo real.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Material-UI (MUI)** para interface moderna
- **Chart.js** e **react-chartjs-2** para gráficos interativos
- **Socket.io-client** para comunicação em tempo real
- **Axios** para requisições HTTP
- **Yup** para validação de formulários
- **React Router** para navegação
- **Moment.js** para manipulação de datas

### Backend
- **Node.js** com **Express** e TypeScript
- **Prisma ORM** para acesso ao banco de dados
- **PostgreSQL** como banco de dados
- **JWT** para autenticação e autorização
- **Socket.io** para WebSocket em tempo real
- **jsmodbus** para comunicação Modbus com CLP
- **Swagger** para documentação de API
- **bcrypt** para hash de senhas

## 📋 Funcionalidades

### 1. Módulos de Cadastro
- **Itens**: Cadastro completo de produtos/materiais
- **Ordens de Produção**: Gerenciamento de ordens com status e acompanhamento
- **Moldes**: Controle de moldes e ferramental

### 2. Registro de Paradas
- Paradas produtivas e improdutivas
- Data/hora de início e fim
- Motivo e responsável
- Filtragem, ordenação e exportação de dados

### 3. Integração CLP
- Coleta automática de dados de múltiplos CLPs
- Leitura de múltiplos registros via Modbus TCP
- Configuração dinâmica via frontend
- Gerenciamento de registros (D33, D34, etc)
- Intervalo de polling configurável
- Tratamento de exceções e reconexão automática
- Teste de conexão antes de salvar

### 4. Apontamento de Produção
- Apontamento automático baseado em dados do CLP
- Atualização em tempo real via WebSocket
- Interface simplificada com feedback visual

### 5. Dashboard em Tempo Real
- Gráficos interativos de produção
- KPIs principais (OEE, disponibilidade, performance, qualidade)
- Drill-down e drill-through nos dados
- Responsivo para desktop e mobile

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm/yarn
- PostgreSQL 14+
- Git

### 1. Clonar o Repositório
```bash
git clone <repositório>
cd MES
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Criar arquivo `.env` na pasta backend:
```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mes_db"

# JWT
JWT_SECRET="sua_chave_secreta_aqui_use_algo_seguro"
JWT_EXPIRES_IN="8h"

# Server
PORT=3001
NODE_ENV=development

# Modbus CLP Configuration
MODBUS_HOST=192.168.1.100
MODBUS_PORT=502
MODBUS_UNIT_ID=1
MODBUS_REGISTER_D33=33
MODBUS_TIMEOUT=5000
MODBUS_RECONNECT_INTERVAL=10000
MODBUS_POLLING_INTERVAL=1000

# CORS
FRONTEND_URL=http://localhost:3000
```

Executar migrations do banco:
```bash
npx prisma migrate dev
npx prisma generate
```

Iniciar servidor backend:
```bash
npm run dev
```

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

Criar arquivo `.env` na pasta frontend:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
```

Iniciar aplicação frontend:
```bash
npm start
```

## 📖 Documentação da API

A documentação completa da API está disponível via Swagger em:
```
http://localhost:3001/api-docs
```

## 🔐 Segurança

- Autenticação via JWT (JSON Web Tokens)
- Senhas criptografadas com bcrypt
- HTTPS recomendado para produção
- CORS configurado adequadamente
- Validação de dados em todas as requisições

## 📊 Estrutura do Projeto

```
MES/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações
│   │   ├── controllers/     # Controladores
│   │   ├── middleware/      # Middlewares (auth, validação)
│   │   ├── models/          # Modelos Prisma
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/           # Utilitários
│   │   ├── validators/      # Schemas de validação
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas
│   │   ├── services/        # Serviços API
│   │   ├── contexts/        # Contexts (Auth, etc)
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilitários
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build para Produção

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 🔌 Configuração do CLP

### Via Frontend (Recomendado)

1. Acesse o sistema como Admin ou Manager
2. Vá para "Configurações > CLP"
3. Clique em "Nova Configuração"
4. Preencha os dados do CLP:
   - Nome identificador
   - IP/Host do CLP
   - Porta (padrão: 502)
   - Unit ID (padrão: 1)
   - Intervalo de polling (recomendado: 1000ms)
5. Adicione os registros a serem monitorados:
   - D33: Contador de produção
   - D34: Contador de rejeitos
   - D35: Status da máquina
   - Etc...
6. Teste a conexão antes de salvar
7. Ative a configuração

### Via Variáveis de Ambiente (Fallback)

Configure no arquivo `.env` do backend:

```env
MODBUS_HOST=192.168.1.100
MODBUS_PORT=502
MODBUS_UNIT_ID=1
MODBUS_REGISTER_D33=33
MODBUS_POLLING_INTERVAL=1000
MODBUS_TIMEOUT=5000
MODBUS_RECONNECT_INTERVAL=10000
```

## 📝 Licença

Proprietary - Todos os direitos reservados

## 👥 Suporte

Para questões e suporte, entre em contato com a equipe de desenvolvimento.


