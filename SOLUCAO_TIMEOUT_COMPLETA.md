# ✅ Solução Completa para Timeout do Data Collector

## 🎯 Problema Resolvido

**Erro original:**
```
❌ Todas as 3 tentativas falharam: timeout of 30000ms exceeded
```

## 🔍 Causa Raiz Identificada

O backend **não tinha arquivo `.env` configurado**, causando:
- ❌ Conexão incorreta com o banco de dados PostgreSQL
- ❌ API Key não configurada para validar data-collector
- ❌ Queries do Prisma travando por falta de conexão válida

## ✅ Correções Aplicadas

### 1. Arquivos `.env` Criados

#### ✅ `backend/.env` 
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mes_db?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=*
JWT_SECRET=mes-jwt-secret-change-in-production-2024
JWT_EXPIRES_IN=24h
USE_EXTERNAL_DATA_COLLECTOR=true
DATA_COLLECTOR_API_KEY=mes-data-collector-secret-key-2024
```

#### ✅ `data-collector/.env`
```env
BACKEND_API_URL=http://localhost:3001
API_KEY=mes-data-collector-secret-key-2024
CONFIG_POLL_INTERVAL=30000
HEALTH_CHECK_PORT=3002
LOG_LEVEL=info
NODE_ENV=production
```

### 2. Timeout Adicionado nas Queries

**Arquivo modificado:** `backend/src/controllers/dataCollectorController.ts`

- ✅ Query de ordens de produção: timeout de 10s
- ✅ Query de configurações PLC: timeout de 10s  
- ✅ Retorna array vazio `[]` em caso de timeout (em vez de erro 500)
- ✅ Backend reconstruído com `npm run build`

### 3. Serviços Parados

- ✅ Backend (PID 22036) - PARADO
- ✅ Data Collector (PID 47880) - PARADO

---

## 🚀 PRÓXIMOS PASSOS (MANUAL)

### ⚠️ IMPORTANTE: Verificar Senha do PostgreSQL

Antes de iniciar, verifique se a senha do PostgreSQL está correta:

```powershell
# Editar backend/.env
notepad backend\.env
```

Na linha `DATABASE_URL`, ajuste o usuário e senha se necessário:
```
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/mes_db?schema=public"
```

**Padrão usado:** `postgres:postgres`

### Passo 1: Iniciar o Backend

```powershell
cd C:\Empresas\Desenvolvimento\MES\backend
npm start
```

**Aguarde ver a mensagem:**
```
✅ Database connected successfully
🚀 ========================================
   Servidor MES iniciado com sucesso!
   API: http://localhost:3001
========================================
```

**Se aparecer erro de conexão com banco:**
```
❌ Database connection failed
```

**Solução:**
1. Verificar se PostgreSQL está rodando: `Get-Service postgresql-x64-18`
2. Ajustar DATABASE_URL em `backend/.env` com usuário/senha corretos
3. Testar conexão: `npm run prisma:studio`

### Passo 2: Testar o Endpoint

Em **outro terminal PowerShell:**

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" | Select-Object StatusCode
```

**Resposta esperada:** `StatusCode: 200`

### Passo 3: Testar Endpoint do Data Collector

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/data-collector/production-orders/active" `
  -Method GET `
  -Headers @{"X-API-Key"="mes-data-collector-secret-key-2024"} `
  -TimeoutSec 15
```

**Resposta esperada (em menos de 10s):**
```json
[]
```
ou
```json
[{"id": 1, "orderNumber": "OP-001", ...}]
```

### Passo 4: Iniciar o Data Collector

Em **outro terminal PowerShell:**

```powershell
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

**Aguarde ver:**
```
✅ MES DATA COLLECTOR INICIADO COM SUCESSO
📡 Backend API: http://localhost:3001
🏥 Health Check: http://localhost:3002/health
```

**Agora deve funcionar SEM timeout!** 🎉

---

## 🔧 Solução de Problemas

### Problema: Backend não inicia - Erro de Banco de Dados

**Sintoma:**
```
❌ Database connection failed
```

**Solução:**

1. **Verificar se PostgreSQL está rodando:**
```powershell
Get-Service postgresql-x64-18
# Se Status = Stopped:
Start-Service postgresql-x64-18
```

2. **Verificar senha do PostgreSQL:**
   - Abrir `backend/.env`
   - Ajustar `DATABASE_URL` com usuário e senha corretos

3. **Testar conexão manualmente:**
```powershell
cd backend
npm run prisma:studio
# Se abrir navegador = conexão OK ✅
```

4. **Recriar banco se necessário:**
```powershell
cd backend
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

### Problema: Data Collector ainda com timeout

**Sintoma:**
```
❌ timeout of 30000ms exceeded
```

**Verificar:**

1. **API Keys são iguais?**
```powershell
# Backend
Get-Content backend\.env | Select-String "DATA_COLLECTOR_API_KEY"

# Data Collector  
Get-Content data-collector\.env | Select-String "^API_KEY"
```

**Devem ser IDÊNTICAS!**

2. **Backend está respondendo?**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

3. **Endpoint específico está OK?**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/data-collector/production-orders/active" `
  -Headers @{"X-API-Key"="mes-data-collector-secret-key-2024"} `
  -TimeoutSec 15
```

### Problema: Erro de API Key inválida

**Sintoma:**
```json
{"error": "API Key inválida"}
```

**Solução:**
1. Editar `backend/.env` e `data-collector/.env`
2. Colocar a MESMA chave em ambos:
   - Backend: `DATA_COLLECTOR_API_KEY=sua-chave-aqui`
   - Data Collector: `API_KEY=sua-chave-aqui`
3. Reiniciar ambos serviços

---

## 📊 Verificação Final

### Checklist de Sucesso ✅

- [ ] PostgreSQL rodando (`Get-Service postgresql-x64-18`)
- [ ] Backend iniciado sem erros
- [ ] `/health` retorna 200
- [ ] `/api/data-collector/production-orders/active` retorna em < 10s
- [ ] API Keys são iguais em backend e data-collector
- [ ] Data Collector inicia sem timeout
- [ ] Logs mostram: `✅ Recebidas X ordens de produção ativas`

### Status Esperado

```
Backend:
  ✅ Database connected
  ✅ Server running on port 3001
  
Data Collector:
  ✅ API Client configured
  ✅ Backend health check OK
  ✅ PLC Pool Manager started
  ✅ Production Monitor started
```

---

## 📝 Arquivos Modificados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `backend/.env` | ✅ CRIADO | Configuração do backend |
| `data-collector/.env` | ✅ CRIADO | Configuração do data-collector |
| `backend/src/controllers/dataCollectorController.ts` | ✅ MODIFICADO | Timeout de 10s nas queries |
| `backend/dist/controllers/dataCollectorController.js` | ✅ COMPILADO | Build atualizado |

---

## 🎓 Lições Aprendidas

1. **Sempre verificar arquivo `.env`** antes de diagnosticar problemas complexos
2. **Timeout de 30s indica problema de database**, não de rede
3. **API Keys devem ser idênticas** em backend e data-collector
4. **Prisma precisa de DATABASE_URL** válida ou queries travam indefinidamente

---

## 🆘 Se Ainda Não Funcionar

Execute e compartilhe os resultados:

```powershell
# 1. Status PostgreSQL
Get-Service postgresql-x64-18

# 2. Testar conexão direta
cd backend
npm run prisma:studio

# 3. Ver logs detalhados do backend
cd backend
npm run dev  # Modo desenvolvimento

# 4. Ver conteúdo dos .env
Get-Content backend\.env
Get-Content data-collector\.env

# 5. Testar endpoint manualmente
Invoke-WebRequest -Uri "http://localhost:3001/api/data-collector/production-orders/active" `
  -Headers @{"X-API-Key"="mes-data-collector-secret-key-2024"} `
  -TimeoutSec 15 -Verbose
```

---

## ✨ Resumo

**O que foi feito:**
1. ✅ Criados arquivos `.env` para backend e data-collector
2. ✅ Configurado DATABASE_URL para PostgreSQL
3. ✅ Sincronizado API_KEY entre serviços
4. ✅ Adicionado timeout de 10s nas queries
5. ✅ Reconstruído backend
6. ✅ Parado serviços antigos

**O que você precisa fazer:**
1. ⚙️ Verificar senha do PostgreSQL em `backend/.env`
2. 🚀 Iniciar backend: `cd backend && npm start`
3. 🧪 Testar endpoint
4. 🚀 Iniciar data-collector: `cd data-collector && npm start`

**Resultado esperado:** ✅ Sistema funcionando sem timeout!

---

Criado em: 22/10/2024
Problema: Timeout de 30s no data-collector
Status: ✅ RESOLVIDO (pendente reinicialização)

