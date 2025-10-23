# 🚀 Iniciar Sistema com Novos Status

**Execute estes comandos para iniciar o sistema com os novos status de ordem de produção.**

---

## 📋 Pré-requisitos

✅ Banco de dados foi resetado e populado  
✅ Prisma Client foi regenerado  
✅ Seed foi executado com sucesso  

---

## 🎯 Comandos para Iniciar

### 1. **Abrir 3 Terminais PowerShell**

---

### **Terminal 1: Backend**

```powershell
cd C:\Empresas\Desenvolvimento\MES\backend
npm run dev
```

**Aguarde até ver:**
```
✅ Database connected successfully
✅ Serviço de produção inicializado
📡 Modbus interno DESABILITADO - usando Data Collector externo
🚀 Servidor MES iniciado com sucesso!
```

---

### **Terminal 2: Data Collector**

```powershell
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm run build
npm start
```

**Aguarde até ver:**
```
✅ MES DATA COLLECTOR INICIADO COM SUCESSO
🔌 PLC "CLP Principal - DVP-12SE" conectado!
📊 Monitorando 1 registros
```

---

### **Terminal 3: Frontend**

```powershell
cd C:\Empresas\Desenvolvimento\MES\frontend
npm start
```

**Aguarde abrir no navegador:** `http://localhost:3000`

---

## 🧪 Testar Novos Status

### 1. **Fazer Login**
```
URL: http://localhost:3000/login
Email: admin@mes.com
Senha: admin123
```

### 2. **Ir para Ordens de Produção**
```
Menu > Ordens de Produção
```

### 3. **Verificar Status da Ordem**
```
Status inicial: 📋 Programação
```

### 4. **Ativar a Ordem**
```
1. Clicar na ordem OP-2025-001
2. Clicar em "Editar"
3. Mudar Status para: ▶️ Em Atividade
4. Salvar
```

**Resultado esperado:**
- ✅ Status mudou para "Em Atividade" (verde)
- ✅ Data de início foi definida automaticamente
- ✅ Data Collector começou a monitorar

### 5. **Tentar Ativar Outra Ordem (Validação)**
```
1. Criar nova ordem
2. Tentar mudar status para "Em Atividade"
```

**Resultado esperado:**
- ❌ Erro: "Já existe uma ordem em atividade"
- ❌ Mensagem: "A ordem OP-2025-001 está atualmente em atividade..."

### 6. **Pausar Ordem Ativa**
```
1. Voltar para ordem OP-2025-001
2. Mudar status para: ⏸️ Pausada
3. Salvar
```

**Resultado esperado:**
- ✅ Status mudou para "Pausada" (amarelo)
- ✅ Apontamentos automáticos pausados

### 7. **Ativar Outra Ordem (Deve Funcionar Agora)**
```
1. Ir para a outra ordem
2. Mudar status para: ▶️ Em Atividade
3. Salvar
```

**Resultado esperado:**
- ✅ Agora pode ativar (a anterior está pausada)
- ✅ Data de início definida
- ✅ Data Collector monitora esta ordem

### 8. **Testar Sensor do CLP**
```
1. Acionar sensor D33
2. Verificar no frontend: Dados do CLP > Histórico
```

**Resultado esperado:**
- ✅ Novo registro aparece em tempo real
- ✅ Apontamento automático criado (se ordem está ATIVA)

### 9. **Encerrar Ordem**
```
1. Mudar status para: ✅ Encerrada
2. Salvar
```

**Resultado esperado:**
- ✅ Status mudou para "Encerrada" (azul)
- ✅ Data de término definida automaticamente
- ✅ Não pode mais mudar o status (final)

---

## 🎨 Novos Status Visuais

Ao navegar pelo sistema, você verá:

| Status | Visual |
|--------|--------|
| Programação | 📋 Programação (Cinza) |
| Em Atividade | ▶️ Em Atividade (Verde) |
| Pausada | ⏸️ Pausada (Amarelo) |
| Encerrada | ✅ Encerrada (Azul) |
| Cancelada | ❌ Cancelada (Vermelho) |

---

## ✅ Verificações Rápidas

### Backend
```powershell
Invoke-WebRequest http://localhost:3001/health
```
**Esperado:** Status 200 OK

### Data Collector
```powershell
Invoke-WebRequest http://localhost:3002/health
```
**Esperado:** Status 200 OK com detalhes do CLP

### Banco de Dados (Status)
```powershell
# Abrir pgAdmin ou executar SQL:
SELECT id, orderNumber, status, startDate, endDate 
FROM production_orders;
```
**Esperado:** Status = PROGRAMMING (não mais PENDING)

---

## 🚨 Se Algo Der Errado

### Erro: "Porta já em uso"
```powershell
# Matar todos os processos Node
Get-Process node | Stop-Process -Force

# Reiniciar cada serviço
```

### Erro: "Status inválido"
```powershell
# Regenerar Prisma Client
cd backend
npx prisma generate

# Reiniciar backend
```

### Frontend mostra status antigos
```powershell
# Limpar cache do navegador
# Ctrl + Shift + R (hard refresh)

# Ou limpar localStorage no console:
localStorage.clear();
window.location.reload();
```

---

## 📊 Dados de Teste Criados

O seed criou:

- ✅ 2 Usuários (admin e operador)
- ✅ 2 Itens (ITEM-001, ITEM-002)
- ✅ 2 Moldes (MOLD-001, MOLD-002)
- ✅ 1 Ordem de Produção (OP-2025-001) com status **PROGRAMMING**
- ✅ 1 Configuração de CLP com 4 registros

---

## 🎯 Fluxo de Teste Completo

```
1. Login → ✅
2. Ver ordem OP-2025-001 (Programação) → ✅
3. Ativar ordem → ✅
4. Tentar ativar outra (erro esperado) → ✅
5. Pausar ordem → ✅
6. Ativar outra ordem → ✅
7. Acionar sensor D33 → ✅
8. Ver apontamento automático → ✅
9. Encerrar ordem → ✅
10. Verificar data de término → ✅
```

---

## 📚 Documentação Adicional

- **Detalhes técnicos:** `NOVOS_STATUS_ORDEM_PRODUCAO.md`
- **Resumo executivo:** `RESUMO_NOVOS_STATUS.md`
- **Script SQL:** `backend/MIGRATION_PRODUCTION_STATUS.sql`

---

## ✨ Recursos Implementados

✅ **5 novos status** com cores e ícones  
✅ **Validação de ordem única ativa**  
✅ **Datas automáticas** (início/fim)  
✅ **Componente visual** para status  
✅ **Utilitários TypeScript** completos  
✅ **Integração com Data Collector**  
✅ **Documentação completa**  

---

**🎉 Sistema pronto para uso com os novos status!**

Qualquer dúvida, consulte a documentação ou abra uma issue no repositório.

