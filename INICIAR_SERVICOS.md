# 🚀 COMO INICIAR OS SERVIÇOS DO MES

## ✅ STATUS ATUAL

| Serviço | Porta | Status |
|---------|-------|--------|
| **Backend** | 3001 | ✅ Rodando |
| **Data Collector** | 3002 | ✅ Rodando |
| **PostgreSQL** | 5432 | ✅ Ativo |

---

## 📋 ORDEM CORRETA DE INICIALIZAÇÃO

### **1️⃣ Parar tudo (se necessário):**

```powershell
Stop-Process -Name node -Force
Start-Sleep -Seconds 3
```

### **2️⃣ Iniciar Backend (PRIMEIRO):**

```powershell
cd C:\Empresas\Desenvolvimento\MES\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
```

**Aguardar 10-15 segundos** até ver:
```
✅ Backend running on port 3001
✅ Database connected
```

### **3️⃣ Iniciar Data Collector (DEPOIS):**

```powershell
cd C:\Empresas\Desenvolvimento\MES\data-collector
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
```

**Aguardar 5-10 segundos** até ver:
```
✅ MES DATA COLLECTOR INICIADO COM SUCESSO
```

---

## 🔍 VERIFICAR SE ESTÁ TUDO OK

Execute este comando:

```powershell
$backend = (Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing).StatusCode
$datacollector = (Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing).StatusCode
Write-Host "Backend (3001): $backend | Data Collector (3002): $datacollector"
```

**Resultado esperado:**
```
Backend (3001): 200 | Data Collector (3002): 200
```

---

## ⚠️ PROBLEMAS COMUNS

### **Erro: "EADDRINUSE: address already in use"**

**Causa:** Já existe um processo usando a porta 3001 ou 3002

**Solução:**
```powershell
# Parar todos os processos Node.js
Stop-Process -Name node -Force

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Reiniciar na ordem correta (Backend → Data Collector)
```

### **Erro: "timeout of 30000ms exceeded"**

**Causa:** Data Collector tentando conectar ao Backend que não está rodando

**Solução:**
1. Verificar se Backend está rodando: `http://localhost:3001/health`
2. Se não estiver, iniciar Backend PRIMEIRO
3. Aguardar Backend inicializar completamente
4. Só então iniciar Data Collector

### **Erro: "Authentication failed against database"**

**Causa:** Variáveis de ambiente não carregadas ou senha incorreta

**Solução:**
1. Verificar se existe `backend/.env`:
   ```
   DATABASE_URL="postgresql://postgres:As09kl00__@localhost:5432/mes_db?schema=public"
   DATA_COLLECTOR_API_KEY=mes-data-collector-secret-key-2024
   ```
2. Verificar se existe `data-collector/.env`:
   ```
   BACKEND_API_URL=http://localhost:3001
   API_KEY=mes-data-collector-secret-key-2024
   ```

---

## 🛠️ SCRIPT DE INICIALIZAÇÃO COMPLETO

Copie e cole no PowerShell:

```powershell
# 1. Parar tudo
Write-Host "🛑 Parando processos existentes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 2. Iniciar Backend
Write-Host "🚀 Iniciando Backend..." -ForegroundColor Cyan
cd C:\Empresas\Desenvolvimento\MES\backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# 3. Aguardar Backend
Write-Host "⏳ Aguardando Backend inicializar (15 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 4. Verificar Backend
Write-Host "🔍 Verificando Backend..." -ForegroundColor Cyan
try {
    $backendStatus = (Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing).StatusCode
    Write-Host "✅ Backend: $backendStatus" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend OFFLINE! Aguarde mais 10 segundos..." -ForegroundColor Red
    Start-Sleep -Seconds 10
}

# 5. Iniciar Data Collector
Write-Host "🚀 Iniciando Data Collector..." -ForegroundColor Cyan
cd C:\Empresas\Desenvolvimento\MES\data-collector
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# 6. Aguardar Data Collector
Write-Host "⏳ Aguardando Data Collector inicializar (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 7. Verificar ambos
Write-Host "`n📊 STATUS FINAL:" -ForegroundColor Cyan
try {
    $backend = (Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing).StatusCode
    $dc = (Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing).StatusCode
    Write-Host "✅ Backend (3001): $backend" -ForegroundColor Green
    Write-Host "✅ Data Collector (3002): $dc" -ForegroundColor Green
    Write-Host "`n🎉 TODOS OS SERVIÇOS INICIADOS COM SUCESSO!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao verificar serviços: $_" -ForegroundColor Red
}
```

---

## 📌 DICAS IMPORTANTES

1. **SEMPRE iniciar o Backend PRIMEIRO**
2. **Aguardar o Backend estar 100% online antes de iniciar o Data Collector**
3. **Não fechar as janelas PowerShell** que abrem (uma para cada serviço)
4. **Se precisar parar:** Fechar as janelas ou executar `Stop-Process -Name node -Force`
5. **Para ver logs:** Deixar as janelas PowerShell abertas e visíveis

---

## 🎯 TESTE RÁPIDO

Após iniciar os serviços, teste:

```powershell
# Verificar saúde dos serviços
Invoke-RestMethod -Uri "http://localhost:3001/health" -UseBasicParsing
Invoke-RestMethod -Uri "http://localhost:3002/health" -UseBasicParsing

# Verificar configurações do CLP
$headers = @{ "X-API-Key" = "mes-data-collector-secret-key-2024" }
$config = Invoke-RestMethod -Uri "http://localhost:3001/api/data-collector/plc-configs" -Headers $headers
$config[0].registers[0] | Select-Object registerName, registerPurpose
```

**Resultado esperado:**
```
registerName    : D33
registerPurpose : CYCLE_TIME
```

---

**Data:** 22/10/2025  
**Versão:** 1.0  
**Status:** ✅ Testado e funcionando

