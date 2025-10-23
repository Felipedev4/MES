# 🔧 Data Collector Timeout - Diagnóstico e Solução

## 📋 Problema Identificado

O **data-collector** está apresentando timeout ao tentar buscar ordens de produção ativas do backend:
```
❌ Todas as 3 tentativas falharam: timeout of 30000ms exceeded
```

## 🔍 Diagnóstico Realizado

### ✅ Backend está rodando
- Servidor rodando na porta **3001** (PID: 22036)
- Rotas configuradas corretamente

### ❌ Endpoint está com timeout
- Endpoint `/api/data-collector/production-orders/active` não responde em 30 segundos
- **Causa raiz**: Query do banco de dados está travando/demorando muito

## 🛠️ Correções Aplicadas

### 1. Timeout nas Queries do Backend

Adicionei timeout de **10 segundos** nas queries do Prisma para evitar travamento indefinido:

**Arquivo modificado**: `backend/src/controllers/dataCollectorController.ts`

#### Endpoints corrigidos:
- ✅ `getActiveProductionOrders()` - Busca ordens de produção ativas
- ✅ `getActivePlcConfigs()` - Busca configurações de CLP

#### Comportamento:
- Se a query demorar mais de 10s → retorna **array vazio** `[]`
- Evita timeout de 30s no data-collector
- Permite que o sistema continue funcionando mesmo com DB lento

### 2. Backend Reconstruído

```bash
cd backend
npm run build
```

## 🚀 Como Aplicar a Correção

### Passo 1: Reiniciar o Backend

No terminal onde o backend está rodando, pressione `Ctrl+C` e execute:

```powershell
cd C:\Empresas\Desenvolvimento\MES\backend
npm start
```

Ou para desenvolvimento (com auto-reload):
```powershell
npm run dev
```

### Passo 2: Verificar Logs do Backend

Após reiniciar, observe os logs para ver se aparece a mensagem de timeout:
```
⚠️  [DATA-COLLECTOR] Retornando array vazio devido ao timeout
```

### Passo 3: Reiniciar o Data Collector

```powershell
cd C:\Empresas\Desenvolvimento\MES\data-collector
npm start
```

## 🔎 Investigação Adicional Necessária

### Por que o banco de dados está lento?

**Possíveis causas:**

1. **PostgreSQL não está rodando**
   ```powershell
   # Verificar se PostgreSQL está ativo
   Get-Service -Name postgresql*
   ```

2. **String de conexão incorreta**
   - Verificar `DATABASE_URL` no arquivo `.env` do backend
   - Verificar se o PostgreSQL está acessível

3. **Banco de dados sem resposta**
   ```powershell
   # Testar conexão com o banco
   psql -U postgres -d mes_db
   ```

4. **Índices faltando** (improvável, já existem índices no schema)
   ```sql
   -- Verificar índices existentes
   SELECT * FROM pg_indexes WHERE tablename = 'production_orders';
   ```

5. **Conexões em pool esgotadas**
   - Muitas conexões CLOSE_WAIT detectadas (possível vazamento)
   - Reiniciar o backend pode resolver temporariamente

## 📊 Verificação do Status

### Testar o Endpoint Manualmente

```powershell
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3001/api/data-collector/production-orders/active" `
  -Method GET `
  -Headers @{"X-API-Key"="your-secret-api-key-here"; "Content-Type"="application/json"} `
  -TimeoutSec 15
```

**Resposta esperada** (em menos de 10s):
```json
[]
```
ou
```json
[
  {
    "id": 1,
    "orderNumber": "OP-001",
    "itemId": 1,
    "status": "ACTIVE",
    "producedQuantity": 100
  }
]
```

### Health Check do Backend

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health"
```

## 🔧 Solução Definitiva

### Opção 1: Reiniciar PostgreSQL

```powershell
# Parar PostgreSQL
net stop postgresql-x64-14  # Ajuste a versão

# Iniciar PostgreSQL
net start postgresql-x64-14
```

### Opção 2: Verificar/Criar arquivo .env do Backend

Criar `backend/.env` com:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mes_db"
PORT=3001
NODE_ENV=development
FRONTEND_URL=*
JWT_SECRET=your-jwt-secret-here
API_KEY=your-secret-api-key-here
USE_EXTERNAL_DATA_COLLECTOR=true
```

### Opção 3: Limpar Conexões do Banco

```sql
-- Conectar ao PostgreSQL como superusuário
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'mes_db' 
  AND pid <> pg_backend_pid();
```

## 📝 Próximos Passos

1. **Reiniciar backend** com as correções aplicadas
2. **Monitorar logs** para ver se aparecem timeouts
3. **Verificar DATABASE_URL** e conexão com PostgreSQL
4. **Reiniciar data-collector** e observar se funciona

## ⚙️ Configuração do Data Collector

Verificar arquivo `data-collector/.env`:
```env
BACKEND_API_URL=http://localhost:3001
API_KEY=your-secret-api-key-here
CONFIG_POLL_INTERVAL=30000
HEALTH_CHECK_PORT=3002
LOG_LEVEL=info
NODE_ENV=production
```

**Importante**: O `API_KEY` deve ser **IGUAL** no backend e no data-collector!

## 🆘 Se o Problema Persistir

Execute e compartilhe os resultados:

```powershell
# 1. Status do PostgreSQL
Get-Service -Name postgresql*

# 2. Testar conexão
cd backend
npm run prisma:studio  # Abre interface gráfica do Prisma

# 3. Ver logs do backend em detalhe
npm run dev  # Modo desenvolvimento com logs verbosos
```

---

## 📌 Resumo das Mudanças

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `backend/src/controllers/dataCollectorController.ts` | Timeout de 10s nas queries | ✅ Aplicado |
| `backend/dist/controllers/dataCollectorController.js` | Build atualizado | ✅ Compilado |

**Próxima ação**: Reiniciar o backend para aplicar as correções.

