# ✅ SOLUÇÃO DO ERRO 500 - Email Config

## 🔴 Problema
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
GET /api/email-configs
```

## 🔍 Causa
As tabelas do sistema de e-mail (`email_configs`, `maintenance_alerts`, `email_logs`) foram adicionadas ao schema Prisma, mas:
1. As tabelas foram criadas no banco ✅
2. O Prisma Client NÃO foi regenerado (backend rodando) ❌
3. Backend precisa ser **REINICIADO** ❌

## ✅ Solução Aplicada

### 1. Tabelas Criadas no Banco
```bash
npx prisma db push --skip-generate
✅ Your database is now in sync with your Prisma schema
```

### 2. REINICIAR O BACKEND (Necessário!)

**Você tem 3 opções:**

#### Opção A: Script Automático
```powershell
.\REINICIAR_BACKEND.ps1
```

#### Opção B: Matar Processos e Reiniciar
```powershell
Get-Process -Name node | Stop-Process -Force
cd C:\Empresas\Desenvolvimento\MES\backend
npm run dev
```

#### Opção C: Na Janela do Backend
Se você tem uma janela com `npm run dev` rodando:
1. Pressione `Ctrl + C`
2. Digite: `npm run dev` novamente

---

## 🎯 Após Reiniciar

### 1. Verificar Backend Online
```
http://localhost:3001/api/auth
```

### 2. Aplicar Permissões
```powershell
.\APLICAR_PERMISSOES_EMAIL_ALERTAS.ps1
```

### 3. Testar as Telas
```
http://localhost:3000/email-config
http://localhost:3000/maintenance-alerts
```

---

## ⚠️ Warning React (Secundário)

```
Warning: Each child in a list should have a unique "key" prop.
```

**Status:** Ignorável. O `key` já está correto (`key={item.moldId}`). O warning pode aparecer se não houver alertas cadastrados ainda.

---

## 📋 Checklist

- [x] ✅ Schema Prisma atualizado
- [x] ✅ Tabelas criadas no banco (`prisma db push`)
- [ ] ⏳ **Backend reiniciado** ← FAZER AGORA
- [ ] ⏳ **Prisma Client regenerado** (automático no restart)
- [ ] ⏳ Permissões aplicadas
- [ ] ⏳ Telas testadas

---

## 🚀 Comando Rápido

**REINICIAR TUDO DE UMA VEZ:**
```powershell
# Parar processos Node.js
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Ir para o backend
cd C:\Empresas\Desenvolvimento\MES\backend

# Regenerar Prisma Client
npx prisma generate

# Iniciar backend
npm run dev
```

**Aguarde aparecer:**
```
✅ Database connected successfully
🚀 Servidor rodando na porta 3001
⏰ Scheduler de alertas de manutenção iniciado
```

Depois teste:
```
http://localhost:3000/email-config
```

---

**Data:** 23/10/2025  
**Status:** ⏳ Aguardando reinicialização do backend  
**Próximo:** Reiniciar backend para aplicar mudanças

