# 🚀 Início Rápido - Sistema MES

**Versão:** 1.0.0  
**Atualizado:** 23 de Outubro de 2025

---

## ⚡ TL;DR - Começar Agora

```batch
# 1. Iniciar todo o sistema
INICIAR_SISTEMA_MES.bat

# 2. Usar o sistema
# Frontend abrirá automaticamente em: http://localhost:3000

# 3. Ao terminar o dia
PARAR_SISTEMA_MES.bat
```

---

## 📦 O que você precisa

### Pré-requisitos
- ✅ Node.js v18+ instalado
- ✅ PostgreSQL rodando
- ✅ Portas 3000, 3001, 3002 livres

### Verificar pré-requisitos:
```powershell
# Node.js
node --version

# PostgreSQL
$env:PGPASSWORD='As09kl00__'; psql -U postgres -d mes_db -c "SELECT 1"
```

---

## 🎯 Scripts Principais

| Script | Atalho | O que faz |
|--------|--------|-----------|
| **INICIAR_SISTEMA_MES.bat** | 🟢 INICIAR | Inicia Backend + Data Collector + Frontend |
| **PARAR_SISTEMA_MES.bat** | 🔴 PARAR | Para todos os serviços |
| **REINICIAR_SISTEMA_MES.bat** | 🔄 REINICIAR | Para e reinicia tudo |

---

## 🏁 Primeira Execução

### Passo 1: Instalar Dependências (apenas uma vez)

```batch
# Backend
cd backend
npm install
npx prisma generate

# Data Collector
cd ..\data-collector
npm install

# Frontend
cd ..\frontend
npm install

# Voltar para raiz
cd ..
```

### Passo 2: Configurar Banco de Dados (apenas uma vez)

```batch
cd backend
npx prisma db push
cd ..
```

### Passo 3: Iniciar o Sistema

```batch
# Duplo clique em:
INICIAR_SISTEMA_MES.bat

# Ou via linha de comando:
.\INICIAR_SISTEMA_MES.bat
```

---

## 🖥️ O que vai acontecer

Quando você executar `INICIAR_SISTEMA_MES.bat`:

1. ⚡ Script limpa processos anteriores
2. 🔍 Verifica se Node.js está instalado
3. 🚀 Abre **3 janelas novas**:
   - Backend (porta 3001)
   - Data Collector (porta 3002)
   - Frontend (porta 3000)
4. ⏳ Aguarda inicialização (10-30 segundos)
5. ✅ Verifica status de cada serviço
6. 🌐 Abre navegador automaticamente

---

## 🪟 Janelas Abertas

Você verá estas janelas:

### 1. Janela Principal (Script)
```
╔════════════════════════════════════════════════════════════════════════╗
║                      SISTEMA INICIADO!                                 ║
╚════════════════════════════════════════════════════════════════════════╝

✓ Backend (Porta 3001): ONLINE
✓ Data Collector (Porta 3002): ONLINE
✓ Frontend (Porta 3000): ONLINE
```

### 2. Backend (Azul Cyan)
```
╔════════════════════════════════════════════════╗
║         MES BACKEND - Porta 3001               ║
╚════════════════════════════════════════════════╝

[SERVER] Servidor iniciado na porta 3001
[DB] Conectado ao PostgreSQL
```

### 3. Data Collector (Verde)
```
╔════════════════════════════════════════════════╗
║      MES DATA COLLECTOR - Porta 3002           ║
╚════════════════════════════════════════════════╝

✅ [API] Servidor iniciado na porta 3002
```

### 4. Frontend (Magenta)
```
╔════════════════════════════════════════════════╗
║       MES FRONTEND - Porta 3000                ║
╚════════════════════════════════════════════════╝

Compiled successfully!
webpack compiled
```

**💡 Não feche essas janelas!** Elas mostram logs em tempo real.

---

## 🔗 URLs de Acesso

Após a inicialização:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| 🌐 **Frontend** | http://localhost:3000 | Interface do usuário |
| 📡 **API Backend** | http://localhost:3001 | API REST + WebSocket |
| 📊 **API Docs** | http://localhost:3001/api-docs | Swagger UI |
| 🔌 **Data Collector** | http://localhost:3002 | Status do coletor |
| ❤️ **Backend Health** | http://localhost:3001/api/health | Status da API |
| ❤️ **Collector Health** | http://localhost:3002/health | Status do coletor |

---

## ⚠️ Problemas Comuns

### Erro: "EADDRINUSE" (porta em uso)

**Solução:**
```batch
PARAR_SISTEMA_MES.bat
INICIAR_SISTEMA_MES.bat
```

### Erro: "Node.js não encontrado"

**Solução:**
1. Instale: https://nodejs.org/
2. Reinicie o terminal
3. Tente novamente

### Frontend não carrega

**Solução:**
- ⏳ Aguarde 30 segundos (compilação inicial é lenta)
- 🔄 Dê refresh (F5) no navegador

### Backend não conecta ao banco

**Solução:**
```powershell
# Verificar se PostgreSQL está rodando
Get-Service postgresql*

# Se não estiver, iniciar
Start-Service postgresql-x64-14  # ou sua versão
```

---

## 🔄 Fluxo Diário

### Manhã (Início do dia)
```batch
INICIAR_SISTEMA_MES.bat
```

### Durante o dia (após mudanças no código)
```batch
REINICIAR_SISTEMA_MES.bat
```

### Noite (Fim do dia)
```batch
PARAR_SISTEMA_MES.bat
```

---

## 🎓 Próximos Passos

### Depois de iniciar:

1. **Login no sistema:**
   - URL: http://localhost:3000
   - Usuário padrão: admin@mes.com
   - Senha: (consultar configuração)

2. **Explorar funcionalidades:**
   - Dashboard de Produção
   - Ordens de Produção
   - Monitoramento de Injetoras
   - Relatórios OEE

3. **Consultar documentação:**
   - `API_DOCUMENTATION.md` - Documentação da API
   - `GUIA_SCRIPTS_INICIALIZACAO.md` - Guia completo dos scripts
   - `README.md` - Visão geral do projeto

---

## 📚 Documentação Completa

Para mais detalhes, consulte:

- 📖 **GUIA_SCRIPTS_INICIALIZACAO.md** - Guia completo dos scripts
- 🔧 **CORRECAO_ENUM_PRODUCTION_STATUS.md** - Correção aplicada
- 📊 **NOVOS_STATUS_ORDEM_PRODUCAO.md** - Status de produção
- 🚀 **QUICKSTART.md** - Guia de início rápido detalhado

---

## ✅ Checklist Rápido

Antes de iniciar pela primeira vez:

- [ ] Node.js instalado (v18+)
- [ ] PostgreSQL rodando
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco de dados configurado (`npx prisma db push`)
- [ ] Portas 3000, 3001, 3002 livres

---

## 🆘 Precisa de Ajuda?

### Comandos Úteis:

```powershell
# Verificar portas em uso
netstat -ano | findstr ":3000 :3001 :3002"

# Verificar processos Node.js
Get-Process -Name node

# Parar todos os processos Node.js
Get-Process -Name node | Stop-Process -Force

# Testar conexão com PostgreSQL
$env:PGPASSWORD='As09kl00__'; psql -U postgres -d mes_db -c "SELECT version();"
```

---

**🎉 Pronto para começar!**

Execute `INICIAR_SISTEMA_MES.bat` e comece a usar o Sistema MES!

---

**Data:** 23 de Outubro de 2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Uso

