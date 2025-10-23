# 🚨 SOLUÇÃO RÁPIDA - Backend Não Inicia

## ❌ PROBLEMA
O backend não está iniciando e dá erro `ERR_CONNECTION_REFUSED`.

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ Abrir PowerShell MANUALMENTE

1. Pressione `Windows + R`
2. Digite: `powershell`
3. Pressione Enter

### 2️⃣ Executar os Comandos Um Por Um

```powershell
# 1. Ir para o diretório do backend
cd C:\Empresas\Desenvolvimento\MES\backend

# 2. Parar todos os processos Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# 3. Aguardar 2 segundos
Start-Sleep -Seconds 2

# 4. Regenerar Prisma Client
npx prisma generate

# 5. Iniciar o backend
npm run dev
```

### 3️⃣ OBSERVAR OS LOGS

**✅ Se tudo estiver OK, você verá:**
```
✅ Database connected successfully
✅ Serviço de produção inicializado
⏰ Scheduler de alertas de manutenção iniciado
🚀 Servidor rodando na porta 3001
```

**❌ Se houver erro, copie o erro completo e me envie**

Exemplo de erro TypeScript:
```
TSError: ⨯ Unable to compile TypeScript:
src/arquivo.ts:10:20 - error TS...
```

---

## 🎯 APÓS O BACKEND INICIAR

### 1. Testar no Navegador
```
http://localhost:3001/api/auth
```
Deve retornar: `{"error":"Token não fornecido"}`

### 2. Aplicar Permissões no Banco

**Opção A - Via PowerShell:**
```powershell
cd C:\Empresas\Desenvolvimento\MES
.\APLICAR_PERMISSOES_EMAIL_ALERTAS.ps1
```

**Opção B - Via pgAdmin:**
1. Abra o pgAdmin
2. Conecte ao banco `mes_db`
3. Abra Query Tool
4. Copie e cole o conteúdo de: `ADICIONAR_PERMISSOES_EMAIL_ALERTAS.sql`
5. Execute (F5)

### 3. Testar as Telas
```
http://localhost:3000/email-config
http://localhost:3000/maintenance-alerts
```

---

## 🔧 POSSÍVEIS ERROS E SOLUÇÕES

### Erro: "Cannot find module"
```powershell
cd C:\Empresas\Desenvolvimento\MES\backend
npm install
npx prisma generate
npm run dev
```

### Erro: "Port 3001 is already in use"
```powershell
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess
Stop-Process -Id NUMERO_DO_PROCESSO -Force
npm run dev
```

### Erro: TypeScript (TSError)
**Copie o erro completo e me envie para eu corrigir!**

### Erro: "Cannot connect to database"
1. Verifique se o PostgreSQL está rodando
2. Verifique as credenciais no arquivo `backend/.env`

---

## 🎯 CHECKLIST

- [ ] PowerShell aberto
- [ ] `cd` para diretório backend
- [ ] Processos Node parados
- [ ] `npx prisma generate` executado
- [ ] `npm run dev` executado
- [ ] Backend mostra logs de sucesso
- [ ] `http://localhost:3001/api/auth` responde
- [ ] Permissões aplicadas no banco
- [ ] Telas acessíveis no frontend

---

## 📞 SE PRECISAR DE AJUDA

**Me envie:**
1. ✅ Screenshot ou cópia dos logs do backend
2. ✅ Mensagem de erro completa (se houver)
3. ✅ Resultado de: `http://localhost:3001/api/auth`

---

**Data:** 23/10/2025  
**Próximo:** Executar comandos manualmente e verificar logs

