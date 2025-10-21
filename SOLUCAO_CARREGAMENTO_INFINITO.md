# 🔧 Solução: Configuração de CLP Carregando Infinitamente

## ✅ Diagnóstico

O backend **está rodando** em `http://localhost:3001` ✓

### Causas Possíveis do Carregamento Infinito:

1. ❌ **Token de autenticação inválido ou expirado**
2. ❌ **Usuário não está logado**
3. ❌ **Frontend não está rodando**
4. ❌ **Erro de CORS**
5. ❌ **Console do navegador mostrando erros**

---

## 🔍 Diagnóstico Rápido

### 1. **Verificar Console do Navegador**

Abra o **DevTools** (F12) e vá na aba **Console**. Procure por erros:

```
❌ Possíveis erros:
- "401 Unauthorized"
- "Network Error"
- "Failed to fetch"
- "CORS policy"
```

### 2. **Verificar Aba Network**

No DevTools, aba **Network**:
- Filtre por `plc-config`
- Veja o status da requisição:
  - `200 OK` = Funcionando ✅
  - `401 Unauthorized` = Token inválido ❌
  - `Failed` = Backend não acessível ❌
  - `Pending` = Requisição travada ❌

---

## 🛠️ Soluções

### Solução 1: **Fazer Login Novamente**

O token JWT pode ter expirado.

**Passos:**
1. Vá para `/login`
2. Faça login com suas credenciais
3. Tente acessar `/plc-config` novamente

**Credenciais padrão (se usando seed):**
```
Email: admin@mes.com
Senha: admin123
```

---

### Solução 2: **Limpar LocalStorage e Fazer Login**

Às vezes o token fica corrompido no localStorage.

**Passos:**
1. Abra DevTools (F12)
2. Vá em **Application** > **Local Storage** > `http://localhost:3000`
3. Clique com botão direito > **Clear**
4. Recarregue a página (F5)
5. Faça login novamente

---

### Solução 3: **Verificar se o Frontend Está Rodando**

O frontend precisa estar rodando em `http://localhost:3000`

**Iniciar Frontend:**
```powershell
cd frontend
npm start
```

Aguarde a mensagem:
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

### Solução 4: **Verificar Configuração da API**

Verifique se o frontend está apontando para o backend correto.

**Arquivo:** `frontend/src/services/api.ts`

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

✅ Deve apontar para `http://localhost:3001`

---

### Solução 5: **Criar Arquivo .env no Frontend** (Se não existir)

**Arquivo:** `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:3001
```

Após criar o `.env`, **reinicie o frontend**:
```powershell
# No terminal do frontend, pressione Ctrl+C
# Depois execute novamente:
npm start
```

---

### Solução 6: **Verificar Erros no Backend**

Verifique o terminal onde o backend está rodando. Procure por:

```
❌ Erros comuns:
- "Error connecting to database"
- "Port 3001 is already in use"
- "Cannot find module"
```

Se houver erro, corrija e reinicie o backend.

---

## 🧪 Teste Manual

### 1. **Testar Login:**

Abra o navegador em modo anônimo:
1. Acesse `http://localhost:3000/login`
2. Faça login
3. Vá para `/plc-config`
4. Deve carregar normalmente

### 2. **Testar Backend Diretamente:**

No terminal (PowerShell):

```powershell
# Primeiro faça login para obter um token:
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Body '{"email":"admin@mes.com","password":"admin123"}' -ContentType "application/json"
$token = $response.token

# Teste o endpoint de PLC Config:
Invoke-RestMethod -Uri "http://localhost:3001/api/plc-config" -Headers @{Authorization="Bearer $token"}
```

**Resposta esperada:**
```json
[
  {
    "id": 1,
    "name": "CLP 01",
    "host": "192.168.1.100",
    ...
  }
]
```

---

## 🔧 Comandos Úteis

### **Reiniciar Backend:**
```powershell
# Parar (Ctrl+C no terminal do backend)
# Iniciar novamente:
cd backend
npm run dev
```

### **Reiniciar Frontend:**
```powershell
# Parar (Ctrl+C no terminal do frontend)
# Iniciar novamente:
cd frontend
npm start
```

### **Verificar Processos na Porta 3001:**
```powershell
netstat -ano | findstr :3001
```

### **Matar Processo (se porta estiver em uso):**
```powershell
# Primeiro encontre o PID:
netstat -ano | findstr :3001
# Exemplo de saída: TCP  0.0.0.0:3001  0.0.0.0:0  LISTENING  12345
#                                                            └──── PID

# Matar o processo:
taskkill /PID 12345 /F
```

---

## 📋 Checklist de Verificação

- [ ] Backend está rodando em `http://localhost:3001`
- [ ] Frontend está rodando em `http://localhost:3000`
- [ ] Console do navegador não mostra erros
- [ ] Usuário está logado (verificar localStorage)
- [ ] Token JWT é válido
- [ ] Requisições aparecem na aba Network do DevTools
- [ ] Banco de dados PostgreSQL está rodando
- [ ] Variáveis de ambiente estão configuradas

---

## 🚨 Solução Definitiva (Se nada funcionar)

### **1. Parar Tudo:**
```powershell
# Pressione Ctrl+C em todos os terminais (backend e frontend)
```

### **2. Limpar e Reinstalar:**
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
npm install
npx prisma generate
npm run dev

# (Em outro terminal)
# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### **3. Limpar Navegador:**
1. Abra DevTools (F12)
2. Clique com botão direito no ícone de recarregar
3. Selecione "Empty Cache and Hard Reload"
4. Limpe localStorage (Application > Local Storage > Clear)

### **4. Fazer Login Fresco:**
1. Acesse `http://localhost:3000/login`
2. Faça login com credenciais válidas
3. Tente acessar `/plc-config`

---

## 📊 Status Atual do Sistema

### ✅ **Backend:**
```
Status: ✅ RODANDO
URL: http://localhost:3001
Endpoints: /api/plc-config, /api/sectors, /api/companies, etc.
```

### ❓ **Frontend:**
```
Status: ? VERIFICAR
URL: http://localhost:3000
Esperado: Aplicação React carregada
```

### ❓ **Autenticação:**
```
Status: ? VERIFICAR
Token: Pode estar expirado
Solução: Fazer login novamente
```

---

## 💡 Dica Rápida

**Problema mais comum:** Token expirado após deixar a aplicação aberta por muito tempo.

**Solução rápida:**
1. Abra `http://localhost:3000/login`
2. Faça login
3. Acesse `/plc-config`
4. ✅ Deve funcionar!

---

## 🆘 Ainda não Funciona?

Se após todas as soluções acima o problema persistir, forneça:

1. **Screenshot do Console do navegador** (F12 > Console)
2. **Screenshot da aba Network** (F12 > Network)
3. **Logs do terminal do backend**
4. **Logs do terminal do frontend**

Com essas informações posso diagnosticar o problema específico!

---

**Status**: Backend ✅ Rodando | Frontend ❓ Verificar | Autenticação ❓ Verificar

