# 🔧 Como Configurar o Modo Data Collector

## 📋 Problema

Por padrão, o backend se conecta **diretamente ao CLP via Modbus**. Quando você usa o **Data Collector externo** (Raspberry Pi), ambos tentam conectar ao mesmo CLP, causando conflito.

## ✅ Solução

O backend agora suporta **dois modos de operação**:

### Modo 1: **Backend com Modbus Interno** (Padrão)
- Backend conecta diretamente ao CLP
- Não precisa de Data Collector separado
- Bom para: Desenvolvimento, testes locais

### Modo 2: **Data Collector Externo** (Raspberry Pi)
- Backend **NÃO** conecta ao CLP
- Data Collector (Raspberry Pi) faz a captação
- Backend apenas fornece APIs e recebe dados
- Bom para: Produção, múltiplos CLPs, escalabilidade

---

## 🔧 Como Configurar

### Para usar **Data Collector Externo** (Raspberry Pi):

1. **Editar `backend/.env`:**

```env
# Desabilitar Modbus interno do backend
USE_EXTERNAL_DATA_COLLECTOR=true

# Configurar API Key (mesma do data-collector)
DATA_COLLECTOR_API_KEY=minha-chave-secreta-super-segura
```

2. **Reiniciar backend:**

```bash
cd backend
npm run dev
```

3. **Verificar logs:**

Deve aparecer:
```
✅ Database connected successfully
✅ Serviço de produção inicializado
📡 Modbus interno DESABILITADO - usando Data Collector externo
🚀 Servidor MES iniciado com sucesso!
```

**✅ Agora o backend NÃO vai conectar ao CLP!**

---

### Para usar **Modbus Interno** (sem Raspberry Pi):

1. **Editar `backend/.env`:**

```env
# Habilitar Modbus interno do backend
USE_EXTERNAL_DATA_COLLECTOR=false

# Configurar CLP
PLC_HOST=192.168.1.15
PLC_PORT=502
PLC_UNIT_ID=1
PLC_REGISTER=33
```

2. **Reiniciar backend:**

```bash
cd backend
npm run dev
```

3. **Verificar logs:**

Deve aparecer:
```
✅ Database connected successfully
✅ Serviço de produção inicializado
📋 Configuração do CLP carregada: CLP Principal
🔌 Conectando ao CLP em 192.168.1.15:502...
✅ Conectado ao CLP com sucesso
```

**✅ Agora o backend conecta diretamente ao CLP!**

---

## 🏗️ Arquiteturas

### Arquitetura 1: Backend com Modbus Interno

```
┌─────────────────────────┐
│   Backend               │
│                         │
│   1. API REST           │
│   2. WebSocket          │
│   3. Modbus ────────────┼──> CLP
│   4. PostgreSQL         │
└─────────────────────────┘
```

**Quando usar:**
- Desenvolvimento local
- Teste com simulador
- 1 único CLP
- Sem Raspberry Pi

---

### Arquitetura 2: Data Collector Externo (Recomendado)

```
┌─────────────────────────┐
│   Raspberry Pi          │
│   (Data Collector)      │
│                         │
│   Modbus ───────────────┼──> CLP 1
│             ────────────┼──> CLP 2
│             ────────────┼──> CLP 3
└────────┬────────────────┘
         │ HTTP/REST
         │ API Key
         ↓
┌─────────────────────────┐
│   Backend               │
│                         │
│   1. API REST           │
│   2. WebSocket          │
│   3. PostgreSQL         │
└─────────────────────────┘
```

**Quando usar:**
- Produção
- Múltiplos CLPs
- Raspberry Pi dedicado
- Rede industrial isolada
- Escalabilidade

---

## 🔍 Verificar Configuração Atual

### Backend

```bash
# Ver variável de ambiente
cd backend
cat .env | grep USE_EXTERNAL_DATA_COLLECTOR
```

**Se aparecer:**
- `USE_EXTERNAL_DATA_COLLECTOR=true` → Modo Data Collector Externo
- `USE_EXTERNAL_DATA_COLLECTOR=false` → Modo Modbus Interno
- Nada → Padrão é `false` (Modbus Interno)

### Logs do Backend

```bash
cd backend
npm run dev
```

**Procure por:**
- `📡 Modbus interno DESABILITADO` → Data Collector Externo ativo
- `🔌 Conectando ao CLP` → Modbus Interno ativo

---

## 🚀 Cenários de Uso

### Cenário 1: Desenvolvimento Local

**Você quer:** Testar o sistema no seu PC

**Configure:**
```env
USE_EXTERNAL_DATA_COLLECTOR=false
```

**Rode:**
```bash
cd backend
npm run dev

cd frontend
npm start
```

---

### Cenário 2: Produção com Raspberry Pi

**Você quer:** Raspberry Pi coleta, Backend processa

**Backend (`.env`):**
```env
USE_EXTERNAL_DATA_COLLECTOR=true
DATA_COLLECTOR_API_KEY=producao-key-123
```

**Data Collector (`.env`):**
```env
BACKEND_API_URL=http://192.168.1.100:3001
API_KEY=producao-key-123
```

**Rode:**
```bash
# No servidor Backend
cd backend
npm run dev

# No Raspberry Pi
cd data-collector
npm install
npm run build
pm2 start ecosystem.config.js
```

---

## 📊 Comparação

| Característica | Modbus Interno | Data Collector Externo |
|----------------|----------------|------------------------|
| **Complexidade** | Simples | Moderada |
| **Escalabilidade** | 1 CLP | Múltiplos CLPs |
| **Hardware Extra** | Não | Raspberry Pi |
| **Isolamento** | Não | Sim |
| **Produção** | ❌ | ✅ |
| **Desenvolvimento** | ✅ | ❌ |

---

## ⚠️ Importante

**NUNCA** execute ambos ao mesmo tempo!

❌ **ERRADO:**
- Backend com `USE_EXTERNAL_DATA_COLLECTOR=false`
- Data Collector rodando no Raspberry Pi
- **Resultado:** Conflito! Ambos tentam ler do CLP

✅ **CORRETO:**
- Backend com `USE_EXTERNAL_DATA_COLLECTOR=true`
- Data Collector rodando no Raspberry Pi
- **Resultado:** Apenas Data Collector lê do CLP

---

## 🆘 Troubleshooting

### Backend continua conectando ao CLP

**Problema:** Variável de ambiente não está sendo lida

**Solução:**
```bash
cd backend
rm -rf .env
cp env.example .env
nano .env  # Editar e salvar
npm run dev
```

### Data Collector não consegue enviar dados

**Problema:** API Key diferente

**Solução:** Verificar se é a mesma em ambos:
```bash
# Backend
cat backend/.env | grep DATA_COLLECTOR_API_KEY

# Data Collector
cat data-collector/.env | grep API_KEY
```

Devem ser **idênticas**!

---

## 📚 Documentação Relacionada

- **ARQUITETURA_DATA_COLLECTOR.md** - Arquitetura completa
- **INSTALACAO_RASPBERRY_PI.md** - Instalar no Raspberry Pi
- **data-collector/INSTALACAO_RAPIDA.md** - Quick start

---

**✅ Configuração concluída!**

Agora você pode escolher qual modo usar dependendo do ambiente.

