# 🚀 Início Rápido: Data Collector

## ⚡ Teste Local (Antes de colocar no Raspberry Pi)

### **Passo 1: Configurar Variáveis de Ambiente**

```powershell
cd data-collector

# Criar arquivo .env
@"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mes_db"
LOG_LEVEL=info
HEALTH_CHECK_PORT=3002
"@ | Out-File -FilePath .env -Encoding UTF8
```

### **Passo 2: Instalar Dependências**

```powershell
npm install
```

### **Passo 3: Gerar Prisma Client**

```powershell
npx prisma generate
```

### **Passo 4: Iniciar Data Collector**

```powershell
npm run dev
```

**✅ Saída Esperada:**
```
[2025-10-21 16:30:00] [info]: 🚀 Iniciando MES Data Collector...
[2025-10-21 16:30:00] [info]: ✅ Conectado ao banco de dados PostgreSQL
[2025-10-21 16:30:01] [info]: 🔌 PlcPoolManager: Carregando configurações ativas...
[2025-10-21 16:30:01] [info]: ✅ CLP 'CLP Principal - DVP-12SE' adicionado ao pool
[2025-10-21 16:30:01] [info]: 🔌 Conectando ao CLP CLP Principal - DVP-12SE em 192.168.1.15:502...
[2025-10-21 16:30:02] [info]: 🏥 Health check rodando em http://0.0.0.0:3002
```

### **Passo 5: Testar Health Check**

Em outro terminal:

```powershell
curl http://localhost:3002/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-21T16:30:00.000Z",
  "uptime": 60,
  "database": {
    "connected": true
  },
  "plcs": [
    {
      "id": 1,
      "name": "CLP Principal - DVP-12SE",
      "connected": true,
      "lastPoll": "2025-10-21T16:29:55.000Z"
    }
  ]
}
```

---

## 🔧 Agora vs Backend

### **Diferenças:**

| Aspecto | Backend (Atual) | Data Collector (Novo) |
|---------|----------------|----------------------|
| **Onde Roda** | Servidor Principal | Raspberry Pi 5 |
| **Função** | API REST + Modbus | Apenas Modbus |
| **Porta** | 3001 | N/A (sem API REST) |
| **Health Check** | N/A | Porta 3002 |
| **Objetivo** | Servir Frontend | Coletar dados CLPs |
| **Escalabilidade** | Limitada | Alta (1 RPi por CLP) |

### **O que fazer:**

1. ✅ **Manter Backend rodando** - Serve o frontend
2. ✅ **Desabilitar Modbus no Backend** - Evita duplicação
3. ✅ **Rodar Data Collector** - Coleta dados

---

## 📝 Desabilitar Modbus no Backend

### **Arquivo:** `backend/src/server.ts`

**Encontre estas linhas (≈ linha 170):**
```typescript
// Inicializar serviço Modbus
await modbusService.initialize();
console.log('✅ Serviço Modbus inicializado');
```

**Comente-as:**
```typescript
// Inicializar serviço Modbus (DESABILITADO - usando Data Collector)
// await modbusService.initialize();
// console.log('✅ Serviço Modbus inicializado');
console.log('ℹ️ Modbus desabilitado - usando Data Collector externo');
```

**Reinicie o Backend:**
```powershell
# No terminal do backend, pressione Ctrl+C
# Depois execute:
npm run dev
```

---

## 🎯 Teste Completo

### **Terminal 1: Backend**
```powershell
cd backend
npm run dev
# Deve rodar na porta 3001
```

### **Terminal 2: Data Collector**
```powershell
cd data-collector
npm run dev
# Deve conectar aos CLPs
```

### **Terminal 3: Frontend**
```powershell
cd frontend
npm start
# Deve abrir em http://localhost:3000
```

### **Verificações:**

1. ✅ Backend responde em `http://localhost:3001/api/plc-config`
2. ✅ Data Collector health check em `http://localhost:3002/health`
3. ✅ Frontend carrega em `http://localhost:3000`
4. ✅ Dados chegam no dashboard em tempo real

---

## 🐛 Problemas Comuns

### **Erro: `EADDRINUSE: address already in use ::3002`**

O Data Collector já está rodando.

**Solução:**
```powershell
# Encontrar processo
netstat -ano | findstr :3002

# Matar processo (substitua XXXX pelo PID)
taskkill /PID XXXX /F
```

### **Erro: `Cannot find module '@prisma/client'`**

Prisma Client não foi gerado.

**Solução:**
```powershell
cd data-collector
npx prisma generate
```

### **Erro: `The table 'plc_configs' does not exist`**

Schema não sincronizado.

**Solução:**
```powershell
# No diretório backend (não data-collector!)
cd backend
npx prisma db push

# Depois regerar no data-collector
cd ../data-collector
npx prisma generate
```

### **Aviso: `CLP não conectou`**

CLP não está acessível.

**Normal se:**
- Você não tem um CLP físico conectado
- IP configurado não existe

**Teste com simulador:**
```powershell
# Instalar simulador Modbus
npm install -g modbus-server

# Rodar simulador
modbus-server --port 502
```

---

## 📊 Próximos Passos

### **Após testar localmente:**

1. ✅ **Preparar Raspberry Pi:**
   ```bash
   # No Raspberry Pi
   sudo apt update
   sudo apt install nodejs npm git postgresql-client
   ```

2. ✅ **Clonar Repositório:**
   ```bash
   cd ~
   git clone https://github.com/seu-repo/MES.git
   cd MES/data-collector
   ```

3. ✅ **Configurar `.env`:**
   ```bash
   nano .env
   # Ajustar DATABASE_URL com IP do servidor
   ```

4. ✅ **Instalar e Rodar:**
   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```

5. ✅ **Configurar Systemd:**
   ```bash
   sudo cp mes-data-collector.service /etc/systemd/system/
   sudo systemctl enable mes-data-collector
   sudo systemctl start mes-data-collector
   ```

---

## ✅ Checklist

- [ ] Backend rodando (porta 3001)
- [ ] Data Collector instalado
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas
- [ ] Prisma Client gerado
- [ ] Data Collector iniciado
- [ ] Health check respondendo (porta 3002)
- [ ] CLP conectado (ou simulador)
- [ ] Dados chegando no banco
- [ ] Dashboard atualizando em tempo real

---

**Documentação Completa:** `GUIA_DATA_COLLECTOR.md`  
**Arquitetura:** `ARCHITECTURE_PROPOSAL.md`  
**Deployment:** `DEPLOYMENT_GUIDE.md`

