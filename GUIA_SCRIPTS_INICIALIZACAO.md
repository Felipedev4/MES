# 🚀 Guia de Scripts de Inicialização do Sistema MES

**Data:** 23 de Outubro de 2025  
**Versão:** 1.0.0

---

## 📋 Scripts Disponíveis

### 1. `INICIAR_SISTEMA_MES.bat`
**Propósito:** Iniciar todos os componentes do sistema MES

**O que faz:**
1. ✅ Para processos Node.js anteriores
2. ✅ Libera as portas 3000, 3001 e 3002
3. ✅ Verifica se o Node.js está instalado
4. ✅ Inicia o **Backend** (porta 3001) em janela separada
5. ✅ Inicia o **Data Collector** (porta 3002) em janela separada
6. ✅ Inicia o **Frontend** (porta 3000) em janela separada
7. ✅ Verifica o status de cada serviço
8. ✅ Abre o frontend no navegador padrão

**Como usar:**
```batch
# Opção 1: Duplo clique no arquivo
INICIAR_SISTEMA_MES.bat

# Opção 2: Via linha de comando
cd C:\Empresas\Desenvolvimento\MES
INICIAR_SISTEMA_MES.bat
```

**Saída esperada:**
```
╔════════════════════════════════════════════════════════════════════════╗
║                     SISTEMA MES - INICIALIZAÇÃO                        ║
║              Manufacturing Execution System v1.0                       ║
╚════════════════════════════════════════════════════════════════════════╝

[10:30:15] Iniciando Sistema MES...

[1/6] 🛑 Parando processos Node.js anteriores...
   ✓ Porta 3001 liberada
   ✓ Porta 3002 liberada

[2/6] 🔍 Verificando instalação do Node.js...
   ✓ Node.js instalado: v22.20.0

[3/6] 🚀 Iniciando Backend (Porta 3001)...
   ✓ Backend iniciado em nova janela

[4/6] 📡 Iniciando Data Collector (Porta 3002)...
   ✓ Data Collector iniciado em nova janela

[5/6] 🌐 Iniciando Frontend (Porta 3000)...
   ✓ Frontend iniciado em nova janela

[6/6] ✅ Verificando status dos serviços...
   ✓ Backend (Porta 3001): ONLINE
   ✓ Data Collector (Porta 3002): ONLINE
   ✓ Frontend (Porta 3000): ONLINE

╔════════════════════════════════════════════════════════════════════════╗
║                      SISTEMA INICIADO!                                 ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

### 2. `PARAR_SISTEMA_MES.bat`
**Propósito:** Parar todos os componentes do sistema MES de forma limpa

**O que faz:**
1. ✅ Lista todos os processos Node.js ativos
2. ✅ Para processos nas portas 3000, 3001 e 3002
3. ✅ Limpa processos Node.js restantes
4. ✅ Verifica se todos os serviços foram parados

**Como usar:**
```batch
# Opção 1: Duplo clique no arquivo
PARAR_SISTEMA_MES.bat

# Opção 2: Via linha de comando
cd C:\Empresas\Desenvolvimento\MES
PARAR_SISTEMA_MES.bat
```

**Saída esperada:**
```
╔════════════════════════════════════════════════════════════════════════╗
║                      SISTEMA MES - PARADA                              ║
║              Manufacturing Execution System v1.0                       ║
╚════════════════════════════════════════════════════════════════════════╝

[1/3] 🔍 Verificando processos Node.js ativos...
   Processos encontrados: 5

[2/3] 🛑 Liberando portas do sistema...
   ✓ Frontend (Porta 3000): Parado
   ✓ Backend (Porta 3001): Parado
   ✓ Data Collector (Porta 3002): Parado

[3/3] 🧹 Limpando processos Node.js restantes...
   ✓ 5 processo(s) Node.js encerrado(s)

╔════════════════════════════════════════════════════════════════════════╗
║                    VERIFICAÇÃO FINAL                                   ║
╚════════════════════════════════════════════════════════════════════════╝
   ✓ Backend (Porta 3001): PARADO
   ✓ Data Collector (Porta 3002): PARADO
   ✓ Frontend (Porta 3000): PARADO

✅ Todos os serviços foram parados com sucesso!
```

---

### 3. `REINICIAR_SISTEMA_MES.bat`
**Propósito:** Reiniciar todos os componentes (parar + iniciar)

**O que faz:**
1. ✅ Para todos os serviços em execução
2. ✅ Aguarda 3 segundos
3. ✅ Inicia todos os serviços novamente

**Como usar:**
```batch
# Duplo clique no arquivo
REINICIAR_SISTEMA_MES.bat
```

**Quando usar:**
- Após fazer alterações no código
- Quando algum serviço estiver travado
- Para aplicar novas configurações
- Após atualizar dependências

---

## 🎯 Casos de Uso Comuns

### Cenário 1: Iniciar o sistema pela primeira vez hoje
```batch
INICIAR_SISTEMA_MES.bat
```

### Cenário 2: Erro "EADDRINUSE" (porta em uso)
```batch
# Primeiro pare tudo
PARAR_SISTEMA_MES.bat

# Depois inicie novamente
INICIAR_SISTEMA_MES.bat

# Ou use o atalho:
REINICIAR_SISTEMA_MES.bat
```

### Cenário 3: Acabou o dia de trabalho
```batch
PARAR_SISTEMA_MES.bat
```

### Cenário 4: Fez alterações no código
```batch
# Para aplicar as alterações:
REINICIAR_SISTEMA_MES.bat
```

### Cenário 5: Atualização do Prisma Schema
```batch
# 1. Parar os serviços
PARAR_SISTEMA_MES.bat

# 2. Aplicar as mudanças
cd backend
npx prisma db push
npx prisma generate

# 3. Reiniciar
cd ..
INICIAR_SISTEMA_MES.bat
```

---

## 🪟 Janelas Abertas

Após executar `INICIAR_SISTEMA_MES.bat`, você terá **4 janelas** abertas:

| Janela | Título | Porta | Descrição |
|--------|--------|-------|-----------|
| 1 | Script de Inicialização | - | Janela principal com status |
| 2 | MES - Backend (3001) | 3001 | API Backend + Socket.io |
| 3 | MES - Data Collector (3002) | 3002 | Coleta de dados do PLC |
| 4 | MES - Frontend (3000) | 3000 | Interface React |

**💡 Dica:** Não feche essas janelas! Elas mostram logs em tempo real.

---

## 🔧 Solução de Problemas

### Problema: "Node.js não encontrado"
**Solução:**
1. Instale o Node.js: https://nodejs.org/
2. Reinicie o terminal
3. Execute novamente o script

### Problema: "Pasta 'backend' não encontrada"
**Solução:**
1. Certifique-se de estar no diretório correto:
   ```batch
   cd C:\Empresas\Desenvolvimento\MES
   ```
2. Verifique se as pastas `backend`, `frontend` e `data-collector` existem

### Problema: Serviço não inicia
**Solução:**
1. Verifique os logs na janela do serviço específico
2. Verifique se as dependências estão instaladas:
   ```batch
   cd backend
   npm install
   
   cd ../data-collector
   npm install
   
   cd ../frontend
   npm install
   ```

### Problema: Porta ainda em uso após parar
**Solução:**
1. Execute `PARAR_SISTEMA_MES.bat` novamente
2. Ou mate os processos manualmente:
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

### Problema: Frontend não abre no navegador
**Solução:**
1. Abra manualmente: http://localhost:3000
2. Aguarde alguns segundos, o React pode demorar para compilar

---

## 📊 Verificação de Status Manual

### Verificar portas em uso:
```powershell
netstat -ano | findstr ":3000 :3001 :3002"
```

### Verificar processos Node.js:
```powershell
Get-Process -Name node
```

### Testar endpoints:
```powershell
# Backend Health
Invoke-WebRequest http://localhost:3001/api/health

# Data Collector Health
Invoke-WebRequest http://localhost:3002/health

# Frontend (HTML)
Invoke-WebRequest http://localhost:3000
```

---

## 🚀 Atalhos de Teclado

Nas janelas dos serviços:

| Tecla | Ação |
|-------|------|
| `Ctrl + C` | Parar o serviço atual |
| `Ctrl + Break` | Forçar parada |
| `Seta ↑` | Comando anterior |
| `cls` | Limpar tela |

---

## 📝 Logs e Debugging

### Localização dos Logs

Cada serviço exibe logs em tempo real em sua janela:

**Backend (Porta 3001):**
```
[SERVER] Servidor iniciado na porta 3001
[DB] Conectado ao PostgreSQL: mes_db
[SOCKET] Socket.IO iniciado
```

**Data Collector (Porta 3002):**
```
✅ [API] Servidor iniciado na porta 3002
📡 [MODBUS] Iniciando conexões com PLCs...
🔍 [DATA-COLLECTOR] Buscando ordens ativas...
```

**Frontend (Porta 3000):**
```
Compiled successfully!
webpack compiled with 0 warnings
```

### Ver logs completos no PowerShell:
```powershell
# Backend
cd backend
npm run dev

# Data Collector
cd data-collector
npm start

# Frontend
cd frontend
npm start
```

---

## 🔄 Ordem de Inicialização

Os scripts iniciam os serviços nesta ordem:

1. **Backend** (3001) - Primeiro, pois é a API base
2. **Data Collector** (3002) - Segundo, depende do Backend
3. **Frontend** (3000) - Por último, consome a API

**Tempo estimado de inicialização completa:** 15-30 segundos

---

## ⚡ Performance

### Tempo de inicialização por componente:

| Componente | Tempo Médio | Primeira Vez |
|------------|-------------|--------------|
| Backend | 5-10s | 10-15s |
| Data Collector | 2-5s | 5-10s |
| Frontend | 10-20s | 30-60s |

**💡 Dica:** Na primeira execução, o Frontend pode demorar mais para compilar todos os assets.

---

## 📦 Requisitos do Sistema

- **Node.js:** v18.0.0 ou superior (recomendado v22.x)
- **npm:** v9.0.0 ou superior
- **Windows:** 10/11
- **PostgreSQL:** 12+ (deve estar rodando)
- **Memória RAM:** Mínimo 4GB (recomendado 8GB)
- **Portas livres:** 3000, 3001, 3002

---

## 🎓 Boas Práticas

### ✅ FAÇA:
- Use os scripts .bat para iniciar/parar os serviços
- Mantenha as janelas de log abertas durante desenvolvimento
- Pare os serviços ao fim do dia
- Reinicie após mudanças significativas no código

### ❌ NÃO FAÇA:
- Não feche as janelas de log com "X" (use `PARAR_SISTEMA_MES.bat`)
- Não inicie múltiplas instâncias do mesmo serviço
- Não force o encerramento sem necessidade
- Não modifique os scripts sem backup

---

## 🆘 Suporte

### Problemas Comuns Solucionados:
- ✅ Erro de enum ProductionStatus → Executar `npx prisma db push`
- ✅ Porta em uso → Usar `PARAR_SISTEMA_MES.bat`
- ✅ Frontend não carrega → Aguardar compilação (15-30s)
- ✅ Backend não conecta → Verificar PostgreSQL

### Para Outros Problemas:
1. Verifique os logs nas janelas dos serviços
2. Consulte a documentação específica de cada componente
3. Execute `REINICIAR_SISTEMA_MES.bat`

---

## 📚 Documentação Relacionada

- `CORRECAO_ENUM_PRODUCTION_STATUS.md` - Correção do enum ProductionStatus
- `NOVOS_STATUS_ORDEM_PRODUCAO.md` - Status de ordens de produção
- `QUICKSTART.md` - Guia de início rápido
- `README.md` - Documentação principal
- `API_DOCUMENTATION.md` - Documentação da API

---

**🎉 Scripts criados com sucesso!**

Use `INICIAR_SISTEMA_MES.bat` para começar e tenha um ótimo desenvolvimento! 🚀

