# Guia de Instalação - Sistema MES

## Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter instalado:

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **PostgreSQL** 14 ou superior ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))
- **npm** ou **yarn** (incluído com Node.js)

## Passo 1: Configurar o Banco de Dados

### 1.1. Instalar PostgreSQL

1. Baixe e instale o PostgreSQL
2. Durante a instalação, defina uma senha para o usuário `postgres`
3. Anote a porta (padrão: 5432)

### 1.2. Criar Banco de Dados

Abra o pgAdmin ou use o terminal:

```sql
CREATE DATABASE mes_db;
```

Ou via terminal:

```bash
psql -U postgres
CREATE DATABASE mes_db;
\q
```

## Passo 2: Configurar o Backend

### 2.1. Navegar para a pasta do backend

```bash
cd C:\Empresas\Desenvolvimento\MES\backend
```

### 2.2. Instalar dependências

```bash
npm install
```

### 2.3. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:

```env
# Database
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/mes_db"

# JWT
JWT_SECRET="MES_SECRET_KEY_2025_CHANGE_THIS_IN_PRODUCTION"
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

**Importante:** 
- Substitua `SUA_SENHA` pela senha do PostgreSQL 
- Substitua `192.168.1.100` pelo IP do seu CLP
- `MODBUS_POLLING_INTERVAL`: Define o intervalo (em milissegundos) de leitura do registro D33 do CLP
  - Valores menores = atualização mais rápida (maior carga no CLP)
  - Valores maiores = atualização mais lenta (menor carga no CLP)
  - Padrão: 1000ms (1 segundo)
  - Recomendado: 500ms a 2000ms dependendo da velocidade de produção

### 2.4. Executar migrations do Prisma

```bash
npx prisma migrate dev --name init
```

### 2.5. Popular banco com dados iniciais (seed)

```bash
npx prisma db seed
```

### 2.6. Iniciar o backend

```bash
npm run dev
```

O servidor backend estará rodando em `http://localhost:3001`

## Passo 3: Configurar o Frontend

### 3.1. Abrir novo terminal e navegar para pasta do frontend

```bash
cd C:\Empresas\Desenvolvimento\MES\frontend
```

### 3.2. Instalar dependências

```bash
npm install
```

### 3.3. Configurar variáveis de ambiente

Crie um arquivo `.env` na pasta `frontend`:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=http://localhost:3001
```

### 3.4. Iniciar o frontend

```bash
npm start
```

O frontend será aberto automaticamente em `http://localhost:3000`

## Passo 4: Configurar o CLP (Opcional)

Se você tiver um CLP DVP-12SE disponível:

### 4.1. Configurar comunicação Modbus

1. Configure o CLP para comunicação Modbus TCP
2. Anote o endereço IP do CLP
3. Configure o registro D33 no CLP para contagem de peças
4. Atualize o arquivo `.env` do backend com o IP correto

### 4.2. Testar conexão

1. Acesse o sistema MES
2. Faça login
3. Vá para a página "Produção"
4. Verifique o status de conexão do CLP

## Passo 5: Acessar o Sistema

### 5.1. Fazer login

Acesse `http://localhost:3000` e faça login com:

- **Administrador:**
  - Email: `admin@mes.com`
  - Senha: `admin123`

- **Operador:**
  - Email: `operator@mes.com`
  - Senha: `operator123`

### 5.2. Documentação da API

A documentação Swagger está disponível em:
```
http://localhost:3001/api-docs
```

## Passo 6: Verificar Instalação

### 6.1. Health Check

Acesse `http://localhost:3001/health` para verificar o status do servidor.

### 6.2. Testar funcionalidades

1. **Dashboard:** Verifique os KPIs e gráficos
2. **Cadastros:** Crie itens, moldes e ordens de produção
3. **Produção:** Teste apontamento manual
4. **Paradas:** Registre uma parada

## Solução de Problemas

### Erro de conexão com banco de dados

- Verifique se o PostgreSQL está rodando
- Confirme a senha e porta no arquivo `.env`
- Execute `npx prisma db push` para forçar sincronização

### CLP não conecta

- Verifique o endereço IP do CLP
- Confirme que o CLP está acessível na rede
- Verifique se o Modbus TCP está habilitado no CLP
- O sistema continuará funcionando sem CLP (apontamento manual)

### Porta já em uso

- Backend: Altere `PORT` no `.env` do backend
- Frontend: Use `PORT=3001 npm start` (ou outra porta)

### Erro ao instalar dependências

```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules
npm install
```

## Build para Produção

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

Os arquivos compilados estarão em `frontend/build`

## Próximos Passos

1. Configure HTTPS para produção
2. Ajuste as configurações de segurança do JWT
3. Configure backup automático do banco de dados
4. Personalize os KPIs e relatórios conforme necessário
5. Configure integração com seu CLP real

## Suporte

Para dúvidas ou problemas, consulte:
- README.md principal
- Documentação da API (Swagger)
- Logs do servidor (`backend/*.log`)


