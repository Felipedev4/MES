# 🔌 **FLUXO CORRETO: Teste de Conexão PLC**

## ✅ **Problema Resolvido**

**ANTES**: Frontend testava conexão PLC diretamente (❌ INCORRETO)
```
Frontend → PLC Modbus TCP
```

**AGORA**: Frontend → Backend → Data Collector → PLC (✅ CORRETO)
```
Frontend → Backend → Data Collector → PLC Modbus TCP
```

---

## 🎯 **Por que esta mudança é importante?**

| Problema | Solução |
|----------|---------|
| ❌ Frontend e PLC em redes diferentes | ✅ Data Collector na mesma rede do PLC |
| ❌ Firewall bloqueia acesso direto | ✅ Data Collector tem acesso autorizado |
| ❌ Teste não representa conexão real | ✅ Teste usa a mesma lógica de coleta |
| ❌ Erro: "Connection refused" no navegador | ✅ Teste executado no servidor |

---

## 🔄 **Fluxo Implementado**

### 1️⃣ **Frontend** (`PlcConfig.tsx`)
```typescript
// Chama Backend
await api.post('/plc-config/test-connection', {
  host: '192.168.1.15',
  port: 502,
  unitId: 1,
  timeout: 5000
});
```

### 2️⃣ **Backend** (`plcConfigController.ts`)
```typescript
// Redireciona para Data Collector
const DATA_COLLECTOR_URL = process.env.DATA_COLLECTOR_URL || 'http://localhost:3002';

const response = await fetch(`${DATA_COLLECTOR_URL}/test-connection`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ host, port, unitId, timeout })
});
```

### 3️⃣ **Data Collector** (`HealthCheck.ts`)
```typescript
// Endpoint /test-connection
this.app.post('/test-connection', async (req, res) => {
  const result = await this.plcPoolManager.testConnection({
    host, port, unitId, timeout
  });
  res.json(result);
});
```

### 4️⃣ **PlcPoolManager** (`PlcPoolManager.ts`)
```typescript
// Cria conexão temporária
async testConnection(config) {
  const tempConnection = new PlcConnection(tempConfig, this.apiClient);
  const connected = await tempConnection.connect();
  tempConnection.disconnect(); // Desconecta imediatamente
  
  return {
    success: connected,
    message: `Conexão estabelecida (Latência: ${latency}ms)`,
    latency
  };
}
```

### 5️⃣ **PlcConnection** (`PlcConnection.ts`)
```typescript
// Conexão Modbus TCP real
async connect() {
  this.socket = new net.Socket();
  this.client = new jsmodbus.ModbusTCPClient(this.socket, unitId);
  
  this.socket.connect(port, host);
  // ... retorna sucesso ou falha
}
```

---

## 📋 **Alterações Realizadas**

### ✅ **Data Collector**
- **`HealthCheck.ts`**:
  - Adicionado endpoint `POST /test-connection`
  - Adicionado `express.json()` middleware

- **`PlcPoolManager.ts`**:
  - Adicionado método `testConnection()`
  - Cria conexão temporária sem adicionar à pool

- **`ApiClient.ts`**:
  - Adicionado campo `timeDivisor` na interface `PlcConfigResponse`

### ✅ **Backend**
- **`plcConfigController.ts`**:
  - Modificado `testPlcConnection()` para chamar Data Collector
  - Adicionada tratativa de erro se Data Collector estiver offline

- **`.env`**:
  - Adicionada variável `DATA_COLLECTOR_URL=http://localhost:3002`

### ✅ **Frontend**
- ✅ **Nenhuma alteração necessária** (já chama `/plc-config/test-connection`)

---

## 🚀 **Testando**

### 1. **Reiniciar Serviços**
```batch
REINICIAR_SISTEMA_MES.bat
```

### 2. **Testar Conexão**
1. Abrir `http://localhost:3000/plc-config`
2. Editar configuração DVP-12SE
3. Clicar em "Testar Conexão"
4. Ver resultado: `✅ Conexão estabelecida com sucesso (Latência: Xms)`

### 3. **Verificar Logs**
**Data Collector:**
```
🔌 Testando conexão PLC: 192.168.1.15:502
✅ Teste de conexão bem-sucedido: 192.168.1.15:502 (1ms)
```

**Backend:**
```
POST /api/plc-config/test-connection 200
```

---

## 📊 **Resposta da API**

### ✅ **Sucesso**
```json
{
  "success": true,
  "message": "Conexão estabelecida com sucesso (Latência: 1ms)",
  "latency": 1
}
```

### ❌ **Falha**
```json
{
  "success": false,
  "message": "Não foi possível conectar ao PLC",
  "error": "Timeout ou recusa de conexão",
  "latency": 5000
}
```

### ⚠️ **Data Collector Offline**
```json
{
  "success": false,
  "error": "Data Collector não está disponível",
  "details": "O serviço de coleta de dados não está respondendo..."
}
```

---

## 🔧 **Configuração Necessária**

### **Backend** (`.env`)
```env
DATA_COLLECTOR_URL=http://localhost:3002
```

### **Data Collector** (`.env`)
```env
HEALTH_CHECK_PORT=3002
```

---

## ✅ **Benefícios**

| Benefício | Descrição |
|-----------|-----------|
| 🔒 **Segurança** | Frontend não precisa acesso direto ao PLC |
| 🌐 **Rede** | Funciona mesmo com frontend em rede externa |
| 🎯 **Precisão** | Teste usa a mesma lógica de produção |
| 📊 **Logs** | Testes registrados no Data Collector |
| ⚡ **Performance** | Latência real medida |

---

**✅ IMPLEMENTAÇÃO COMPLETA!** O teste de conexão agora passa corretamente pelo Data Collector!

