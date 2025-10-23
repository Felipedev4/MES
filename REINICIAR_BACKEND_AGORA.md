# 🔄 REINICIAR BACKEND - PASSO A PASSO

## ⚠️ IMPORTANTE

As correções já foram compiladas, mas o backend **AINDA ESTÁ RODANDO COM O CÓDIGO ANTIGO**.

Você precisa **PARAR e REINICIAR** o servidor backend!

---

## 🛑 Passo 1: Parar o Backend Atual

### Opção A: Terminal onde o backend está rodando
1. Vá para o terminal onde você executou `npm run dev`
2. Pressione **Ctrl+C** para parar

### Opção B: Powershell
```powershell
# Encontrar processo Node
Get-Process node

# Matar todos os processos Node (cuidado!)
Stop-Process -Name node -Force
```

---

## ▶️ Passo 2: Iniciar Backend Novamente

```powershell
cd backend
npm run dev
```

**Aguarde aparecer:**
```
✅ Servidor rodando na porta 3001
✅ Conectado ao PostgreSQL
```

---

## 🔄 Passo 3: Atualizar Frontend

No navegador:
1. Pressione **F5** ou **Ctrl+F5** (hard refresh)
2. Aguarde o dashboard carregar

---

## ✅ Verificar se Funcionou

Após reiniciar, o dashboard deve mostrar:

### Se estiver na Empresa EMP-001 (com dados):
- Total Produzido: **0** (se não tiver apontamentos da EMP-001)
- OEE: Valor calculado **APENAS da EMP-001**
- Taxa Qualidade: **APENAS da EMP-001**

### Se estiver na Empresa EMP-002 (vazia):
- Total Produzido: **0**
- OEE: **0%**
- Taxa Qualidade: **100%**
- Ordens em Andamento: **0**

---

## 🧪 Teste Final

1. **Ver dados na empresa atual**
2. **Trocar de empresa** (botão no header)
3. **Ver se os números MUDAM** ✅

Se os números mudarem ao trocar de empresa = **FUNCIONOU!** 🎉

---

## 🚨 Se AINDA não funcionar

Execute este comando para verificar se o backend está usando o código novo:

```powershell
# Ver quando o arquivo foi compilado
ls backend/dist/controllers/dashboardController.js | Select-Object LastWriteTime
```

Deve mostrar a hora de agora (não de horas atrás).

---

**REINICIE O BACKEND AGORA!** ⚡

