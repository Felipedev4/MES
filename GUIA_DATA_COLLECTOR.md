# 🤖 Guia Completo: Data Collector no Raspberry Pi 5

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Instalação](#instalação)
4. [Configuração](#configuração)
5. [Execução](#execução)
6. [Monitoramento](#monitoramento)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Data Collector** é um serviço independente que roda no Raspberry Pi 5 e é responsável por:

- ✅ **Conectar com múltiplos CLPs** via Modbus TCP
- ✅ **Fazer polling** de registradores configurados
- ✅ **Detectar mudanças** nos valores
- ✅ **Salvar dados** na tabela `plc_data`
- ✅ **Criar apontamentos** de produção automaticamente
- ✅ **Reconectar automaticamente** em caso de falha

### 📊 **Arquitetura**

```
┌─────────────────────────────────┐
│   Raspberry Pi 5                │
│                                 │
│  ┌─────────────────────┐       │
│  │  Data Collector     │       │
│  │                     │       │
│  │  • PlcPoolManager   │       │
│  │  • PlcConnection    │       │
│  │  • ProductionMonitor│       │
│  │  • HealthCheck      │       │
│  └──────────┬──────────┘       │
└─────────────┼───────────────────┘
              │
              │ Modbus TCP
              │
       ┌──────▼───────┐
       │    CLPs      │
       │ (múltiplos)  │
       └──────┬───────┘
              │
              │ Ethernet/Wifi
              │
       ┌──────▼────────────┐
       │   PostgreSQL      │
       │   (Servidor)      │
       └───────────────────┘
```

---

## 🔧 Pré-requisitos

### **No Raspberry Pi 5:**

```bash
# 1. Node.js 18+ e npm
node --version  # Deve ser v18.x ou superior
npm --version

# 2. Git
git --version

# 3. Conexão de rede
# - Ethernet ou WiFi funcionando
# - Acesso ao banco de dados PostgreSQL
# - Acesso aos CLPs via rede
```

### **No Servidor:**

```bash
# PostgreSQL rodando e acessível
# Porta 5432 aberta para conexões externas
# Usuário e senha configurados
```

---

## 📥 Instalação

### **Passo 1: Clonar o Repositório**

```bash
# No Raspberry Pi 5
cd ~
git clone https://github.com/seu-usuario/MES.git
cd MES/data-collector
```

### **Passo 2: Instalar Dependências**

```bash
npm install
```

**Dependências principais:**
- `@prisma/client` - ORM para PostgreSQL
- `jsmodbus` - Cliente Modbus TCP
- `winston` - Logger estruturado
- `dotenv` - Gerenciamento de variáveis de ambiente
- `express` - Health check HTTP
- `typescript` & `ts-node` - Suporte TypeScript

### **Passo 3: Gerar Prisma Client**

```bash
npx prisma generate
```

---

## ⚙️ Configuração

### **Passo 1: Criar arquivo `.env`**

```bash
cd data-collector
cp .env.example .env
nano .env
```

**Conteúdo do `.env`:**

```bash
# ============================================
# DATABASE CONFIGURATION
# ============================================
# URL do PostgreSQL (AJUSTE O IP DO SERVIDOR!)
DATABASE_URL="postgresql://postgres:sua_senha@192.168.1.10:5432/mes_db"

# ============================================
# LOGGING
# ============================================
# Níveis: error, warn, info, debug
LOG_LEVEL=info

# ============================================
# HEALTH CHECK
# ============================================
# Porta para o servidor de health check
HEALTH_CHECK_PORT=3002

# ============================================
# MODBUS SETTINGS (OPCIONAL)
# ============================================
# Essas configurações sobrescrevem as do banco
# Útil para testes. Comente para usar config do DB.

# PLC_HOST=192.168.1.100
# PLC_PORT=502
# PLC_UNIT_ID=1
# PLC_TIMEOUT=5000
# PLC_POLLING_INTERVAL=1000
# PLC_RECONNECT_INTERVAL=10000
```

### **Passo 2: Configurar CLPs no Banco de Dados**

Acesse o frontend (`http://seu-servidor:3000/plc-config`) e:

1. **Criar Configuração de CLP:**
   - Nome: `CLP Injetora 01`
   - Host: `192.168.1.100` (IP do CLP)
   - Porta: `502`
   - Setor: Selecione o setor
   - Intervalo de Polling: `1000` ms
   - **NÃO ATIVE AINDA**

2. **Adicionar Registros:**
   - Nome: `D33` (contador de produção)
   - Endereço: `33`
   - Tipo: `INT16`
   - Habilitado: ✅

3. **Ativar a Configuração:**
   - Clique no botão de ativar (✓)

### **Passo 3: Testar Conexão com o Banco**

```bash
# Ainda no diretório data-collector
npx prisma db pull

# Deve mostrar:
# ✅ Introspected 12 models and wrote them into prisma/schema.prisma
```

Se der erro:
- Verifique se o IP do servidor está correto
- Verifique se a porta 5432 está aberta no firewall
- Teste ping: `ping 192.168.1.10`

---

## 🚀 Execução

### **Modo Desenvolvimento (com logs):**

```bash
npm run dev
```

**Saída esperada:**
```
[2025-10-21 16:30:00] [info]: 🚀 Iniciando MES Data Collector...
[2025-10-21 16:30:00] [info]: ✅ Conectado ao banco de dados PostgreSQL
[2025-10-21 16:30:01] [info]: 🔌 PlcPoolManager: Carregando configurações ativas...
[2025-10-21 16:30:01] [info]: ✅ CLP 'CLP Injetora 01' adicionado ao pool
[2025-10-21 16:30:01] [info]: 🔌 Conectando ao CLP CLP Injetora 01 em 192.168.1.100:502...
[2025-10-21 16:30:02] [info]: ✅ Conectado ao CLP CLP Injetora 01
[2025-10-21 16:30:02] [info]: 🔍 Iniciando polling de 1 registros...
[2025-10-21 16:30:02] [info]: 🏥 Health check rodando em http://0.0.0.0:3002
[2025-10-21 16:30:03] [info]: 📊 D33: 0 (sem mudança)
[2025-10-21 16:30:04] [info]: 📊 D33: 15 → 16 (+1) ✅ Salvo no banco
```

### **Modo Produção (em background):**

#### **Opção 1: PM2 (Recomendado)**

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar o data-collector
pm2 start npm --name "mes-data-collector" -- run dev

# Ver logs
pm2 logs mes-data-collector

# Parar
pm2 stop mes-data-collector

# Reiniciar
pm2 restart mes-data-collector

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

#### **Opção 2: Systemd Service**

```bash
# Copiar o arquivo de serviço
sudo cp mes-data-collector.service /etc/systemd/system/

# Editar o arquivo (ajustar caminhos se necessário)
sudo nano /etc/systemd/system/mes-data-collector.service

# Recarregar systemd
sudo systemctl daemon-reload

# Iniciar o serviço
sudo systemctl start mes-data-collector

# Verificar status
sudo systemctl status mes-data-collector

# Ver logs
sudo journalctl -u mes-data-collector -f

# Habilitar para iniciar no boot
sudo systemctl enable mes-data-collector
```

**Conteúdo do `mes-data-collector.service`:**

```ini
[Unit]
Description=MES Data Collector Service
After=network.target postgresql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/MES/data-collector
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=mes-data-collector

[Install]
WantedBy=multi-user.target
```

---

## 📊 Monitoramento

### **Health Check Endpoint**

```bash
# Verificar se o serviço está rodando
curl http://localhost:3002/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2025-10-21T16:30:00.000Z",
  "uptime": 3600,
  "database": {
    "connected": true
  },
  "plcs": [
    {
      "id": 1,
      "name": "CLP Injetora 01",
      "connected": true,
      "lastPoll": "2025-10-21T16:29:55.000Z"
    }
  ]
}
```

### **Logs**

```bash
# PM2
pm2 logs mes-data-collector --lines 100

# Systemd
sudo journalctl -u mes-data-collector -f -n 100

# Desenvolvimento
# Os logs aparecem diretamente no terminal
```

### **Dashboard no Backend**

Acesse: `http://seu-servidor:3000/dashboard`

Você verá:
- 📊 Gráfico de produção em tempo real
- 🔌 Status de conexão dos CLPs
- 📈 Histórico de dados coletados

---

## 🐛 Troubleshooting

### **Problema 1: Não conecta ao banco de dados**

```bash
❌ Error: connect ECONNREFUSED 192.168.1.10:5432
```

**Solução:**
```bash
# 1. Verificar se o servidor está acessível
ping 192.168.1.10

# 2. Testar porta do PostgreSQL
nc -zv 192.168.1.10 5432

# 3. Verificar firewall no servidor
# No servidor PostgreSQL:
sudo ufw allow 5432/tcp

# 4. Verificar pg_hba.conf
# No servidor PostgreSQL (/etc/postgresql/*/main/pg_hba.conf):
# Adicionar linha:
host    all             all             192.168.1.0/24          md5

# 5. Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### **Problema 2: Não conecta ao CLP**

```bash
❌ Erro ao conectar com CLP: ETIMEDOUT
```

**Solução:**
```bash
# 1. Verificar se o CLP está acessível
ping 192.168.1.100

# 2. Testar porta Modbus
nc -zv 192.168.1.100 502

# 3. Verificar configuração no banco
# - IP correto?
# - Porta correta? (geralmente 502)
# - Unit ID correto?

# 4. Testar com ferramenta Modbus
# Instalar modbus-cli:
sudo npm install -g modbus-cli

# Ler registro:
modbus read 192.168.1.100:502 40033 1
```

### **Problema 3: Serviço não inicia**

```bash
# PM2
pm2 logs mes-data-collector --err

# Systemd
sudo journalctl -u mes-data-collector -xe

# Verificar:
# - NODE_ENV está setado?
# - Permissões do diretório
# - node_modules instalados?
```

### **Problema 4: Muitos logs/Alto uso de CPU**

**Solução:**
```bash
# Aumentar intervalo de polling
# No banco, editar PlcConfig:
pollingInterval: 5000  # De 1000ms para 5000ms

# Reduzir nível de log
# No .env:
LOG_LEVEL=warn  # Em vez de info
```

---

## 🔄 Desabilitar Polling do Backend

Como agora o **Data Collector** está fazendo o polling, você pode desabilitar no backend:

### **Opção 1: Comentar Código**

**Arquivo:** `backend/src/server.ts`

```typescript
// Comentar essas linhas:
// await modbusService.initialize();
// console.log('✅ Serviço Modbus inicializado');
```

### **Opção 2: Variável de Ambiente**

**Arquivo:** `backend/.env`

```bash
# Adicionar:
DISABLE_MODBUS_POLLING=true
```

**Arquivo:** `backend/src/server.ts`

```typescript
// Modificar:
if (!process.env.DISABLE_MODBUS_POLLING) {
  await modbusService.initialize();
  console.log('✅ Serviço Modbus inicializado');
}
```

---

## 📊 Fluxo Completo

```
1. Raspberry Pi liga e inicia o Data Collector (systemd/PM2)
   ↓
2. Data Collector conecta ao PostgreSQL
   ↓
3. Carrega configurações ativas de CLPs
   ↓
4. Conecta com cada CLP via Modbus TCP
   ↓
5. Inicia polling dos registros configurados
   ↓
6. Detecta mudanças nos valores
   ↓
7. Salva na tabela plc_data
   ↓
8. ProductionMonitor verifica ordens ativas
   ↓
9. Cria apontamento de produção se houver ordem ativa
   ↓
10. Backend notifica frontend via WebSocket
    ↓
11. Dashboard atualiza em tempo real
```

---

## 🎯 Comandos Úteis

### **Desenvolvimento:**
```bash
npm run dev              # Rodar em modo desenvolvimento
npm run build            # Compilar TypeScript
npm start                # Rodar versão compilada
```

### **PM2:**
```bash
pm2 start mes-data-collector
pm2 stop mes-data-collector
pm2 restart mes-data-collector
pm2 logs mes-data-collector
pm2 monit                # Dashboard interativo
```

### **Systemd:**
```bash
sudo systemctl start mes-data-collector
sudo systemctl stop mes-data-collector
sudo systemctl restart mes-data-collector
sudo systemctl status mes-data-collector
sudo journalctl -u mes-data-collector -f
```

### **Database:**
```bash
npx prisma studio        # Interface visual do banco
npx prisma db pull       # Sincronizar schema
npx prisma generate      # Regerar client
```

---

## ✅ Checklist de Produção

Antes de colocar em produção, verifique:

- [ ] PostgreSQL configurado e acessível
- [ ] Firewall liberado (porta 5432)
- [ ] CLPs acessíveis via rede
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Health check respondendo (`curl localhost:3002/health`)
- [ ] Serviço configurado no systemd ou PM2
- [ ] Auto-start configurado
- [ ] Monitoramento configurado
- [ ] Logs sendo salvos
- [ ] Backup do banco configurado

---

## 📞 Suporte

Para mais informações:
- Documentação: `README_SEPARACAO_CAPTACAO.md`
- Arquitetura: `ARCHITECTURE_PROPOSAL.md`
- Deployment: `DEPLOYMENT_GUIDE.md`

---

**Status**: ✅ Pronto para Produção  
**Última Atualização**: 21/10/2025  
**Versão**: 2.0.0

