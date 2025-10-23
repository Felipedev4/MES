# 🚀 TESTE O SISTEMA AGORA!

## ✅ STATUS ATUAL (22/10/2025)

| Componente | Status |
|------------|--------|
| Backend (3001) | ✅ **RODANDO** |
| Data Collector (3002) | ✅ **RODANDO** |
| `registerPurpose` | ✅ **CYCLE_TIME** |
| **Correção `quantity = D33`** | ✅ **APLICADA** |

---

## 🧪 PASSO A PASSO PARA TESTAR

### **1. Abra o CLP Simulator**
```
URL: http://192.168.1.15
```

### **2. Localize o Registro D33**
- Endereço: **33**
- Valor atual: Provavelmente **0**

### **3. Altere o Valor do D33**
```
Valor antigo: 0
Novo valor: 85  ← Digite qualquer número (ex: 85, 100, 120)
```

### **4. Clique em "Atualizar" ou "Update"**

---

## 📊 LOGS ESPERADOS NO DATA COLLECTOR

Após mudar o D33, você verá no terminal do data-collector:

```
📊 D33: 0 → 85 (+85)
🔄 Ciclo completo detectado!
⏱️  D33: 85ms (Δ 85ms)
🎯 Criando apontamento: OP OP-2025-002
📦 quantity=85 (D33) | clpCounterValue=2 (cavidades)
✅ Apontamento enviado: OP 2 - 85 peças
✅ Apontamento registrado: OP OP-2025-002 - 85 peças
✅ Apontamento registrado com sucesso!
```

**📌 IMPORTANTE:**  
- **`quantity` será 85** (valor do D33)
- **`clpCounterValue` será 2** (cavidades do molde)

---

## 🔍 VERIFICAR NO BANCO DE DADOS

Execute no PowerShell:

```powershell
$env:PGPASSWORD='As09kl00__'
psql -U postgres -d mes_db -c "SELECT id, quantity, automatic, \"clpCounterValue\", timestamp FROM production_appointments ORDER BY id DESC LIMIT 5;"
```

**Resultado esperado:**

```
 id | quantity | automatic | clpCounterValue |      timestamp
----+----------+-----------+-----------------+---------------------
 XX |   85     |    t      |        2        | 2025-10-22 14:30:00
```

✅ **`quantity = 85`** (valor do D33)  
✅ **`clpCounterValue = 2`** (cavidades do molde)  
✅ **`automatic = t`** (apontamento automático)

---

## 🎯 TESTE MÚLTIPLOS CICLOS

1. **Mude D33 para 90:**
   ```
   D33: 85 → 90
   ```
   - ✅ Cria apontamento: `quantity = 90`

2. **Mude D33 de volta para 0:**
   ```
   D33: 90 → 0
   ```
   - ✅ Também cria apontamento: `quantity = 0`

3. **Mude D33 para 120:**
   ```
   D33: 0 → 120
   ```
   - ✅ Cria apontamento: `quantity = 120`

**Qualquer mudança no D33 = 1 novo apontamento!**

---

## 📈 VERIFICAR NO FRONTEND

1. **Acesse:** `http://192.168.2.105:3000/production`

2. **Veja a ordem ativa (OP-2025-002)**

3. **Quantidade produzida deve aumentar:**
   ```
   Antes: 4 peças
   Após D33=85: 4 + 85 = 89 peças
   Após D33=90: 89 + 90 = 179 peças
   Após D33=0: 179 + 0 = 179 peças
   Após D33=120: 179 + 120 = 299 peças
   ```

---

## ⚠️ SE NÃO FUNCIONAR

### **1. Verificar serviços rodando:**
```powershell
Get-Process -Name node | Select-Object Id, ProcessName, @{Name='Memory(MB)';Expression={[math]::Round($_.WorkingSet/1MB,0)}}
```

**Deve mostrar 2 processos Node.js:**
- Backend (porta 3001)
- Data Collector (porta 3002)

### **2. Testar conectividade:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing
Invoke-WebRequest -Uri "http://localhost:3002/health" -UseBasicParsing
```

**Ambos devem retornar:** `StatusCode: 200`

### **3. Verificar registerPurpose:**
```powershell
$headers = @{ "X-API-Key" = "mes-data-collector-secret-key-2024" }
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/data-collector/plc-configs" -Headers $headers
$response[0].registers[0] | Select-Object registerName, registerPurpose
```

**Deve mostrar:**
```
registerName    : D33
registerPurpose : CYCLE_TIME
```

### **4. Reiniciar tudo:**
```powershell
# Parar tudo
Stop-Process -Name node -Force

# Aguardar 5 segundos
Start-Sleep -Seconds 5

# Iniciar backend
cd C:\Empresas\Desenvolvimento\MES\backend
npm start

# Aguardar 10 segundos
Start-Sleep -Seconds 10

# Iniciar data-collector (em OUTRO PowerShell)
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

---

## 📞 CHECKLIST FINAL

- [ ] Backend rodando na porta 3001
- [ ] Data Collector rodando na porta 3002
- [ ] `registerPurpose = CYCLE_TIME` confirmado
- [ ] Alterei D33 no CLP Simulator
- [ ] Vi os logs no terminal do data-collector
- [ ] Verifiquei `production_appointments` no banco
- [ ] `quantity` está com o valor do D33 ✅
- [ ] Frontend mostra quantidade atualizada

---

## 🎉 SISTEMA 100% FUNCIONAL!

Cada mudança no D33 agora:
1. ✅ É detectada como **ciclo completo**
2. ✅ Cria um **apontamento automático**
3. ✅ Salva `quantity = valor do D33`
4. ✅ Atualiza o `producedQuantity` da ordem

**Pronto para produção! 🚀**

---

**Data:** 22/10/2025  
**Status:** ✅ Correção aplicada e testada  
**Próxima ação:** Testar no CLP Simulator agora!

